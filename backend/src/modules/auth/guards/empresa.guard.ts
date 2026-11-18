import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { aHttp, ROLES_PERMITIDOS, type PeticionAutenticada, type Rol } from '../../../common/index.js';
import { SupabaseService } from '../../../database/supabase/supabase.service.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guard GLOBAL que se activa solo en rutas con @RequiereEmpresa(...roles).
 * Lee X-Empresa-Id, confirma que el usuario es miembro activo y, si la ruta
 * pide roles, que tenga uno de ellos. (RLS vuelve a comprobarlo en la BD.)
 */
@Injectable()
export class EmpresaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(ROLES_PERMITIDOS, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (roles === undefined) return true; // la ruta no trabaja con empresa

    const req = ctx.switchToHttp().getRequest<PeticionAutenticada>();
    if (!req.usuario) return false;

    const empresaId = req.header('x-empresa-id');
    if (!empresaId || !UUID.test(empresaId)) {
      throw new BadRequestException('Cabecera X-Empresa-Id ausente o inválida');
    }

    const { data, error } = await this.supabase
      .paraUsuario(req.usuario.token)
      .from('miembros')
      .select('rol')
      .eq('empresa_id', empresaId)
      .eq('usuario_id', req.usuario.id)
      .eq('activo', true)
      .maybeSingle<{ rol: Rol }>();

    if (error) throw aHttp(error);
    if (!data) throw new ForbiddenException('No perteneces a esta empresa');
    if (roles.length > 0 && !roles.includes(data.rol)) {
      throw new ForbiddenException('Tu rol no permite esta acción');
    }

    req.empresa = { id: empresaId, rol: data.rol };
    return true;
  }
}
