-- =====================================================================
-- COLDWORK ERP · Migración 0001 · Base: empresas, perfiles, miembros, roles
-- ---------------------------------------------------------------------
-- Todo dato de negocio tendrá empresa_id + RLS. Aunque hoy sea solo
-- COLDWORK, así queda listo para varias empresas sin rehacer nada.
-- =====================================================================

-- ---------- Tipos ----------
create type public.rol_empresa as enum ('dueno', 'admin', 'contador', 'trabajador');

-- ---------- Utilidad: updated_at automático ----------
create or replace function public.tocar_actualizado()
returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end $$;

-- ---------- Empresas ----------
create table public.empresas (
  id              uuid primary key default gen_random_uuid(),
  ruc             varchar(11) unique check (ruc ~ '^(10|15|17|20)[0-9]{9}$'),
  razon_social    text not null check (length(trim(razon_social)) > 0),
  nombre_comercial text,
  direccion       text,
  moneda          char(3) not null default 'PEN',
  activa          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);
create trigger empresas_actualizado before update on public.empresas
  for each row execute function public.tocar_actualizado();

-- ---------- Perfiles (1 por usuario de auth) ----------
create table public.perfiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  nombre          text not null default '',
  telefono        text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);
create trigger perfiles_actualizado before update on public.perfiles
  for each row execute function public.tocar_actualizado();

-- Crear perfil automáticamente al registrarse un usuario
create or replace function public.crear_perfil_usuario()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1), ''))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

-- ---------- Miembros (usuario ↔ empresa con rol) ----------
create table public.miembros (
  empresa_id      uuid not null references public.empresas (id) on delete cascade,
  usuario_id      uuid not null references auth.users (id) on delete cascade,
  rol             public.rol_empresa not null default 'trabajador',
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  primary key (empresa_id, usuario_id)
);
create index miembros_usuario_idx on public.miembros (usuario_id);

-- ---------- Funciones de permiso (las usan TODAS las políticas RLS) ----------
-- security definer: leen miembros sin chocar con su propia RLS.
create or replace function public.es_miembro(p_empresa uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid()) and m.activo
  );
$$;

create or replace function public.tiene_rol(p_empresa uuid, p_roles public.rol_empresa[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid())
      and m.activo and m.rol = any (p_roles)
  );
$$;

-- ---------- RLS ----------
alter table public.empresas enable row level security;
alter table public.perfiles enable row level security;
alter table public.miembros enable row level security;

-- Empresas: la ven sus miembros; la editan dueño/admin.
create policy empresas_ver on public.empresas for select to authenticated
  using (public.es_miembro(id));
create policy empresas_editar on public.empresas for update to authenticated
  using (public.tiene_rol(id, array['dueno', 'admin']::public.rol_empresa[]))
  with check (public.tiene_rol(id, array['dueno', 'admin']::public.rol_empresa[]));

-- Perfiles: cada uno el suyo; además, los compañeros de empresa pueden ver el nombre.
create policy perfiles_ver on public.perfiles for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.miembros yo
      join public.miembros otro on otro.empresa_id = yo.empresa_id
      where yo.usuario_id = (select auth.uid()) and yo.activo and otro.usuario_id = perfiles.id
    )
  );
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Miembros: los ve la empresa; los gestiona dueño/admin.
-- Un admin no puede tocar al dueño ni crear otro dueño (solo el dueño puede).
create policy miembros_ver on public.miembros for select to authenticated
  using (public.es_miembro(empresa_id));
create policy miembros_crear on public.miembros for insert to authenticated
  with check (
    public.tiene_rol(empresa_id, array['dueno']::public.rol_empresa[])
    or (public.tiene_rol(empresa_id, array['admin']::public.rol_empresa[]) and rol <> 'dueno')
  );
create policy miembros_editar on public.miembros for update to authenticated
  using (
    public.tiene_rol(empresa_id, array['dueno']::public.rol_empresa[])
    or (public.tiene_rol(empresa_id, array['admin']::public.rol_empresa[]) and rol <> 'dueno')
  )
  with check (
    public.tiene_rol(empresa_id, array['dueno']::public.rol_empresa[])
    or (public.tiene_rol(empresa_id, array['admin']::public.rol_empresa[]) and rol <> 'dueno')
  );
create policy miembros_borrar on public.miembros for delete to authenticated
  using (
    usuario_id <> (select auth.uid())
    and (
      public.tiene_rol(empresa_id, array['dueno']::public.rol_empresa[])
      or (public.tiene_rol(empresa_id, array['admin']::public.rol_empresa[]) and rol <> 'dueno')
    )
  );

-- ---------- RPC: crear empresa (quien la crea queda como dueño) ----------
create or replace function public.crear_empresa(p_razon_social text, p_ruc text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Debes iniciar sesión' using errcode = '42501';
  end if;
  insert into public.empresas (razon_social, ruc)
  values (trim(p_razon_social), nullif(trim(p_ruc), ''))
  returning id into v_id;
  insert into public.miembros (empresa_id, usuario_id, rol)
  values (v_id, (select auth.uid()), 'dueno');
  return v_id;
end $$;

-- ---------- RPC: mis empresas (para el selector de empresa en la app) ----------
create or replace function public.mis_empresas()
returns table (id uuid, razon_social text, ruc varchar, rol public.rol_empresa)
language sql stable security definer set search_path = '' as $$
  select e.id, e.razon_social, e.ruc, m.rol
  from public.miembros m join public.empresas e on e.id = m.empresa_id
  where m.usuario_id = (select auth.uid()) and m.activo and e.activa
  order by e.razon_social;
$$;

-- ---------- Permisos explícitos (no depender de "exponer tablas automáticamente") ----------
revoke all on public.empresas, public.perfiles, public.miembros from anon;
grant select, update on public.empresas to authenticated;
grant select, update on public.perfiles to authenticated;
grant select, insert, update, delete on public.miembros to authenticated;

revoke execute on function public.crear_empresa(text, text), public.mis_empresas(),
  public.es_miembro(uuid), public.tiene_rol(uuid, public.rol_empresa[]) from public, anon;
grant execute on function public.crear_empresa(text, text), public.mis_empresas(),
  public.es_miembro(uuid), public.tiene_rol(uuid, public.rol_empresa[]) to authenticated;
