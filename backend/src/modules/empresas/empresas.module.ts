import { Module } from '@nestjs/common';
import { EmpresasController } from './controllers/empresas.controller.js';
import { EmpresasService } from './services/empresas.service.js';

/**
 * Módulo Empresas. Estructura que siguen TODOS los módulos del ERP:
 *   controllers/  rutas HTTP
 *   services/     lógica de negocio
 *   dto/          entrada/salida validada (camelCase)
 *   entities/     forma de las tablas de Postgres (snake_case)
 */
@Module({
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
