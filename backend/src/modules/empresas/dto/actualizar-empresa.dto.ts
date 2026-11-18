import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { RUC_REGEX } from './ruc.js';

/** Body de PATCH /api/v1/empresas/actual (todos los campos opcionales). */
export class ActualizarEmpresaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  razonSocial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreComercial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(RUC_REGEX, { message: 'RUC inválido' })
  ruc?: string;
}
