/**
 * Áreas de trabajo (igual al enum `area_empresa` de Postgres y `Area` del backend).
 * El dueño asigna a cada persona una o varias. Dueño y admin ven todas.
 */
export type Area = 'administracion' | 'contabilidad' | 'finanzas' | 'ventas' | 'logistica' | 'tecnica' | 'personal';

export type Rol = 'dueno' | 'admin' | 'contador' | 'trabajador';

export interface InfoArea {
  clave: Area;
  nombre: string;
  descripcion: string;
  icono: string;
}

/** Catálogo para pantallas (Equipo) y menú. El orden es el que se muestra. */
export const AREAS: readonly InfoArea[] = [
  { clave: 'administracion', nombre: 'Administración', descripcion: 'Clientes, proveedores y datos generales', icono: 'pi pi-briefcase' },
  { clave: 'contabilidad', nombre: 'Contabilidad', descripcion: 'Asientos, libros y reportes', icono: 'pi pi-book' },
  { clave: 'finanzas', nombre: 'Finanzas', descripcion: 'Caja, bancos, cuentas por cobrar y pagar', icono: 'pi pi-wallet' },
  { clave: 'ventas', nombre: 'Ventas', descripcion: 'Cotizaciones y ventas', icono: 'pi pi-shopping-cart' },
  { clave: 'logistica', nombre: 'Logística', descripcion: 'Compras e inventario', icono: 'pi pi-box' },
  { clave: 'tecnica', nombre: 'Área técnica', descripcion: 'Servicios de refrigeración y mantenimiento', icono: 'pi pi-wrench' },
  { clave: 'personal', nombre: 'Personal', descripcion: 'Asistencia y planilla', icono: 'pi pi-id-card' },
];

export const NOMBRE_ROL: Record<Rol, string> = {
  dueno: 'Dueño',
  admin: 'Administrador',
  contador: 'Contador',
  trabajador: 'Trabajador',
};

export function nombreArea(a: Area): string {
  return AREAS.find((x) => x.clave === a)?.nombre ?? a;
}

/** Dueño y admin entran a todo. */
export function veTodo(rol: Rol | null | undefined): boolean {
  return rol === 'dueno' || rol === 'admin';
}
