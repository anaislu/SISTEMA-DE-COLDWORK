import { ConfigService } from '@nestjs/config';
import { SignJWT } from 'jose';
import { VerificadorJwtService } from './verificador-jwt.service.js';

const URL_SB = 'https://abc.supabase.co';
const SECRETO = 'secreto-de-prueba-de-al-menos-32-caracteres!!';

const config = (vals: Record<string, unknown>) => ({ get: (k: string) => vals[k] }) as unknown as ConfigService<any, true>;

const firmar = (claims: Record<string, unknown>, opciones: { emisor?: string; aud?: string; exp?: string } = {}) =>
  new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(opciones.emisor ?? `${URL_SB}/auth/v1`)
    .setAudience(opciones.aud ?? 'authenticated')
    .setExpirationTime(opciones.exp ?? '1h')
    .setIssuedAt()
    .sign(new TextEncoder().encode(SECRETO));

describe('VerificadorJwtService (HS256)', () => {
  const v = new VerificadorJwtService(config({ SUPABASE_URL: URL_SB, SUPABASE_JWT_SECRET: SECRETO }));

  it('acepta un token válido', async () => {
    const c = await v.verificar(await firmar({ sub: 'u1', email: 'a@b.pe' }));
    expect(c.sub).toBe('u1');
    expect(c.email).toBe('a@b.pe');
  });

  it('rechaza otro emisor (token de otro proyecto)', async () => {
    await expect(v.verificar(await firmar({ sub: 'u1' }, { emisor: 'https://otro.supabase.co/auth/v1' }))).rejects.toThrow();
  });

  it('rechaza audiencia distinta (ej. anon)', async () => {
    await expect(v.verificar(await firmar({ sub: 'u1' }, { aud: 'anon' }))).rejects.toThrow();
  });

  it('rechaza tokens vencidos', async () => {
    await expect(v.verificar(await firmar({ sub: 'u1' }, { exp: '-1m' }))).rejects.toThrow();
  });

  it('rechaza firmas alteradas', async () => {
    const t = await firmar({ sub: 'u1' });
    await expect(v.verificar(t.slice(0, -3) + 'abc')).rejects.toThrow();
  });
});
