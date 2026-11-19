import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Area, Rol } from '../../../common/index.js';
import type { FilaEquipo, InvitacionEntity } from '../entities/invitacion.entity.js';

/** Persona que ya es parte de la empresa. */
export class MiembroDto {
  @ApiProperty({ format: 'uuid' }) usuarioId!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty() correo!: string;
  @ApiProperty({ enum: Rol }) rol!: Rol;
  @ApiProperty({ enum: Area, isArray: true }) areas!: Area[];
  @ApiProperty() activo!: boolean;
  @ApiProperty() desde!: string;

  static desde(f: FilaEquipo): MiembroDto {
    return {
      usuarioId: f.usuario_id,
      nombre: f.nombre,
      correo: f.correo,
      rol: f.rol,
      areas: f.areas ?? [],
      activo: f.activo,
      desde: f.creado_en,
    };
  }
}

/** Invitación que aún no se acepta (la persona no ha entrado con ese correo). */
export class InvitacionDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() correo!: string;
  @ApiPropertyOptional({ nullable: true, type: String }) nombre!: string | null;
  @ApiProperty({ enum: Rol }) rol!: Rol;
  @ApiProperty({ enum: Area, isArray: true }) areas!: Area[];
  @ApiProperty() creadaEn!: string;

  static desde(e: InvitacionEntity): InvitacionDto {
    return {
      id: e.id,
      correo: e.correo,
      nombre: e.nombre,
      rol: e.rol,
      areas: e.areas ?? [],
      creadaEn: e.creado_en,
    };
  }
}

/** GET /api/v1/equipo */
export class EquipoDto {
  @ApiProperty({ type: [MiembroDto] }) miembros!: MiembroDto[];
  @ApiProperty({ type: [InvitacionDto] }) invitaciones!: InvitacionDto[];
}
