import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/api/services/api.service';
import type { ActualizarEmpresa, CrearEmpresa, Empresa, MiEmpresa } from '../models/empresa.model';

/** Llamadas al backend del módulo Empresas (/api/v1/empresas). */
@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly api = inject(ApiService);

  mias(): Promise<MiEmpresa[]> {
    return this.api.get<MiEmpresa[]>('/empresas/mias');
  }

  crear(datos: CrearEmpresa): Promise<{ id: string }> {
    return this.api.post<{ id: string }>('/empresas', datos);
  }

  actual(): Promise<Empresa> {
    return this.api.get<Empresa>('/empresas/actual');
  }

  actualizar(cambios: ActualizarEmpresa): Promise<Empresa> {
    return this.api.patch<Empresa>('/empresas/actual', cambios);
  }
}
