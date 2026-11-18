import { Routes } from '@angular/router';
import { conSesion, sinSesion } from './core/auth/guards/auth.guards';

/**
 * Cada módulo del ERP es una carpeta en src/app/modules/<modulo>/views y se
 * carga solo cuando se entra (lazy loading). Las rutas que aún no existen
 * muestran "Próximamente".
 */
const proximamente = () => import('./shared/components/proximamente/proximamente').then((m) => m.Proximamente);

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [sinSesion],
    loadComponent: () => import('./modules/auth/views/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [sinSesion],
    loadComponent: () => import('./modules/auth/views/registro/registro').then((m) => m.Registro),
  },
  {
    path: '',
    canActivate: [conSesion],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./modules/inicio/views/inicio/inicio').then((m) => m.Inicio) },
      {
        path: 'empresa/nueva',
        loadComponent: () =>
          import('./modules/empresas/views/crear-empresa/crear-empresa').then((m) => m.CrearEmpresa),
      },
      // Etapa 1 — Contabilidad y finanzas
      { path: 'terceros', loadComponent: proximamente, data: { titulo: 'Clientes y proveedores' } },
      { path: 'caja-bancos', loadComponent: proximamente, data: { titulo: 'Caja y bancos' } },
      { path: 'ventas', loadComponent: proximamente, data: { titulo: 'Ventas' } },
      { path: 'compras', loadComponent: proximamente, data: { titulo: 'Compras' } },
      { path: 'cuentas-cobrar', loadComponent: proximamente, data: { titulo: 'Cuentas por cobrar' } },
      { path: 'cuentas-pagar', loadComponent: proximamente, data: { titulo: 'Cuentas por pagar' } },
      { path: 'contabilidad', loadComponent: proximamente, data: { titulo: 'Contabilidad' } },
      { path: 'reportes', loadComponent: proximamente, data: { titulo: 'Reportes' } },
      { path: 'configuracion', loadComponent: proximamente, data: { titulo: 'Configuración' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
