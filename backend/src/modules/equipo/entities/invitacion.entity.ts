import type { Area, Rol } from '../../../common/index.js';

/** Entidad `public.invitaciones`: correo invitado a una empresa con su rol y áreas. */
export class InvitacionEntity {
  id!: string;
  empresa_id!: string;
  correo!: string;
  nombre!: string | null;
  rol!: Rol;
  areas!: Area[];
  creado_por!: string | null;
  creado_en!: string;
}

export const COLUMNAS_INVITACION = 'id, empresa_id, correo, nombre, rol, areas, creado_por, creado_en';

/** Fila que devuelve la función SQL `equipo_empresa(p_empresa)`. */
export interface FilaEquipo {
  usuario_id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  areas: Area[];
  activo: boolean;
  creado_en: string;
}
