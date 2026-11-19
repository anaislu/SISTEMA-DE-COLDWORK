import { Component, computed, effect, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AREAS, type Area } from '../../../../core/permisos/areas';
import type { RolAsignable } from '../../models/equipo.model';

/** Lo que devuelve el diálogo al guardar. */
export interface DatosAcceso {
  correo: string;
  nombre: string;
  rol: RolAsignable;
  areas: Area[];
}

/**
 * Ventana para invitar a una persona o editar su acceso:
 * rol (admin ve todo / trabajador solo sus áreas) + casillas de áreas.
 */
@Component({
  selector: 'app-acceso-dialogo',
  imports: [FormsModule, DialogModule, ButtonModule, CheckboxModule, InputTextModule, MessageModule, SelectButtonModule],
  templateUrl: './acceso-dialogo.html',
  styleUrl: './acceso-dialogo.scss',
})
export class AccesoDialogo {
  readonly visible = model(false);
  /** 'invitar' pide correo y nombre; 'editar' solo rol y áreas. */
  readonly modo = input<'invitar' | 'editar'>('invitar');
  readonly inicial = input<Partial<DatosAcceso> | null>(null);
  /** Solo el dueño puede nombrar administradores. */
  readonly puedeDarAdmin = input(false);
  readonly guardando = input(false);
  readonly error = input<string | null>(null);
  readonly guardar = output<DatosAcceso>();

  protected readonly areas = AREAS;
  protected correo = '';
  protected nombre = '';
  protected readonly rol = signal<RolAsignable>('trabajador');
  protected seleccion: Area[] = [];
  protected readonly errorLocal = signal<string | null>(null);

  protected readonly opcionesRol = computed(() => [
    { etiqueta: 'Trabajador', valor: 'trabajador' as const, deshabilitado: false },
    { etiqueta: 'Administrador', valor: 'admin' as const, deshabilitado: !this.puedeDarAdmin() },
  ]);

  constructor() {
    // Al abrir, carga los valores iniciales
    effect(() => {
      if (!this.visible()) return;
      const i = this.inicial();
      this.correo = i?.correo ?? '';
      this.nombre = i?.nombre ?? '';
      this.rol.set(i?.rol ?? 'trabajador');
      this.seleccion = [...(i?.areas ?? [])];
      this.errorLocal.set(null);
    });
  }

  protected enviar() {
    const correo = this.correo.trim().toLowerCase();
    if (this.modo() === 'invitar' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      return this.errorLocal.set('Escribe un correo válido.');
    }
    if (this.rol() === 'trabajador' && this.seleccion.length === 0) {
      return this.errorLocal.set('Marca al menos un área.');
    }
    this.errorLocal.set(null);
    this.guardar.emit({ correo, nombre: this.nombre.trim(), rol: this.rol(), areas: this.seleccion });
  }
}
