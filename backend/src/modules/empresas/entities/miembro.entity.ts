import type { Rol } from '../../../common/index.js';

/** Entidad `public.miembros`: usuario ↔ empresa con su rol. */
export class MiembroEntity {
  empresa_id!: string;
  usuario_id!: string;
  rol!: Rol;
  activo!: boolean;
  creado_en!: string;
}
