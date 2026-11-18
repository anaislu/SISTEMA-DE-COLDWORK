/** Modelos del módulo Empresas (mismos nombres que los DTOs del backend). */

export type Rol = 'dueno' | 'admin' | 'contador' | 'trabajador';

/** GET /api/v1/empresas/mias */
export interface MiEmpresa {
  id: string;
  razonSocial: string;
  ruc: string | null;
  rol: Rol;
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
