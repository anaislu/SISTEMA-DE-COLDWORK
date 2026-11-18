export interface ItemMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
}
export interface GrupoMenu {
  titulo: string;
  items: ItemMenu[];
}

/** Menú lateral. Al agregar un módulo nuevo, se añade aquí y en app.routes.ts. */
export const MENU: GrupoMenu[] = [
  {
    titulo: 'General',
    items: [{ etiqueta: 'Inicio', icono: 'pi pi-home', ruta: '/' }],
  },
  {
    titulo: 'Finanzas',
    items: [
      { etiqueta: 'Clientes y proveedores', icono: 'pi pi-users', ruta: '/terceros' },
      { etiqueta: 'Caja y bancos', icono: 'pi pi-wallet', ruta: '/caja-bancos' },
      { etiqueta: 'Ventas', icono: 'pi pi-arrow-up-right', ruta: '/ventas' },
      { etiqueta: 'Compras', icono: 'pi pi-arrow-down-left', ruta: '/compras' },
      { etiqueta: 'Cuentas por cobrar', icono: 'pi pi-inbox', ruta: '/cuentas-cobrar' },
      { etiqueta: 'Cuentas por pagar', icono: 'pi pi-send', ruta: '/cuentas-pagar' },
    ],
  },
  {
    titulo: 'Contabilidad',
    items: [
      { etiqueta: 'Asientos y libros', icono: 'pi pi-book', ruta: '/contabilidad' },
      { etiqueta: 'Reportes', icono: 'pi pi-chart-bar', ruta: '/reportes' },
    ],
  },
  {
    titulo: 'Sistema',
    items: [{ etiqueta: 'Configuración', icono: 'pi pi-cog', ruta: '/configuracion' }],
  },
];
