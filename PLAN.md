# COLDWORK ERP — Plan del proyecto

**Empresa:** COLDWORK, refrigeración industrial.
**Qué es:** un ERP completo para manejar la empresa: contabilidad, finanzas, personal, asistencias, servicios, inventario y reportes.
**Quiénes lo usan:** el dueño, los administradores y los trabajadores. Cada uno ve solo lo que su cargo le permite.
**Regla:** todo lo de COLDWORK vive dentro de la carpeta `PROYECTO COLD WORK`.

---

## Tecnología

| Parte | Qué usamos | Por qué |
|---|---|---|
| Frontend | **Angular** (standalone + signals) + **PrimeNG** | Decidido por el equipo. PrimeNG trae tablas, filtros y formularios de nivel ERP. |
| Base de datos y usuarios | **Supabase** (Postgres + Auth + RLS + Storage) | Decidido por el equipo. |
| Backend | **NestJS 12**: API REST `/api/v1`, sin estado y escalable horizontalmente | Decidido por el equipo. Verifica el JWT de Supabase y consulta con el token del usuario, así RLS sigue aplicando. La lógica contable atómica queda en funciones SQL o triggers, y NestJS orquesta e integra (SUNAT, PDF, correos, colas). |
| Despliegue | **Docker**: imagen `frontend` (nginx) + imagen `backend` (node, sin root) + GitHub Actions → GHCR | Las imágenes se arman la semana 1 y se publican desde el inicio. |
| Metodología | **Scrumban**, sprints de 1 semana | Ver la sección "Trabajo en equipo". |

La base de datos queda preparada con `empresa_id` desde el inicio. Así, si después quieres vender el sistema a otras empresas, no hay que rehacer nada.

---

## Módulos por etapas

| Etapa | Módulo | Contenido |
|---|---|---|
| **1** | **Contabilidad y finanzas** ← empezamos aquí | Ver el detalle abajo. |
| 2 | Personal y asistencias | Fichas de trabajadores, cargos y marcación. La forma de marcar (celular con GPS y foto, PIN en la oficina o QR) la decidimos en esa etapa. Tardanzas, faltas y horas extra. |
| 3 | Planilla | Sueldos, descuentos, AFP/ONP, gratificaciones, CTS y vacaciones. Se conecta con la contabilidad. |
| 4 | Servicios y clientes | Cotizaciones, órdenes de servicio y mantenimiento de equipos de frío, técnicos asignados y historial por equipo. |
| 5 | Inventario y almacén | Repuestos, gases refrigerantes, herramientas, kardex y stock mínimo. |
| 6 | Extras | Facturación electrónica SUNAT, libros electrónicos (PLE), IA, WhatsApp y panel del dueño. |

---

## Etapa 1 — Contabilidad y finanzas (detalle)

1. **Base:** datos de la empresa (RUC, razón social), usuarios, roles (dueño, contador, administrador, trabajador) y permisos.
2. **Terceros:** clientes y proveedores con RUC o DNI.
3. **Caja y bancos:** cuentas (caja chica, BCP, BBVA…), ingresos, egresos, transferencias y saldo de cada cuenta.
4. **Ventas y compras:** comprobantes (factura, boleta, recibo por honorarios) con cálculo automático del IGV 18 %.
5. **Cuentas por cobrar y por pagar:** quién te debe, a quién le debes, vencimientos y pagos parciales.
6. **Contabilidad:** plan contable PCGE. Cada venta, compra o pago genera su **asiento automático**. Incluye libro diario, libro mayor y balance de comprobación.
7. **Reportes:** registro de ventas, registro de compras, IGV del mes, estado de resultados, flujo de caja y panel resumen para el dueño.

---

## Trabajo en equipo (2 desarrolladores, 1 mes)

**Alcance realista para el mes:** la Etapa 1 completa, junto con el login, los roles y el despliegue. El resto de etapas va después.

**Metodología: Scrumban**
- Tablero en GitHub Projects con columnas Por hacer → En curso (máximo 2 por persona) → En revisión → Hecho.
- Sprints de 1 semana. Lunes: planificación (30 min). Viernes: demo y retrospectiva (30 min). Cada día: reunión corta de 10 min.
- Reparto por módulo completo (pantalla + SQL), no "uno front y otro back", para no bloquearse. Una sola persona aprueba los cambios de esquema.
- Git: rama `main` protegida, ramas `feature/...`, pull request revisado por el otro y commits con formato `feat:` / `fix:`.
- Definición de "Hecho": funciona, está revisado, la migración está en git y está desplegado en el entorno de prueba.

| Sprint | Entregable |
|---|---|
| 1 | Preparación (repositorio, Docker, CI, migraciones), esquema de BD, login y roles, empresa, terceros, plan contable PCGE |
| 2 | Caja y bancos, ventas y compras con IGV |
| 3 | Cuentas por cobrar y por pagar, asientos automáticos, libro diario y libro mayor |
| 4 | Reportes, panel del dueño, pruebas, carga de datos reales y margen para imprevistos |

---

## Antes de programar (semana 1)

1. **Supabase:** una organización con los 2 desarrolladores como miembros. Proyectos `coldwork-dev` y `coldwork-prod`.
2. **Supabase CLI:** `supabase init` y migraciones en `supabase/migrations/` dentro de git. Base de datos local con `supabase start`, que también usa Docker. Nunca se cambia el esquema a mano en producción.
3. **Repositorio:** GitHub, `.gitignore`, `.env.example`, ESLint + Prettier y reglas de rama.
4. **Docker:** `Dockerfile` en dos fases (build con node, luego nginx), `nginx.conf` con retorno a `index.html`, `.dockerignore` y configuración leída al arrancar (`config.json`). Así una misma imagen sirve para dev y para prod.
5. **CI/CD:** GitHub Actions que corre lint → test → build → imagen en GHCR → despliegue.
6. **Publicar un "hola mundo" en la nube la semana 1**, no al final.
7. **Diagrama de la BD** (tablas contables) aprobado por los dos antes de programar pantallas.

---

## Estructura de la carpeta

```
PROYECTO COLD WORK/
├── PLAN.md            ← este archivo
├── supabase/          ← config + migrations/ (Supabase CLI)
├── frontend/          ← Angular: core, layout, shared, modules/<módulo>/{views,components,services,models}
├── backend/           ← NestJS: config, common, database, modules/<módulo>/{controllers,services,dto,entities}
├── .github/workflows/ ← CI/CD
└── docs/              ← guías, diagrama de BD, manuales
```

---

## Lo que necesito de ti para arrancar

1. Crear un **proyecto nuevo en Supabase** llamado `coldwork`.
2. Pasarme la **URL del proyecto** y la **publishable key** (antes se llamaba *anon key*).
   **Nunca** me pases la *secret key* ni la contraseña de la base de datos.
