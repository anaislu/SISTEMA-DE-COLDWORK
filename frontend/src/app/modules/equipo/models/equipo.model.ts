/** Modelos del módulo Equipo (mismos nombres que los DTOs del backend). */
import type { Area, Rol } from '../../../core/permisos/areas';

/** Roles que se pueden dar desde Equipo. */
export type RolAsignable = Extract<Rol, 'admin' | 'trabajador'>;

export interface Miembro {
  usuarioId: string;
  nombre: string;
  correo: string;
  rol: Rol;
  areas: Area[];
  activo: boolean;
  desde: string;
}

export interface Invitacion {
  id: string;
  correo: string;
  nombre: string | null;
  rol: Rol;
  areas: Area[];
  creadaEn: string;
}

/** GET /api/v1/equipo */
export interface EquipoRespuesta {
  miembros: Miembro[];
  invitaciones: Invitacion[];
}

/** POST /api/v1/equipo/invitaciones */
export interface Invitar {
  correo: string;
  nombre?: string;
  rol: RolAsignable;
  areas: Area[];
}

/** PATCH /api/v1/equipo/miembros/:usuarioId */
export interface ActualizarMiembro {
  rol?: RolAsignable;
  areas?: Area[];
  activo?: boolean;
}
