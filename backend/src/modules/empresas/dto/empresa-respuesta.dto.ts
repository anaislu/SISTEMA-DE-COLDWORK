import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Area, Rol } from '../../../common/index.js';
import type { EmpresaEntity } from '../entities/empresa.entity.js';

/** Respuesta con los datos de una empresa (camelCase hacia el frontend). */
export class EmpresaRespuestaDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() razonSocial!: string;
  @ApiPropertyOptional({ nullable: true, type: String }) ruc!: string | null;
  @ApiPropertyOptional({ nullable: true, type: String }) nombreComercial!: string | null;
  @ApiPropertyOptional({ nullable: true, type: String }) direccion!: string | null;
  @ApiProperty() moneda!: string;

  static desde(e: EmpresaEntity): EmpresaRespuestaDto {
    return {
      id: e.id,
      razonSocial: e.razon_social,
      ruc: e.ruc,
      nombreComercial: e.nombre_comercial,
      direccion: e.direccion,
      moneda: e.moneda,
    };
  }
}

/** Elemento de GET /api/v1/empresas/mias */
export class MiEmpresaDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() razonSocial!: string;
  @ApiPropertyOptional({ nullable: true, type: String }) ruc!: string | null;
  @ApiProperty({ enum: Rol }) rol!: Rol;
  @ApiProperty({ enum: Area, isArray: true, description: 'Áreas asignadas (dueño/admin ven todas)' }) areas!: Area[];
}

export class EmpresaCreadaDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
}
