import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  EstadoOc,
  type FilaOrdenCompra,
} from '../entities/orden-compra.entity.js';

export class ItemOrdenDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productoId!: string;
  @ApiProperty({ example: 10 }) @IsNumber() @IsPositive() cantidad!: number;
  @ApiProperty({ example: 380.5, description: 'Costo unitario sin IGV (S/)' })
  @IsNumber()
  @Min(0)
  costoUnitario!: number;
}

/** Body de POST /api/v1/logistica/ordenes-compra */
export class CrearOrdenCompraDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() proveedorId!: string;
  @ApiProperty({ format: 'uuid', description: 'Almacén donde llegará' })
  @IsUUID()
  almacenId!: string;
  @ApiPropertyOptional({ example: '2026-11-28' })
  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
  @ApiPropertyOptional({
    description: 'true = se crea ya enviada al proveedor',
  })
  @IsOptional()
  @IsBoolean()
  enviar?: boolean;

  @ApiProperty({ type: [ItemOrdenDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Agrega al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => ItemOrdenDto)
  items!: ItemOrdenDto[];
}

export class ItemOrdenRespuestaDto {
  @ApiProperty({ format: 'uuid' }) productoId!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty() unidad!: string;
  @ApiProperty() cantidad!: number;
  @ApiProperty() cantidadRecibida!: number;
  @ApiProperty() costoUnitario!: number;
  @ApiProperty() subtotal!: number;
}

export class OrdenCompraDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'OC-000012' }) codigo!: string;
  @ApiProperty({ enum: EstadoOc }) estado!: EstadoOc;
  @ApiProperty() fecha!: string;
  @ApiPropertyOptional({ nullable: true, type: String }) fechaEntrega!:
    string | null;
  @ApiPropertyOptional({ nullable: true, type: String }) notas!: string | null;
  @ApiProperty() proveedor!: {
    id: string;
    razonSocial: string;
    numeroDocumento: string;
  };
  @ApiProperty() almacen!: { id: string; nombre: string };
  @ApiProperty({ type: [ItemOrdenRespuestaDto] })
  items!: ItemOrdenRespuestaDto[];
  @ApiProperty({ description: 'Valor de venta sin IGV' }) subtotal!: number;
  @ApiProperty() igv!: number;
  @ApiProperty() total!: number;
  @ApiProperty({ description: '0 a 100' }) avance!: number;

  static desde(f: FilaOrdenCompra): OrdenCompraDto {
    const items = (f.items ?? []).map((i) => ({
      productoId: i.producto_id,
      sku: i.producto?.sku ?? '',
      nombre: i.producto?.nombre ?? '',
      unidad: i.producto?.unidad ?? '',
      cantidad: Number(i.cantidad),
      cantidadRecibida: Number(i.cantidad_recibida),
      costoUnitario: Number(i.costo_unitario),
      subtotal:
        Math.round(Number(i.cantidad) * Number(i.costo_unitario) * 100) / 100,
    }));
    // En céntimos para no arrastrar errores de coma flotante
    const base = items.reduce((t, i) => t + Math.round(i.subtotal * 100), 0);
    const igv = Math.round(base * 0.18);
    const pedido = items.reduce((t, i) => t + i.cantidad, 0);
    const recibido = items.reduce(
      (t, i) => t + Math.min(i.cantidadRecibida, i.cantidad),
      0,
    );
    return {
      id: f.id,
      codigo: `OC-${String(f.numero).padStart(6, '0')}`,
      estado: f.estado,
      fecha: f.fecha,
      fechaEntrega: f.fecha_entrega,
      notas: f.notas,
      proveedor: {
        id: f.proveedor?.id ?? '',
        razonSocial: f.proveedor?.razon_social ?? '',
        numeroDocumento: f.proveedor?.numero_documento ?? '',
      },
      almacen: { id: f.almacen?.id ?? '', nombre: f.almacen?.nombre ?? '' },
      items,
      subtotal: base / 100,
      igv: igv / 100,
      total: (base + igv) / 100,
      avance: pedido ? Math.round((recibido / pedido) * 100) : 0,
    };
  }
}
