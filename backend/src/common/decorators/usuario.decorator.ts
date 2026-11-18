import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';
import type { UsuarioActual } from '../interfaces/usuario-actual.interface.js';

/** Inyecta el usuario autenticado en el handler: `@Usuario() u: UsuarioActual`. */
export const Usuario = createParamDecorator((_: unknown, ctx: ExecutionContext): UsuarioActual => {
  const req = ctx.switchToHttp().getRequest<PeticionAutenticada>();
  if (!req.usuario) throw new UnauthorizedException();
  return req.usuario;
});
