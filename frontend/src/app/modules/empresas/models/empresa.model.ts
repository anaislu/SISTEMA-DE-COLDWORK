/** Modelos del módulo Empresas (mismos nombres que los DTOs del backend). */
import type { Area, Rol } from '../../../core/permisos/areas';

export type { Area, Rol };

/** GET /api/v1/empresas/mias */
export interface MiEmpresa {
  id: string;
  razonSocial: string;
  ruc: string | null;
  rol: Rol;
  /** Áreas asignadas (dueño/admin ven todas aunque esté vacío). */
  areas: Area[];
}

/** GET/PATCH /api/v1/empresas/actual */
export interface Empresa {
  id: string;
  razonSocial: string;
  ruc: string | null;
  nombreComercial: string | null;
  direccion: string | null;
  moneda: string;
}

export interface CrearEmpresa {
  razonSocial: string;
  ruc?: string;
}

export type ActualizarEmpresa = Partial<Pick<Empresa, 'razonSocial' | 'ruc' | 'nombreComercial' | 'direccion'>>;
