import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { EmpresaActual } from '../interfaces/empresa-actual.interface.js';
import type { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';

/** Inyecta la empresa actual (requiere @RequiereEmpresa): `@Empresa() e: EmpresaActual`. */
export const Empresa = createParamDecorator((_: unknown, ctx: ExecutionContext): EmpresaActual => {
  const req = ctx.switchToHttp().getRequest<PeticionAutenticada>();
  if (!req.empresa) throw new BadRequestException('Falta la cabecera X-Empresa-Id');
  return req.empresa;
});
