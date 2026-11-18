import { BadRequestException, Injectable } from '@nestjs/common';
import { datosOError, type Rol, type UsuarioActual } from '../../../common/index.js';
import { SupabaseService } from '../../../database/supabase/supabase.service.js';
import {
  ActualizarEmpresaDto,
  CrearEmpresaDto,
  EmpresaCreadaDto,
  EmpresaRespuestaDto,
  MiEmpresaDto,
} from '../dto/index.js';
import { COLUMNAS_EMPRESA, type EmpresaEntity } from '../entities/empresa.entity.js';

/** Fila que devuelve la función SQL `mis_empresas()`. */
interface FilaMiEmpresa {
  id: string;
  razon_social: string;
  ruc: string | null;
  rol: Rol;
}

/**
 * Lógica de negocio de empresas.
 * La BD usa snake_case (entities) y la API expone camelCase (DTOs).
 * Toda consulta va con el token del usuario → RLS siempre aplica.
 */
@Injectable()
export class EmpresasService {
  constructor(private readonly supabase: SupabaseService) {}

  async mias(u: UsuarioActual): Promise<MiEmpresaDto[]> {
    const filas = datosOError(await this.supabase.paraUsuario(u.token).rpc('mis_empresas')) as FilaMiEmpresa[] | null;
    return (filas ?? []).map((f) => ({ id: f.id, razonSocial: f.razon_social, ruc: f.ruc, rol: f.rol }));
  }

  async crear(u: UsuarioActual, dto: CrearEmpresaDto): Promise<EmpresaCreadaDto> {
    const id = datosOError(
      await this.supabase
        .paraUsuario(u.token)
        .rpc('crear_empresa', { p_razon_social: dto.razonSocial, p_ruc: dto.ruc ?? null }),
    ) as string;
    return { id };
  }

  async obtener(u: UsuarioActual, empresaId: string): Promise<EmpresaRespuestaDto> {
    const fila = datosOError(
      await this.supabase
        .paraUsuario(u.token)
        .from('empresas')
        .select(COLUMNAS_EMPRESA)
        .eq('id', empresaId)
        .single<EmpresaEntity>(),
    );
    return EmpresaRespuestaDto.desde(fila);
  }

  async actualizar(u: UsuarioActual, empresaId: string, dto: ActualizarEmpresaDto): Promise<EmpresaRespuestaDto> {
    const cambios: Partial<EmpresaEntity> = {};
    if (dto.razonSocial !== undefined) cambios.razon_social = dto.razonSocial.trim();
    if (dto.ruc !== undefined) cambios.ruc = dto.ruc;
    if (dto.nombreComercial !== undefined) cambios.nombre_comercial = dto.nombreComercial.trim() || null;
    if (dto.direccion !== undefined) cambios.direccion = dto.direccion.trim() || null;
    if (Object.keys(cambios).length === 0) throw new BadRequestException('No hay cambios');

    const fila = datosOError(
      await this.supabase
        .paraUsuario(u.token)
        .from('empresas')
        .update(cambios)
        .eq('id', empresaId)
        .select(COLUMNAS_EMPRESA)
        .single<EmpresaEntity>(),
    );
    return EmpresaRespuestaDto.desde(fila);
  }
}
