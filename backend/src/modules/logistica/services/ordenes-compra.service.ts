import { BadRequestException, Injectable } from '@nestjs/common';
import type { EmpresaActual, UsuarioActual } from '../../../common/index.js';
import { CrearOrdenCompraDto, OrdenCompraDto } from '../dto/index.js';
import { EstadoOc } from '../entities/index.js';
import { OrdenesCompraRepository } from '../repositories/index.js';

/**
 * Órdenes de compra: borrador → enviada → parcial → recibida (o anulada).
 * 'parcial' y 'recibida' las pone la BD al registrar llegadas.
 */
@Injectable()
export class OrdenesCompraService {
  constructor(private readonly repo: OrdenesCompraRepository) {}

  async listar(
    u: UsuarioActual,
    e: EmpresaActual,
    estado?: EstadoOc,
  ): Promise<OrdenCompraDto[]> {
    return (await this.repo.listar(u.token, e.id, estado)).map((f) =>
      OrdenCompraDto.desde(f),
    );
  }

  async obtener(
    u: UsuarioActual,
    e: EmpresaActual,
    id: string,
  ): Promise<OrdenCompraDto> {
    return OrdenCompraDto.desde(await this.repo.obtener(u.token, e.id, id));
  }

  async crear(
    u: UsuarioActual,
    e: EmpresaActual,
    dto: CrearOrdenCompraDto,
  ): Promise<OrdenCompraDto> {
    const productos = new Set(dto.items.map((i) => i.productoId));
    if (productos.size !== dto.items.length)
      throw new BadRequestException('Hay productos repetidos en la orden');
    const id = await this.repo.crear(u.token, e.id, dto);
    return this.obtener(u, e, id);
  }

  async enviar(
    u: UsuarioActual,
    e: EmpresaActual,
    id: string,
  ): Promise<OrdenCompraDto> {
    await this.repo.cambiarEstado(u.token, e.id, id, EstadoOc.Enviada);
    return this.obtener(u, e, id);
  }

  async anular(
    u: UsuarioActual,
    e: EmpresaActual,
    id: string,
  ): Promise<OrdenCompraDto> {
    await this.repo.cambiarEstado(u.token, e.id, id, EstadoOc.Anulada);
    return this.obtener(u, e, id);
  }
}
