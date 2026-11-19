-- =====================================================================
-- COLDWORK ERP · Migración 0002 · Equipo: áreas de acceso e invitaciones
-- ---------------------------------------------------------------------
-- · Cada miembro tiene una lista de ÁREAS (puede tener varias).
--   Dueño y admin ven todas las áreas siempre.
-- · El dueño (o un admin) invita por correo. Cuando esa persona crea su
--   cuenta (correo o Google) con ESE correo y lo tiene confirmado, entra
--   sola a la empresa con las áreas asignadas. No se usa la secret key.
-- =====================================================================

-- ---------- Áreas ----------
create type public.area_empresa as enum (
  'administracion',  -- clientes/proveedores, datos generales
  'contabilidad',    -- asientos, libros, reportes
  'finanzas',        -- caja y bancos, cuentas por cobrar y pagar
  'ventas',          -- ventas
  'logistica',       -- compras, inventario
  'tecnica',         -- servicios técnicos de refrigeración
  'personal'         -- asistencia y planilla
);

alter table public.miembros
  add column areas public.area_empresa[] not null default '{}';

-- ¿El usuario actual puede entrar a esta área de la empresa?
create or replace function public.tiene_area(p_empresa uuid, p_area public.area_empresa)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid()) and m.activo
      and (m.rol in ('dueno', 'admin') or p_area = any (m.areas))
  );
$$;

-- ---------- Invitaciones ----------
create table public.invitaciones (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas (id) on delete cascade,
  correo      text not null check (correo = lower(trim(correo)) and correo ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nombre      text,
  rol         public.rol_empresa not null default 'trabajador' check (rol <> 'dueno'),
  areas       public.area_empresa[] not null default '{}',
  creado_por  uuid references auth.users (id) on delete set null default auth.uid(),
  creado_en   timestamptz not null default now(),
  unique (empresa_id, correo)
);
create index invitaciones_correo_idx on public.invitaciones (correo);

alter table public.invitaciones enable row level security;

-- Las ven y gestionan dueño/admin. Un admin solo invita trabajadores.
create policy invitaciones_ver on public.invitaciones for select to authenticated
  using (public.tiene_rol(empresa_id, array['dueno', 'admin']::public.rol_empresa[]));
create policy invitaciones_crear on public.invitaciones for insert to authenticated
  with check (
    public.tiene_rol(empresa_id, array['dueno']::public.rol_empresa[])
    or (public.tiene_rol(empresa_id, array['admin']::public.rol_empresa[]) and rol = 'trabajador')
  );
create policy invitaciones_editar on public.invitaciones for update to authenticated
  using (public.tiene_rol(empresa_id, array['dueno', 'admin']::public.rol_empresa[]))
  with check (
    public.tiene_rol(empresa_id, array['dueno']::public.rol_empresa[])
    or (public.tiene_rol(empresa_id, array['admin']::public.rol_empresa[]) and rol = 'trabajador')
  );
create policy invitaciones_borrar on public.invitaciones for delete to authenticated
  using (public.tiene_rol(empresa_id, array['dueno', 'admin']::public.rol_empresa[]));

-- ---------- RPC: aceptar mis invitaciones ----------
-- Une al usuario actual a las empresas que invitaron a SU correo confirmado.
-- Devuelve cuántas aceptó. La app la llama antes de listar "mis empresas".
create or replace function public.aceptar_invitaciones()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_correo text;
  v_total  integer;
begin
  select lower(u.email) into v_correo
  from auth.users u
  where u.id = (select auth.uid()) and u.email_confirmed_at is not null;

  if v_correo is null then
    return 0;  -- sin sesión o correo sin confirmar: no se acepta nada
  end if;

  insert into public.miembros (empresa_id, usuario_id, rol, areas)
  select i.empresa_id, (select auth.uid()), i.rol, i.areas
  from public.invitaciones i
  where i.correo = v_correo
  on conflict (empresa_id, usuario_id) do nothing;
  get diagnostics v_total = row_count;

  delete from public.invitaciones where correo = v_correo;
  return v_total;
end $$;

-- ---------- RPC: mis empresas (ahora con mis áreas) ----------
drop function public.mis_empresas();
create function public.mis_empresas()
returns table (id uuid, razon_social text, ruc varchar, rol public.rol_empresa, areas public.area_empresa[])
language sql stable security definer set search_path = '' as $$
  select e.id, e.razon_social, e.ruc, m.rol, m.areas
  from public.miembros m join public.empresas e on e.id = m.empresa_id
  where m.usuario_id = (select auth.uid()) and m.activo and e.activa
  order by e.razon_social;
$$;

-- ---------- RPC: equipo de la empresa (nombre + correo), solo dueño/admin ----------
create or replace function public.equipo_empresa(p_empresa uuid)
returns table (
  usuario_id uuid, nombre text, correo text, rol public.rol_empresa,
  areas public.area_empresa[], activo boolean, creado_en timestamptz
)
language sql stable security definer set search_path = '' as $$
  select m.usuario_id, coalesce(p.nombre, ''), u.email::text, m.rol, m.areas, m.activo, m.creado_en
  from public.miembros m
  join auth.users u on u.id = m.usuario_id
  left join public.perfiles p on p.id = m.usuario_id
  where m.empresa_id = p_empresa
    and public.tiene_rol(p_empresa, array['dueno', 'admin']::public.rol_empresa[])
  order by (m.rol = 'dueno') desc, m.creado_en;
$$;

-- ---------- Permisos ----------
revoke all on public.invitaciones from anon;
grant select, insert, update, delete on public.invitaciones to authenticated;

revoke execute on function public.tiene_area(uuid, public.area_empresa), public.aceptar_invitaciones(),
  public.mis_empresas(), public.equipo_empresa(uuid) from public, anon;
grant execute on function public.tiene_area(uuid, public.area_empresa), public.aceptar_invitaciones(),
  public.mis_empresas(), public.equipo_empresa(uuid) to authenticated;
