import { BadRequestException, Injectable } from '@nestjs/common';
import type { EmpresaActual, UsuarioActual } from '../../../common/index.js';
import {
  CrearLlegadaDto,
  CrearSalidaDto,
  LlegadaDto,
  SalidaDto,
} from '../dto/index.js';
import { MovimientosRepository } from '../repositories/index.js';

/**
 * Llegada y salida de producto. La regla dura (stock no negativo, costo
 * promedio, kardex, avance de la OC) vive en SQL y es atómica; aquí se
 * valida la forma y se devuelve el documento completo.
 */
@Injectable()
export class MovimientosService {
  constructor(private readonly repo: MovimientosRepository) {}

  async listarLlegadas(
    u: UsuarioActual,
    e: EmpresaActual,
  ): Promise<LlegadaDto[]> {
    return (await this.repo.listarLlegadas(u.token, e.id)).map((f) =>
      LlegadaDto.desde(f),
    );
  }

  async registrarLlegada(
    u: UsuarioActual,
    e: EmpresaActual,
    dto: CrearLlegadaDto,
  ): Promise<LlegadaDto> {
    sinRepetidos(dto.items);
    const id = await this.repo.registrarLlegada(u.token, e.id, dto);
    return LlegadaDto.desde(await this.repo.obtenerLlegada(u.token, e.id, id));
  }

  async listarSalidas(
    u: UsuarioActual,
    e: EmpresaActual,
  ): Promise<SalidaDto[]> {
    return (await this.repo.listarSalidas(u.token, e.id)).map((f) =>
      SalidaDto.desde(f),
    );
  }

  async registrarSalida(
    u: UsuarioActual,
    e: EmpresaActual,
    dto: CrearSalidaDto,
  ): Promise<SalidaDto> {
    sinRepetidos(dto.items);
    const id = await this.repo.registrarSalida(u.token, e.id, dto);
    return SalidaDto.desde(await this.repo.obtenerSalida(u.token, e.id, id));
  }
}

function sinRepetidos(items: { productoId: string }[]) {
  if (new Set(items.map((i) => i.productoId)).size !== items.length) {
    throw new BadRequestException(
      'Hay productos repetidos; suma las cantidades en una sola línea',
    );
  }
}
