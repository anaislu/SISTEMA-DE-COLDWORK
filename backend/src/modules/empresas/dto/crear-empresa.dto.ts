import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { RUC_REGEX } from './ruc.js';

/** Body de POST /api/v1/empresas */
export class CrearEmpresaDto {
  @ApiProperty({ example: 'COLDWORK S.A.C.' })
  @IsString()
  @Length(2, 200)
  razonSocial!: string;

  @ApiPropertyOptional({ example: '20123456789', description: 'RUC de 11 dígitos' })
  @IsOptional()
  @Matches(RUC_REGEX, { message: 'RUC inválido' })
  ruc?: string;
}
