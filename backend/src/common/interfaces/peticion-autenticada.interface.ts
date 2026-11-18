import type { Request } from 'express';
import type { EmpresaActual } from './empresa-actual.interface.js';
import type { UsuarioActual } from './usuario-actual.interface.js';

/** Request de Express enriquecido por los guards. */
export interface PeticionAutenticada extends Request {
  usuario?: UsuarioActual;
  empresa?: EmpresaActual;
}
