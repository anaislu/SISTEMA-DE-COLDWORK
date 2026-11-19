import type { Area, Rol } from '../../../common/index.js';

/** Entidad `public.miembros`: usuario ↔ empresa con su rol y sus áreas. */
export class MiembroEntity {
  empresa_id!: string;
  usuario_id!: string;
  rol!: Rol;
  areas!: Area[];
  activo!: boolean;
  creado_en!: string;
}
