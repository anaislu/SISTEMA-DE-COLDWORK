import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LlegadaAsistente } from '../../components/llegada-asistente/llegada-asistente';
import type { Llegada, OrdenCompra } from '../../models/logistica.model';
import { LogisticaStore } from '../../services/logistica-store.service';
import { MovimientosService } from '../../services/movimientos.service';
import { OrdenesCompraService } from '../../services/ordenes-compra.service';

/** Vista: LLEGADA DE PRODUCTO (historial + asistente de registro). */
@Component({
  selector: 'app-llegadas',
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe, LlegadaAsistente],
  templateUrl: './llegadas.html',
  styleUrl: '../salidas/documentos.scss',
})
export class Llegadas implements OnInit {
  private readonly api = inject(MovimientosService);
  private readonly ocApi = inject(OrdenesCompraService);
  private readonly store = inject(LogisticaStore);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly llegadas = signal<Llegada[]>([]);
  protected readonly pendientes = signal<OrdenCompra[]>([]);
  protected readonly cargando = signal(true);
  protected readonly texto = signal('');
  protected readonly abierta = signal<string | null>(null);
  protected readonly asistente = signal(false);
  protected readonly ordenInicial = signal<string | null>(null);

  protected readonly lista = computed(() => {
    const t = this.texto().trim().toLowerCase();
    return this.llegadas().filter(
      (l) =>
        !t ||
        [
          l.codigo,
          l.proveedor?.razonSocial,
          l.guiaRemision,
          l.comprobante,
          l.orden?.codigo,
          ...l.lineas.map((x) => x.nombre),
        ]
          .join(' ')
          .toLowerCase()
          .includes(t),
    );
  });
  protected readonly delMes = computed(() => {
    const mes = new Date().toISOString().slice(0, 7);
    const l = this.llegadas().filter((x) => x.fecha.startsWith(mes));
    return { n: l.length, valor: l.reduce((t, x) => t + x.total, 0) };
  });

  async ngOnInit() {
    await Promise.all([this.cargar(), this.store.asegurar()]);
    const q = this.ruta.snapshot.queryParamMap;
    if (q.get('oc')) this.abrir(q.get('oc'));
    else if (q.get('nuevo')) this.abrir();
  }

  async cargar() {
    this.cargando.set(true);
    try {
      const [l, oc] = await Promise.all([this.api.llegadas(), this.ocApi.listar()]);
      this.llegadas.set(l);
      this.pendientes.set(oc.filter((o) => o.estado === 'enviada' || o.estado === 'parcial'));
    } catch (e) {
      this.store.error('No se pudieron cargar las llegadas', e);
    } finally {
      this.cargando.set(false);
    }
  }

  protected abrir(ordenId: string | null = null) {
    this.ordenInicial.set(ordenId);
    this.asistente.set(true);
    // Limpia ?nuevo / ?oc para que al recargar no se vuelva a abrir
    void this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  protected alRegistrar(l: Llegada) {
    this.abierta.set(l.id);
    void this.cargar();
  }

  protected alternar(id: string) {
    this.abierta.update((a) => (a === id ? null : id));
  }
}
