import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EmpresaActualService } from '../empresa/services/empresa-actual.service';
import type { Area } from './areas';

/**
 * Protege una ruta por área: `canActivate: [conArea('ventas')]`.
 * Sin acceso → vuelve al inicio. (El backend también lo exige con @RequiereArea.)
 */
export const conArea =
  (area: Area): CanActivateFn =>
  async () => {
    const empresa = inject(EmpresaActualService);
    const router = inject(Router);
    await empresa.asegurar().catch(() => []);
    return empresa.puede(area) ? true : router.createUrlTree(['/'], { queryParams: { sinAcceso: area } });
  };

/** Solo dueño y admin (Equipo, Configuración). */
export const soloAdmin: CanActivateFn = async () => {
  const empresa = inject(EmpresaActualService);
  const router = inject(Router);
  await empresa.asegurar().catch(() => []);
  return empresa.esAdmin() ? true : router.createUrlTree(['/']);
};
