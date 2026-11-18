import { validarEnv } from './env.js';

const base = { SUPABASE_URL: 'https://abc.supabase.co', SUPABASE_KEY: 'sb_publishable_1234567890abcdef' };

describe('validarEnv', () => {
  it('aplica valores por defecto', () => {
    const env = validarEnv(base);
    expect(env.PORT).toBe(3000);
    expect(env.SWAGGER_ENABLED).toBe(false);
    expect(env.CORS_ORIGINS).toEqual([]);
  });

  it('separa CORS_ORIGINS por comas', () => {
    const env = validarEnv({ ...base, CORS_ORIGINS: 'http://localhost:4200, https://erp.coldwork.pe' });
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:4200', 'https://erp.coldwork.pe']);
  });

  it('rechaza una secret key', () => {
    expect(() => validarEnv({ ...base, SUPABASE_KEY: 'sb_secret_1234567890abcdefghij' })).toThrow(/publishable/);
  });

  it('rechaza si falta la URL', () => {
    expect(() => validarEnv({ SUPABASE_KEY: base.SUPABASE_KEY })).toThrow(/SUPABASE_URL/);
  });
});
