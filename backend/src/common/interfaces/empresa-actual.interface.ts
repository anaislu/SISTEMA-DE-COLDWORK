import type { Area } from '../enums/area.enum.js';
import type { Rol } from '../enums/rol.enum.js';

/** Empresa sobre la que se trabaja en esta petición (cabecera X-Empresa-Id). */
export interface EmpresaActual {
  id: string;
  rol: Rol;
  areas: Area[];
}
