import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from './guards/auth.guard.js';
import { EmpresaGuard } from './guards/empresa.guard.js';
import { VerificadorJwtService } from './services/verificador-jwt.service.js';

/**
 * Seguridad de toda la API. Guards globales, en este orden:
 * límite de peticiones → token (AuthGuard) → empresa/rol (EmpresaGuard).
 */
@Module({
  providers: [
    VerificadorJwtService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: EmpresaGuard },
  ],
  exports: [VerificadorJwtService],
})
export class AuthModule {}
