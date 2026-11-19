import { Routes } from '@angular/router';

/** Rutas del módulo Empresas (dentro del shell). */
export const EMPRESAS_ROUTES: Routes = [
  {
    path: 'empresa/nueva',
    loadComponent: () => import('./views/crear-empresa/crear-empresa').then((m) => m.CrearEmpresa),
  },
];
