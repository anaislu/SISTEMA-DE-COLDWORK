import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsIn, IsOptional } from 'class-validator';
import { Area } from '../../../common/index.js';
import { ROLES_ASIGNABLES, type RolAsignable } from './invitar.dto.js';

/** Body de PATCH /api/v1/equipo/miembros/:usuarioId (todo opcional). */
export class ActualizarMiembroDto {
  @ApiPropertyOptional({ enum: ROLES_ASIGNABLES })
  @IsOptional()
  @IsIn(ROLES_ASIGNABLES, { message: 'Rol inválido' })
  rol?: RolAsignable;

  @ApiPropertyOptional({ enum: Area, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Area, { each: true, message: 'Área inválida' })
  areas?: Area[];

  @ApiPropertyOptional({ description: 'false = bloquea el acceso sin borrar a la persona' })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
