import type { Area } from '../../core/permisos/areas';

export interface ItemMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
  /** Área necesaria para verlo. Sin área: lo ve todo miembro. */
  area?: Area;
  /** Solo dueño y admin. */
  soloAdmin?: boolean;
}
export interface GrupoMenu {
  titulo: string;
  items: ItemMenu[];
}

/**
 * Menú lateral. Cada persona solo ve lo de sus áreas (dueño y admin ven todo).
 * Al agregar un módulo nuevo: añádelo aquí con su área y su ruta en el *.routes.ts del módulo.
 */
export const MENU: GrupoMenu[] = [
  {
    titulo: 'General',
    items: [{ etiqueta: 'Inicio', icono: 'pi pi-home', ruta: '/' }],
  },
  {
    titulo: 'Finanzas',
    items: [
      { etiqueta: 'Clientes y proveedores', icono: 'pi pi-users', ruta: '/terceros', area: 'administracion' },
      { etiqueta: 'Caja y bancos', icono: 'pi pi-wallet', ruta: '/caja-bancos', area: 'finanzas' },
      { etiqueta: 'Ventas', icono: 'pi pi-arrow-up-right', ruta: '/ventas', area: 'ventas' },
      { etiqueta: 'Compras', icono: 'pi pi-arrow-down-left', ruta: '/compras', area: 'logistica' },
      { etiqueta: 'Cuentas por cobrar', icono: 'pi pi-inbox', ruta: '/cuentas-cobrar', area: 'finanzas' },
      { etiqueta: 'Cuentas por pagar', icono: 'pi pi-send', ruta: '/cuentas-pagar', area: 'finanzas' },
    ],
  },
  {
    titulo: 'Contabilidad',
    items: [
      { etiqueta: 'Asientos y libros', icono: 'pi pi-book', ruta: '/contabilidad', area: 'contabilidad' },
      { etiqueta: 'Reportes', icono: 'pi pi-chart-bar', ruta: '/reportes', area: 'contabilidad' },
    ],
  },
  {
    titulo: 'Operaciones',
    items: [
      { etiqueta: 'Servicios técnicos', icono: 'pi pi-wrench', ruta: '/servicios', area: 'tecnica' },
      { etiqueta: 'Inventario', icono: 'pi pi-box', ruta: '/inventario', area: 'logistica' },
      { etiqueta: 'Asistencia y planilla', icono: 'pi pi-id-card', ruta: '/personal', area: 'personal' },
    ],
  },
  {
    titulo: 'Sistema',
    items: [
      { etiqueta: 'Equipo y accesos', icono: 'pi pi-users', ruta: '/equipo', soloAdmin: true },
      { etiqueta: 'Configuración', icono: 'pi pi-cog', ruta: '/configuracion', soloAdmin: true },
    ],
  },
];
