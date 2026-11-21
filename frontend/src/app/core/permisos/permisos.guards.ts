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

/** Solo dueño y admin (Configuración). */
export const soloAdmin: CanActivateFn = async () => {
  const empresa = inject(EmpresaActualService);
  const router = inject(Router);
  await empresa.asegurar().catch(() => []);
  return empresa.esAdmin() ? true : router.createUrlTree(['/']);
};

/** Solo el dueño / CEO (Equipo y accesos: nadie más da accesos). */
export const soloDueno: CanActivateFn = async () => {
  const empresa = inject(EmpresaActualService);
  const router = inject(Router);
  await empresa.asegurar().catch(() => []);
  return empresa.esDueno() ? true : router.createUrlTree(['/']);
};
