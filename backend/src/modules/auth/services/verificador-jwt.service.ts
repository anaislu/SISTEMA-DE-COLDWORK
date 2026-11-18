import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';
import type { Env } from '../../../config/env.js';

export interface ClaimsSupabase extends JWTPayload {
  sub: string;
  email?: string;
  role?: string;
}

/**
 * Verifica el JWT que emite Supabase Auth.
 *
 * - Proyectos nuevos: claves asimétricas (ES256/RS256) publicadas en
 *   <SUPABASE_URL>/auth/v1/.well-known/jwks.json. Se verifica LOCALMENTE
 *   (jose cachea las claves) → no hay una llamada a Supabase por petición.
 * - Proyectos antiguos (HS256): definir SUPABASE_JWT_SECRET.
 */
@Injectable()
export class VerificadorJwtService {
  private readonly emisor: string;
  private readonly clave: JWTVerifyGetKey | Uint8Array;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get('SUPABASE_URL', { infer: true }).replace(/\/$/, '');
    this.emisor = `${url}/auth/v1`;
    const secreto = config.get('SUPABASE_JWT_SECRET', { infer: true });
    this.clave = secreto
      ? new TextEncoder().encode(secreto)
      : createRemoteJWKSet(new URL(`${this.emisor}/.well-known/jwks.json`), { cooldownDuration: 30_000 });
  }

  async verificar(token: string): Promise<ClaimsSupabase> {
    const { payload } = await jwtVerify(token, this.clave as JWTVerifyGetKey, {
      issuer: this.emisor,
      audience: 'authenticated',
      clockTolerance: 5,
    });
    if (!payload.sub) throw new Error('Token sin sub');
    return payload as ClaimsSupabase;
  }
}
