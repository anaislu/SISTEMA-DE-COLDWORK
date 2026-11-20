import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { OrdenDialogo } from '../../components/orden-dialogo/orden-dialogo';
import {
  ESTADOS_OC,
  type EstadoOc,
  type OrdenCompra,
  type Producto,
} from '../../models/logistica.model';
import { LogisticaStore } from '../../services/logistica-store.service';
import { OrdenesCompraService } from '../../services/ordenes-compra.service';

/** Vista: ÓRDENES DE COMPRA en tablero (borrador → enviada → parcial → recibida). */
@Component({
  selector: 'app-ordenes-compra',
  imports: [
    FormsModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    DrawerModule,
    ConfirmDialogModule,
    OrdenDialogo,
  ],
  providers: [ConfirmationService],
  templateUrl: './ordenes-compra.html',
  styleUrl: './ordenes-compra.scss',
})
export class OrdenesCompra implements OnInit {
  private readonly api = inject(OrdenesCompraService);
  private readonly store = inject(LogisticaStore);
  private readonly confirmar = inject(ConfirmationService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly estados = ESTADOS_OC;
  protected readonly columnas: EstadoOc[] = ['borrador', 'enviada', 'parcial', 'recibida'];
  protected readonly ordenes = signal<OrdenCompra[]>([]);
  protected readonly cargando = signal(true);
  protected readonly texto = signal('');
  protected readonly verAnuladas = signal(false);
  protected readonly detalle = signal<OrdenCompra | null>(null);
  protected readonly detalleVisible = signal(false);
  protected readonly dialogo = signal(false);
  protected readonly sugeridos = signal<Producto[]>([]);
  protected readonly trabajando = signal(false);

  private readonly filtradas = computed(() => {
    const t = this.texto().trim().toLowerCase();
    return this.ordenes().filter(
      (o) =>
        !t ||
        [o.codigo, o.proveedor.razonSocial, o.almacen.nombre, ...o.items.map((i) => i.nombre)]
          .join(' ')
          .toLowerCase()
          .includes(t),
    );
  });
  protected readonly porEstado = computed(() => {
    const m = new Map<EstadoOc, OrdenCompra[]>();
    for (const o of this.filtradas()) m.set(o.estado, [...(m.get(o.estado) ?? []), o]);
    return m;
  });
  protected readonly visibles = computed(() =>
    this.verAnuladas() ? [...this.columnas, 'anulada' as EstadoOc] : this.columnas,
  );
  protected readonly enCamino = computed(() =>
    this.ordenes()
      .filter((o) => o.estado === 'enviada' || o.estado === 'parcial')
      .reduce((t, o) => t + o.total * (1 - o.avance / 100), 0),
  );

  async ngOnInit() {
    await Promise.all([this.cargar(), this.store.asegurar()]);
    const q = this.ruta.snapshot.queryParamMap;
    const prod = q.get('producto');
    if (prod) {
      const p = this.store.productoPorId().get(prod);
      this.nueva(p ? [p] : []);
    } else if (q.get('nuevo')) this.nueva();
  }

  async cargar() {
    this.cargando.set(true);
    try {
      this.ordenes.set(await this.api.listar());
    } catch (e) {
      this.store.error('No se pudieron cargar las órdenes', e);
    } finally {
      this.cargando.set(false);
    }
  }

  protected nueva(sugeridos: Producto[] = []) {
    this.sugeridos.set(sugeridos);
    this.dialogo.set(true);
    void this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  protected ver(o: OrdenCompra) {
    this.detalle.set(o);
    this.detalleVisible.set(true);
  }

  protected alCrear(o: OrdenCompra) {
    this.ordenes.update((l) => [o, ...l]);
    this.ver(o);
  }

  protected async enviar(o: OrdenCompra) {
    await this.cambiar(o, () => this.api.enviar(o.id), 'Orden enviada al proveedor');
  }

  protected anular(o: OrdenCompra) {
    this.confirmar.confirm({
      header: `¿Anular ${o.codigo}?`,
      message: 'La orden queda anulada y ya no podrá recibir productos.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Volver',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      accept: () => void this.cambiar(o, () => this.api.anular(o.id), 'Orden anulada'),
    });
  }

  protected recibir(o: OrdenCompra) {
    void this.router.navigate(['/logistica/llegadas'], { queryParams: { oc: o.id } });
  }

  /** Copia los productos de una orden en una nueva (para pedidos que se repiten). */
  protected repetir(o: OrdenCompra) {
    const porId = this.store.productoPorId();
    this.detalleVisible.set(false);
    this.nueva(o.items.map((i) => porId.get(i.productoId)).filter((p): p is Producto => !!p));
  }

  private async cambiar(o: OrdenCompra, accion: () => Promise<OrdenCompra>, msg: string) {
    this.trabajando.set(true);
    try {
      const r = await accion();
      this.ordenes.update((l) => l.map((x) => (x.id === r.id ? r : x)));
      if (this.detalle()?.id === r.id) this.detalle.set(r);
      this.store.ok(msg, `${r.codigo} · ${r.proveedor.razonSocial}`);
    } catch (e) {
      this.store.error('No se pudo actualizar la orden', e);
    } finally {
      this.trabajando.set(false);
    }
  }

  protected vencida(o: OrdenCompra): boolean {
    return (
      !!o.fechaEntrega &&
      (o.estado === 'enviada' || o.estado === 'parcial') &&
      o.fechaEntrega < new Date().toISOString().slice(0, 10)
    );
  }
}
