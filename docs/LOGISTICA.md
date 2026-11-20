# Módulo Almacén y logística

## Cómo crear las tablas en Supabase

Todo el SQL está en **`supabase/migrations/20261120000001_logistica.sql`**.
Supabase → **SQL Editor** → pega el archivo completo → **Run**. Se ejecuta una sola vez.
(No lo crees a mano tabla por tabla: también crea las reglas RLS y las funciones que mueven el stock.)

Requiere que ya estén las migraciones 0001 (empresas) y 0002 (equipo y áreas).

## Tablas

| Tabla | Para qué | Columnas principales |
|---|---|---|
| `terceros` | Proveedores (y luego clientes) | tipo_documento, numero_documento, razon_social, es_proveedor, es_cliente, rubro, contacto, telefono, correo, direccion, dias_credito, calificacion (1-5), activo |
| `almacenes` | Dónde se guarda el stock | codigo (ALM-01), nombre, tipo (`principal` / `movil` / `obra`), direccion, responsable, activo |
| `productos` | Catálogo | sku, nombre, descripcion, tipo (`repuesto` / `gas_refrigerante` / `herramienta` / `insumo` / `equipo`), marca, unidad, stock_minimo, costo_promedio, activo |
| `stock` | Cantidad por producto y almacén | producto_id, almacen_id, cantidad (nunca negativa) |
| `ordenes_compra` | Pedido al proveedor | numero, proveedor_id, almacen_id, estado (`borrador` → `enviada` → `parcial` → `recibida` / `anulada`), fecha, fecha_entrega, notas |
| `ordenes_compra_items` | Productos del pedido | orden_id, producto_id, cantidad, cantidad_recibida, costo_unitario |
| `llegadas` | Entrada de producto | numero, almacen_id, proveedor_id, orden_id, guia_remision, comprobante, notas |
| `salidas` | Salida o despacho | numero, almacen_id, motivo (`servicio_tecnico` / `venta` / `consumo_interno` / `merma` / `transferencia`), almacen_destino_id, destino, responsable, referencia |
| `movimientos` | Kardex: cada entrada y salida | producto_id, almacen_id, tipo, cantidad, costo_unitario, saldo, llegada_id / salida_id |

Todas llevan `empresa_id` y RLS: solo las ve quien tiene el área **Logística** (el dueño y el admin siempre).

## Funciones (las llama el backend)

| Función | Qué hace en una sola transacción |
|---|---|
| `registrar_llegada` | Suma stock, recalcula el costo promedio ponderado, escribe el kardex y actualiza el avance de la OC |
| `registrar_salida` | Valida que alcance el stock, lo resta, escribe el kardex; en transferencia lo suma al destino |
| `crear_orden_compra` / `cambiar_estado_oc` | Crea la OC con su número correlativo, la envía o la anula |
| `resumen_logistica` | Indicadores del panel |

`stock` y `movimientos` **no se editan a mano**. Si quieres cargar un saldo inicial, hazlo como una "Llegada → Compra directa" desde la app, así queda en el kardex.

## Orden recomendado para cargar datos

1. Almacenes (al menos el principal y una unidad móvil por técnico).
2. Proveedores.
3. Productos, con su stock mínimo.
4. Saldo inicial: Llegadas → "Compra directa u otro ingreso".

## Dónde está el código

```
backend/src/modules/logistica/
├── controllers/   rutas HTTP  /api/v1/logistica/...
├── services/      reglas de negocio
├── repositories/  consultas a Supabase
├── dto/           lo que entra y sale de la API (validado)
├── entities/      forma de las tablas
└── logistica.module.ts

frontend/src/app/modules/logistica/
├── logistica.routes.ts · logistica.theme.scss
├── models/        interfaces (= DTOs del backend)
├── services/      llamadas a la API + LogisticaStore (catálogos compartidos)
├── views/         panel, inventario, llegadas, salidas, ordenes-compra, proveedores, almacenes
└── components/    asistentes de llegada y salida, kardex, diálogos, gráficos
```
