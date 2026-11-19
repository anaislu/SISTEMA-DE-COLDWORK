import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayUnique, IsArray, IsEmail, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Area, Rol } from '../../../common/index.js';

/** Roles que se pueden asignar desde Equipo (el dueño es único y no se asigna). */
export const ROLES_ASIGNABLES = [Rol.Admin, Rol.Trabajador] as const;
export type RolAsignable = (typeof ROLES_ASIGNABLES)[number];

/** Body de POST /api/v1/equipo/invitaciones */
export class InvitarDto {
  @ApiProperty({ example: 'tecnico@gmail.com' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Correo inválido' })
  correo!: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @ApiProperty({ enum: ROLES_ASIGNABLES, description: 'admin ve todo; trabajador solo sus áreas' })
  @IsIn(ROLES_ASIGNABLES, { message: 'Rol inválido' })
  rol!: RolAsignable;

  @ApiProperty({ enum: Area, isArray: true, example: [Area.Tecnica] })
  @IsArray()
  @ArrayUnique()
  @IsEnum(Area, { each: true, message: 'Área inválida' })
  areas!: Area[];
}
