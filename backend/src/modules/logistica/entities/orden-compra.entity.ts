export enum EstadoOc {
  Borrador = 'borrador',
  Enviada = 'enviada',
  Parcial = 'parcial',
  Recibida = 'recibida',
  Anulada = 'anulada',
}

/** Entidad `public.ordenes_compra` con proveedor, almacén e ítems (select con join). */
export interface FilaOrdenCompra {
  id: string;
  numero: number;
  estado: EstadoOc;
  fecha: string;
  fecha_entrega: string | null;
  moneda: string;
  notas: string | null;
  creado_en: string;
  proveedor: {
    id: string;
    razon_social: string;
    numero_documento: string;
  } | null;
  almacen: { id: string; nombre: string; codigo: string } | null;
  items: {
    id: string;
    producto_id: string;
    cantidad: number;
    cantidad_recibida: number;
    costo_unitario: number;
    producto: { sku: string; nombre: string; unidad: string } | null;
  }[];
}

export const SELECT_ORDEN_COMPRA = `id, numero, estado, fecha, fecha_entrega, moneda, notas, creado_en,
  proveedor:terceros!ordenes_compra_proveedor_id_fkey(id, razon_social, numero_documento),
  almacen:almacenes!ordenes_compra_almacen_id_fkey(id, nombre, codigo),
  items:ordenes_compra_items(id, producto_id, cantidad, cantidad_recibida, costo_unitario,
    producto:productos(sku, nombre, unidad))`;
