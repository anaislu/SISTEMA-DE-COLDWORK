import { Component, computed, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { EmpresaActualService } from '../../../../core/empresa/services/empresa-actual.service';
import { NOMBRE_ROL, nombreArea, veTodo } from '../../../../core/permisos/areas';
import { Emoji } from '../../../../shared/components/emoji/emoji';

/** Vista: panel de inicio. */
@Component({
  selector: 'app-inicio',
  imports: [CardModule, Emoji],
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

  protected readonly tiles = [
    { titulo: 'Saldo en caja y bancos', icono: 'pi pi-wallet' },
    { titulo: 'Por cobrar', icono: 'pi pi-inbox' },
    { titulo: 'Por pagar', icono: 'pi pi-send' },
    { titulo: 'Ventas del mes', icono: 'pi pi-chart-line' },
  ];
}
