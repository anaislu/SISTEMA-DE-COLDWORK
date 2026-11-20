import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/api/services/api.service';
import type { Almacen, GuardarAlmacen } from '../models/logistica.model';

/** /api/v1/logistica/almacenes */
@Injectable({ providedIn: 'root' })
export class AlmacenesService {
  private readonly api = inject(ApiService);

  listar(): Promise<Almacen[]> {
    return this.api.get('/logistica/almacenes');
  }
  crear(datos: GuardarAlmacen): Promise<Almacen> {
    return this.api.post('/logistica/almacenes', datos);
  }
  actualizar(id: string, datos: Partial<GuardarAlmacen>): Promise<Almacen> {
    return this.api.patch(`/logistica/almacenes/${id}`, datos);
  }
}
