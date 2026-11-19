import { Module } from '@nestjs/common';
import { EquipoController } from './controllers/equipo.controller.js';
import { EquipoService } from './services/equipo.service.js';

/** Módulo Equipo: miembros de la empresa, invitaciones y acceso por áreas. */
@Module({
  controllers: [EquipoController],
  providers: [EquipoService],
})
export class EquipoModule {}
