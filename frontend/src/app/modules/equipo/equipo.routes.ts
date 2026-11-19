import { Routes } from '@angular/router';
import { soloAdmin } from '../../core/permisos/permisos.guards';

/** Rutas del módulo Equipo (dentro del shell). Solo dueño y admin. */
export const EQUIPO_ROUTES: Routes = [
  {
    path: 'equipo',
    canActivate: [soloAdmin],
    loadComponent: () => import('./views/equipo/equipo').then((m) => m.Equipo),
  },
];
