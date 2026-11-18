import { SetMetadata } from '@nestjs/common';
import type { Rol } from '../enums/rol.enum.js';

export const ROLES_PERMITIDOS = 'coldwork:roles';

/**
 * La ruta trabaja con una empresa (cabecera X-Empresa-Id).
 * Sin roles: basta ser miembro. Con roles: el usuario debe tener uno de ellos.
 *
 * @example @RequiereEmpresa(Rol.Dueno, Rol.Admin)
 */
export const RequiereEmpresa = (...roles: Rol[]) => SetMetadata(ROLES_PERMITIDOS, roles);
