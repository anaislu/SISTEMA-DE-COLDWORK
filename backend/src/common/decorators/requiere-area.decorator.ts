import { applyDecorators, SetMetadata } from '@nestjs/common';
import type { Area } from '../enums/area.enum.js';
import { RequiereEmpresa } from './requiere-empresa.decorator.js';

export const AREA_REQUERIDA = 'coldwork:area';

/**
 * La ruta pertenece a un área (ej. Ventas). Exige ser miembro de la empresa y
 * tener esa área asignada; dueño y admin pasan siempre.
 *
 * @example @RequiereArea(Area.Ventas)
 */
export const RequiereArea = (area: Area) => applyDecorators(RequiereEmpresa(), SetMetadata(AREA_REQUERIDA, area));
