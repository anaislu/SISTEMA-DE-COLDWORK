import { Component, computed, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { EmpresaActualService } from '../../../../core/empresa/services/empresa-actual.service';
import { RouterLink } from '@angular/router';
import { NOMBRE_ROL, nombreArea, veTodo, type Area } from '../../../../core/permisos/areas';
import { Emoji } from '../../../../shared/components/emoji/emoji';

/** Vista: panel de inicio. */
@Component({
  selector: 'app-inicio',
  imports: [CardModule, Emoji, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  private readonly auth = inject(AuthService);
  protected readonly empresa = inject(EmpresaActualService);
  protected readonly nombreRol = NOMBRE_ROL;
  protected readonly veTodo = veTodo;
  protected readonly misAreas = computed(() => (this.empresa.actual()?.areas ?? []).map(nombreArea).join(', '));
  protected readonly nombre = computed(() => (this.auth.usuario()?.user_metadata?.['nombre'] as string | undefined) ?? '');

  /** Indicadores por área: cada persona ve solo los de sus áreas (nada contable si no es su área). */
  private readonly todos: { titulo: string; icono: string; area: Area }[] = [
    { titulo: 'Saldo en caja y bancos', icono: 'pi pi-wallet', area: 'finanzas' },
    { titulo: 'Por cobrar', icono: 'pi pi-inbox', area: 'finanzas' },
    { titulo: 'Por pagar', icono: 'pi pi-send', area: 'finanzas' },
    { titulo: 'Ventas del mes', icono: 'pi pi-chart-line', area: 'ventas' },
  ];
  protected readonly tiles = computed(() => {
    this.empresa.actual();
    return this.todos.filter((t) => this.empresa.puede(t.area));
  });

  /** Accesos directos del área de logística. */
  protected readonly logistica = computed(() => {
    this.empresa.actual();
    return this.empresa.puede('logistica');
  });
  protected readonly atajosLogistica = [
    { titulo: 'Inventario', sub: 'Stock por producto y almacén', icono: 'pi pi-box', ruta: '/logistica/inventario', query: {} },
    { titulo: 'Registrar llegada', sub: 'Lo que entra al almacén', icono: 'pi pi-download', ruta: '/logistica/llegadas', query: { nuevo: 1 } },
    { titulo: 'Registrar salida', sub: 'Despachos y transferencias', icono: 'pi pi-upload', ruta: '/logistica/salidas', query: { nuevo: 1 } },
    { titulo: 'Órdenes de compra', sub: 'Plazos y llegadas esperadas', icono: 'pi pi-file-edit', ruta: '/logistica/ordenes-compra', query: {} },
  ];
}
