# SISTEMA DE COLDWORK · ERP

ERP para COLDWORK, empresa de refrigeración industrial. El plan y las etapas están en [PLAN.md](PLAN.md).

| Parte | Carpeta | Tecnología |
|---|---|---|
| Frontend | [`frontend/`](frontend) | Angular 22 (standalone + signals) + PrimeNG 22 |
| Backend | [`backend/`](backend) | NestJS 12: API REST `/api/v1`, sin estado, escalable horizontalmente |
| Base de datos | [`supabase/`](supabase) | Supabase: Postgres + Auth + RLS, migraciones versionadas |
| Despliegue | `Dockerfile` en cada carpeta + [`docker-compose.yml`](docker-compose.yml) + [CI](.github/workflows/ci.yml) | Docker (nginx / node) + GitHub Actions → GHCR |

## Arquitectura

```
 Navegador (frontend Angular)
   │  1. Inicia sesión con Supabase Auth → recibe un JWT
   │  2. Llama al backend con  Authorization: Bearer <JWT>  +  X-Empresa-Id
   ▼
 Backend NestJS  (N instancias detrás de un balanceador; no guarda estado)
   │  · ThrottlerGuard → límite de peticiones por IP
   │  · AuthGuard      → verifica el JWT localmente con JWKS (sin llamar a Supabase)
   │  · EmpresaGuard   → miembro de la empresa + rol  @RequiereEmpresa(Rol.Dueno, Rol.Admin)
   │  · ValidationPipe → valida los DTOs y descarta campos no declarados
   │  · Controller → Service → Supabase
   ▼
 Supabase Postgres
      · El backend consulta CON EL TOKEN DEL USUARIO → RLS aplica siempre
      · Funciones SQL / triggers → reglas contables atómicas (asientos, saldos)
```

**Por qué escala:** no guarda estado (la sesión vive en el JWT), el JWT se verifica localmente con claves en caché, no mantiene un pool de conexiones propio (PostgREST lo gestiona), tiene sondas `/api/health` y `/api/health/ready`, cierre ordenado con SIGTERM, logs JSON con `x-request-id` y rutas versionadas (`/api/v1`). Cuando haga falta: Redis para el throttler y la caché compartidos, y BullMQ para tareas pesadas (PDF, SUNAT, correos).

**Seguridad en capas:** el backend **nunca** usa la secret key. Aunque tuviera un bug, RLS en Postgres sigue impidiendo ver datos de otra empresa.

## Estructura de carpetas

```
SISTEMA-DE-COLDWORK/
├── frontend/                        Angular
│   ├── src/app/
│   │   ├── core/                    servicios globales (una sola instancia)
│   │   │   ├── api/
│   │   │   │   ├── services/        api.service.ts (cliente HTTP del backend)
│   │   │   │   └── interceptors/    api.interceptor.ts (token + X-Empresa-Id)
│   │   │   ├── auth/
│   │   │   │   ├── services/        auth.service.ts (sesión Supabase)
│   │   │   │   └── guards/          auth.guards.ts (conSesion / sinSesion)
│   │   │   ├── empresa/services/    empresa-actual.service.ts
│   │   │   ├── supabase/services/   supabase.service.ts
│   │   │   ├── config/              runtime-config.ts (lee /config.json)
│   │   │   ├── theme/               tema de PrimeNG
│   │   │   └── utils/               montos.ts (IGV en céntimos)
│   │   ├── layout/shell/            menú lateral + barra superior
│   │   ├── shared/components/       emoji (Flaticon por link), proximamente
│   │   └── modules/                 UN MÓDULO POR CARPETA
│   │       ├── auth/views/login/              vista (ts + html + scss)
│   │       ├── inicio/views/inicio/           vista
│   │       └── empresas/
│   │           ├── models/          empresa.model.ts (interfaces = DTOs del backend)
│   │           ├── services/        empresas.service.ts (llamadas al backend)
│   │           ├── views/           páginas con ruta
│   │           └── components/      piezas reutilizables del módulo
│   ├── public/config.json           configuración en tiempo de ejecución (local)
│   ├── docker/40-runtime-config.sh  genera config.json en el contenedor
│   ├── nginx.conf
│   └── Dockerfile
│
├── backend/                         NestJS
│   ├── src/
│   │   ├── main.ts / app.module.ts
│   │   ├── config/                  env.ts (validación zod) · app.setup.ts (helmet, CORS, Swagger…)
│   │   ├── common/                  lo compartido por todos los módulos (index.ts exporta todo)
│   │   │   ├── decorators/          @Publica @RequiereEmpresa @Usuario @Empresa
│   │   │   ├── enums/               rol.enum.ts
│   │   │   ├── interfaces/          UsuarioActual, EmpresaActual, PeticionAutenticada
│   │   │   └── utils/               errores-supabase.ts (error BD → HTTP)
│   │   ├── database/supabase/       SupabaseService (cliente por usuario → RLS)
│   │   └── modules/                 UN MÓDULO POR CARPETA
│   │       ├── auth/
│   │       │   ├── guards/          auth.guard.ts · empresa.guard.ts
│   │       │   └── services/        verificador-jwt.service.ts
│   │       ├── health/controllers/  health.controller.ts
│   │       └── empresas/
│   │           ├── controllers/     empresas.controller.ts (rutas HTTP)
│   │           ├── services/        empresas.service.ts (lógica de negocio)
│   │           ├── dto/             crear-empresa · actualizar-empresa · empresa-respuesta
│   │           ├── entities/        empresa.entity.ts · miembro.entity.ts (tablas)
│   │           └── empresas.module.ts
│   ├── test/                        pruebas e2e
│   └── Dockerfile
│
├── supabase/
│   ├── migrations/                  cambios de BD versionados (nunca editar a mano en prod)
│   └── seed.sql                     datos de prueba solo para local
├── .github/workflows/ci.yml         lint + test + build + migraciones + imágenes Docker
├── docker-compose.yml               frontend + backend con las imágenes de producción
└── PLAN.md                          plan, etapas y sprints
```

## Primera vez (cada desarrollador)

Requisitos: **Node 24**, **Git** y **Docker Desktop** (lo usa la base de datos local de Supabase).

```powershell
cd frontend; npm install; cd ..\backend; npm install; copy .env.example .env
```

## Día a día (3 terminales)

**1. Base de datos local** (raíz del proyecto):
```powershell
npx supabase start
```
Copia la `Publishable key` que muestra en `frontend/public/config.json` (`supabaseKey`) y en `backend/.env` (`SUPABASE_KEY`).
Usuario de prueba: `dueno@coldwork.test` / `coldwork123`.

**2. Backend** (desde `backend/`):
```powershell
npm run start:dev
```
Queda en http://localhost:3000/api. La documentación Swagger está en http://localhost:3000/api/docs.

**3. Frontend** (desde `frontend/`):
```powershell
npm start
```
Abre http://localhost:4200

## Agregar un módulo nuevo (ej. Ventas)

1. **BD:** crea la migración con `npx supabase migration new ventas`. Las tablas llevan `empresa_id` y RLS con `es_miembro()` / `tiene_rol()`.
2. **Backend:** copia la estructura de `backend/src/modules/empresas/`:
   - `entities/venta.entity.ts`: forma de la tabla (snake_case)
   - `dto/crear-venta.dto.ts`, `dto/venta-respuesta.dto.ts`: entrada y salida validadas (camelCase)
   - `services/ventas.service.ts`: lógica, siempre con `supabase.paraUsuario(u.token)`
   - `controllers/ventas.controller.ts`: rutas con `@RequiereEmpresa(...)`
   - `ventas.module.ts`: regístralo en `app.module.ts`
3. **Frontend:** copia la estructura de `frontend/src/app/modules/empresas/`:
   - `models/venta.model.ts` (igual a los DTOs), `services/ventas.service.ts` (usa `ApiService`)
   - `views/ventas-lista/`, `views/venta-form/` (ts + html + scss) y `components/` si hace falta
   - la ruta en `app.routes.ts` y la opción en `layout/shell/menu.ts`

## Antes de abrir un PR

Desde `backend/`:
```powershell
npm run lint; npm test; npm run test:e2e; npm run build
```
Desde `frontend/`:
```powershell
npx ng lint; npx ng test --watch=false; npx ng build
```

## Probar las imágenes Docker de producción

```powershell
copy .env.example .env
docker compose up --build
```
Edita `.env` antes de levantar. El frontend queda en http://localhost:8080 y el backend en http://localhost:3000/api/health.

## Reglas del equipo

- `main` protegida. Se trabaja en ramas `feature/...` y se integra por PR revisado por el otro.
- Commits: `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`
- Toda tabla de negocio lleva `empresa_id` + RLS. Toda ruta de negocio lleva `@RequiereEmpresa`.
- Rutas públicas solo con `@Publica()`. Por defecto **todo exige token**.
- La lógica contable atómica va en funciones SQL o triggers; la orquestación va en NestJS.
- Emojis e íconos ilustrados: solo de **Flaticon** por link (`<app-emoji nombre="saludo" />`, catálogo en `shared/components/emoji/iconos.ts`). Nunca como carácter. Cada ícono nuevo se anota en [docs/CREDITOS.md](docs/CREDITOS.md).
- **Nunca** se sube a git la secret key, la contraseña de la BD ni un `.env`.
