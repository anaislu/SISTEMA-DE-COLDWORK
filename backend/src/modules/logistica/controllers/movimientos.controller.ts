import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Area,
  Empresa,
  RequiereArea,
  Usuario,
  type EmpresaActual,
  type UsuarioActual,
} from '../../../common/index.js';
import {
  CrearLlegadaDto,
  CrearSalidaDto,
  LlegadaDto,
  SalidaDto,
} from '../dto/index.js';
import { MovimientosService } from '../services/index.js';

/** Llegada (entrada) y salida (despacho) de producto. */
@ApiTags('Logística')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Empresa-Id',
  required: true,
  description: 'UUID de la empresa con la que se trabaja',
})
@RequiereArea(Area.Logistica)
@Controller({ path: 'logistica', version: '1' })
export class MovimientosController {
  constructor(private readonly movimientos: MovimientosService) {}

  @Get('llegadas')
  @ApiOkResponse({ type: [LlegadaDto] })
  listarLlegadas(@Usuario() u: UsuarioActual, @Empresa() e: EmpresaActual) {
    return this.movimientos.listarLlegadas(u, e);
  }

  /** Suma stock, actualiza costo promedio y, si viene de una OC, su avance. */
  @Post('llegadas')
  @HttpCode(201)
  @ApiCreatedResponse({ type: LlegadaDto })
  registrarLlegada(
    @Usuario() u: UsuarioActual,
    @Empresa() e: EmpresaActual,
    @Body() dto: CrearLlegadaDto,
  ) {
    return this.movimientos.registrarLlegada(u, e, dto);
  }

  @Get('salidas')
  @ApiOkResponse({ type: [SalidaDto] })
  listarSalidas(@Usuario() u: UsuarioActual, @Empresa() e: EmpresaActual) {
    return this.movimientos.listarSalidas(u, e);
  }

  /** Resta stock (nunca deja negativos). Transferencia: pasa a otro almacén. */
  @Post('salidas')
  @HttpCode(201)
  @ApiCreatedResponse({ type: SalidaDto })
  registrarSalida(
    @Usuario() u: UsuarioActual,
    @Empresa() e: EmpresaActual,
    @Body() dto: CrearSalidaDto,
  ) {
    return this.movimientos.registrarSalida(u, e, dto);
  }
}
