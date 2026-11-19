// Genera public/config.json antes de compilar en un hosting (Cloudflare Pages).
// Uso (comando de compilación en Cloudflare):  node scripts/generar-config.mjs && npx ng build
//
// Lee variables de entorno del hosting; lo que no venga se toma del config.json actual:
//   API_URL        URL del backend, ej. https://coldwork-api.onrender.com/api   (obligatoria aquí)
//   SUPABASE_URL   URL del proyecto Supabase
//   SUPABASE_KEY   publishable key (NUNCA la secret key)
//   ENTORNO        texto que se muestra en la barra, ej. "prueba"
//   PRIME_LICENSE  licencia de PrimeUI (opcional)
import { readFileSync, writeFileSync } from 'node:fs';

const ruta = new URL('../public/config.json', import.meta.url);
const actual = JSON.parse(readFileSync(ruta, 'utf8'));
const env = process.env;

const config = {
  supabaseUrl: env.SUPABASE_URL || actual.supabaseUrl,
  supabaseKey: env.SUPABASE_KEY || actual.supabaseKey,
  apiUrl: env.API_URL || actual.apiUrl,
  entorno: env.ENTORNO || 'prueba',
  primeLicense: env.PRIME_LICENSE || actual.primeLicense || '',
};

if (config.supabaseKey.startsWith('sb_secret_')) {
  console.error('ERROR: SUPABASE_KEY es una secret key. Usa la publishable key.');
  process.exit(1);
}
if (!env.API_URL) {
  console.warn('AVISO: falta API_URL; el sitio seguirá apuntando a', config.apiUrl);
}

writeFileSync(ruta, `${JSON.stringify(config, null, 2)}\n`);
console.log('config.json listo → API:', config.apiUrl, '· entorno:', config.entorno);
