import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Solo deja pasar con sesión; si no, manda a /login. */
export const conSesion: CanActivateFn = async (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperar();
  return auth.logueado() ? true : router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/** En /login: si ya hay sesión, manda al inicio. */
export const sinSesion: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperar();
  return auth.logueado() ? router.createUrlTree(['/']) : true;
};
