import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ES_PUBLICA, type PeticionAutenticada } from '../../../common/index.js';
import { VerificadorJwtService } from '../services/verificador-jwt.service.js';

/**
 * Guard GLOBAL: toda ruta exige `Authorization: Bearer <jwt de Supabase>`
 * salvo las marcadas con @Publica(). Seguro por defecto.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly log = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly verificador: VerificadorJwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const publica = this.reflector.getAllAndOverride<boolean>(ES_PUBLICA, [ctx.getHandler(), ctx.getClass()]);
    if (publica) return true;

    const req = ctx.switchToHttp().getRequest<PeticionAutenticada>();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Falta el token de acceso');
    }

    try {
      const claims = await this.verificador.verificar(token);
      req.usuario = { id: claims.sub, email: claims.email ?? null, token };
      return true;
    } catch (e) {
      this.log.debug(`Token rechazado: ${(e as Error).message}`);
      throw new UnauthorizedException('Sesión inválida o vencida');
    }
  }
}
