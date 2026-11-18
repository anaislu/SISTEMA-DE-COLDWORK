/**
 * Entidad `public.empresas` (fila tal como está en Postgres, snake_case).
 * La tabla se define en supabase/migrations; esta clase es su espejo en TS.
 */
export class EmpresaEntity {
  id!: string;
  ruc!: string | null;
  razon_social!: string;
  nombre_comercial!: string | null;
  direccion!: string | null;
  moneda!: string;
  activa!: boolean;
  creado_en!: string;
  actualizado_en!: string;
}

/** Columnas que se leen normalmente (evita `select *`). */
export const COLUMNAS_EMPRESA = 'id, ruc, razon_social, nombre_comercial, direccion, moneda, activa, creado_en, actualizado_en';
