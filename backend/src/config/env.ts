import { z } from 'zod';

/**
 * Variables de entorno de la API, validadas al arrancar.
 * Si falta algo o está mal, la API NO arranca (mejor fallar al desplegar
 * que fallar con un usuario).
 */
const lista = z
  .string()
  .default('')
  .transform((s) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean),
  );

const booleano = z
  .enum(['true', 'false', '1', '0'])
  .default('false')
  .transform((v) => v === 'true' || v === '1');

export const esquemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Supabase: solo datos públicos. La API actúa CON EL TOKEN DEL USUARIO,
  // así RLS sigue protegiendo los datos aunque la API tuviera un bug.
  SUPABASE_URL: z.url(),
  SUPABASE_KEY: z
    .string()
    .min(20)
    .refine((k) => !k.startsWith('sb_secret_'), 'SUPABASE_KEY debe ser la publishable key, nunca la secret key'),
  // Solo para proyectos antiguos que firman con HS256 (los nuevos usan claves asimétricas + JWKS).
  SUPABASE_JWT_SECRET: z.string().min(32).optional(),

  // Orígenes permitidos para CORS (separados por coma). Ej: https://erp.coldwork.pe
  CORS_ORIGINS: lista,
  SWAGGER_ENABLED: booleano,

  // Límite de peticiones por IP (por instancia; con varias instancias usar Redis)
  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),
});

export type Env = z.infer<typeof esquemaEnv>;

export function validarEnv(crudo: Record<string, unknown>): Env {
  const r = esquemaEnv.safeParse(crudo);
  if (!r.success) {
    const detalle = r.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Configuración inválida de la API:\n${detalle}`);
  }
  return r.data;
}
