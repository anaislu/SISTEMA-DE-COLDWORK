import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  aHttp,
  AREA_REQUERIDA,
  Rol,
  ROLES_PERMITIDOS,
  type Area,
  type PeticionAutenticada,
} from '../../../common/index.js';
import { SupabaseService } from '../../../database/supabase/supabase.service.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guard GLOBAL que se activa solo en rutas con @RequiereEmpresa(...roles) o @RequiereArea(area).
 * Lee X-Empresa-Id, confirma que el usuario es miembro activo y, si la ruta
 * pide roles o un área, que los tenga. (RLS vuelve a comprobarlo en la BD.)
 */
@Injectable()
export class EmpresaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const objetivos = [ctx.getHandler(), ctx.getClass()];
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(ROLES_PERMITIDOS, objetivos);
    if (roles === undefined) return true; // la ruta no trabaja con empresa
    const area = this.reflector.getAllAndOverride<Area | undefined>(AREA_REQUERIDA, objetivos);

    const req = ctx.switchToHttp().getRequest<PeticionAutenticada>();
    if (!req.usuario) return false;

    const empresaId = req.header('x-empresa-id');
    if (!empresaId || !UUID.test(empresaId)) {
      throw new BadRequestException('Cabecera X-Empresa-Id ausente o inválida');
    }

    const { data, error } = await this.supabase
      .paraUsuario(req.usuario.token)
      .from('miembros')
      .select('rol, areas')
      .eq('empresa_id', empresaId)
      .eq('usuario_id', req.usuario.id)
      .eq('activo', true)
      .maybeSingle<{ rol: Rol; areas: Area[] }>();

    if (error) throw aHttp(error);
    if (!data) throw new ForbiddenException('No perteneces a esta empresa');
    if (roles.length > 0 && !roles.includes(data.rol)) {
      throw new ForbiddenException('Tu rol no permite esta acción');
    }
    const veTodo = data.rol === Rol.Dueno || data.rol === Rol.Admin;
    if (area && !veTodo && !data.areas.includes(area)) {
      throw new ForbiddenException('No tienes acceso a esta área');
    }

    req.empresa = { id: empresaId, rol: data.rol, areas: data.areas };
    return true;
  }
}
