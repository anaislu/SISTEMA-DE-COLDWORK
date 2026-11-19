import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/api/services/api.service';
import type { ActualizarMiembro, EquipoRespuesta, Invitacion, Invitar } from '../models/equipo.model';

/** Llamadas al backend del módulo Equipo (/api/v1/equipo). */
@Injectable({ providedIn: 'root' })
export class EquipoService {
  private readonly api = inject(ApiService);

  listar(): Promise<EquipoRespuesta> {
    return this.api.get<EquipoRespuesta>('/equipo');
  }

  invitar(datos: Invitar): Promise<Invitacion> {
    return this.api.post<Invitacion>('/equipo/invitaciones', datos);
  }

  cancelarInvitacion(id: string): Promise<void> {
    return this.api.delete<void>(`/equipo/invitaciones/${id}`);
  }

  actualizarMiembro(usuarioId: string, cambios: ActualizarMiembro): Promise<void> {
    return this.api.patch<void>(`/equipo/miembros/${usuarioId}`, cambios);
  }

  quitarMiembro(usuarioId: string): Promise<void> {
    return this.api.delete<void>(`/equipo/miembros/${usuarioId}`);
  }
}
