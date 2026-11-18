/**
 * Configuración leída al ARRANCAR la app (no al compilar).
 *
 * El archivo /config.json se sirve junto a la app:
 *  - En desarrollo: public/config.json (apunta al Supabase local o al de dev).
 *  - En Docker: el contenedor lo genera desde variables de entorno
 *    (ver app/docker/40-runtime-config.sh). Así una misma imagen sirve
 *    para dev, staging y prod.
 *
 * Solo van datos PÚBLICOS: URL y publishable/anon key. Nunca secret keys.
 */
export interface RuntimeConfig {
  supabaseUrl: string;
  supabaseKey: string;
  /** Base de la API NestJS, ej. http://localhost:3000/api o /api */
  apiUrl: string;
  entorno: 'local' | 'dev' | 'prod' | string;
  /** Clave de licencia de PrimeUI (PrimeNG 22+). Se verifica offline; no es secreta. */
  primeLicense?: string;
}

let config: RuntimeConfig | null = null;

export async function cargarConfig(): Promise<void> {
  const res = await fetch('/config.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`No se pudo leer /config.json (HTTP ${res.status})`);
  }
  const datos = (await res.json()) as RuntimeConfig;
  if (!datos.supabaseUrl || !datos.supabaseKey || !datos.apiUrl) {
    throw new Error('config.json incompleto: faltan supabaseUrl, supabaseKey o apiUrl');
  }
  datos.apiUrl = datos.apiUrl.replace(/\/$/, '');
  config = datos;
}

export function getConfig(): RuntimeConfig {
  if (!config) {
    throw new Error('La configuración aún no se cargó (cargarConfig)');
  }
  return config;
}
