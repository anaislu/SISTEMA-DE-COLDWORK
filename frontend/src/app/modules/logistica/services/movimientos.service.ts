import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/api/services/api.service';
import type { CrearLlegada, CrearSalida, Llegada, Salida } from '../models/logistica.model';

/** /api/v1/logistica/llegadas · /salidas */
@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly api = inject(ApiService);

  llegadas(): Promise<Llegada[]> {
    return this.api.get('/logistica/llegadas');
  }
  registrarLlegada(datos: CrearLlegada): Promise<Llegada> {
    return this.api.post('/logistica/llegadas', datos);
  }
  salidas(): Promise<Salida[]> {
    return this.api.get('/logistica/salidas');
  }
  registrarSalida(datos: CrearSalida): Promise<Salida> {
    return this.api.post('/logistica/salidas', datos);
  }
}
