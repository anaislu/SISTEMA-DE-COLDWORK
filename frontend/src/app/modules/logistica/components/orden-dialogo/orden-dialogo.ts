import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { desdeBase } from '../../../../core/utils/montos';
import type { OrdenCompra, Producto } from '../../models/logistica.model';
import { LogisticaStore, mensajeError } from '../../services/logistica-store.service';
import { OrdenesCompraService } from '../../services/ordenes-compra.service';
import { SelectorProducto } from '../selector-producto/selector-producto';

interface LineaOc {
  producto: Producto;
  cantidad: number;
  costo: number;
}

/** Nueva orden de compra: proveedor, almacén destino, productos y totales con IGV. */
@Component({
  selector: 'app-orden-dialogo',
  imports: [
    FormsModule,
    CurrencyPipe,
    DialogModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    SelectorProducto,
  ],
  templateUrl: './orden-dialogo.html',
})
export class OrdenDialogo {
  private readonly api = inject(OrdenesCompraService);
  protected readonly store = inject(LogisticaStore);

  readonly visible = model(false);
  /** Productos con los que se abre (ej. "Pedir a proveedor" desde inventario). */
  readonly sugeridos = input<Producto[]>([]);
  readonly creada = output<OrdenCompra>();

  protected readonly proveedorId = signal<string | null>(null);
  protected readonly almacenId = signal<string | null>(null);
  protected readonly fechaEntrega = signal('');
  protected readonly notas = signal('');
  protected readonly lineas = signal<LineaOc[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly ids = computed(() => this.lineas().map((l) => l.producto.id));
  protected readonly totales = computed(() =>
    desdeBase(this.lineas().reduce((t, l) => t + (l.cantidad || 0) * (l.costo || 0), 0)),
  );
  protected readonly proveedor = computed(() =>
    this.store.proveedores().find((p) => p.id === this.proveedorId()),
  );

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.proveedorId.set(null);
      this.almacenId.set(
        this.store.almacenesActivos().find((a) => a.tipo === 'principal')?.id ?? null,
      );
      this.fechaEntrega.set('');
      this.notas.set('');
      this.error.set(null);
      this.lineas.set(
        this.sugeridos().map((p) => ({
          producto: p,
          // Sugerencia: lo que falta para llegar a 2 veces el mínimo
          cantidad: Math.max(1, Math.ceil(p.stockMinimo * 2 - p.stockTotal)),
          costo: p.costoPromedio,
        })),
      );
    });
  }

  protected agregar(p: Producto) {
    this.lineas.update((l) => [...l, { producto: p, cantidad: 1, costo: p.costoPromedio }]);
  }
  protected cambiar(i: number, campo: 'cantidad' | 'costo', valor: number | null) {
    this.lineas.update((l) => l.map((x, j) => (j === i ? { ...x, [campo]: valor ?? 0 } : x)));
  }
  protected quitar(i: number) {
    this.lineas.update((l) => l.filter((_, j) => j !== i));
  }

  async guardar(enviar: boolean) {
    if (!this.proveedorId() || !this.almacenId())
      return this.error.set('Elige el proveedor y el almacén destino');
    if (!this.lineas().length) return this.error.set('Agrega al menos un producto');
    if (this.lineas().some((l) => !(l.cantidad > 0)))
      return this.error.set('Todas las cantidades deben ser mayores a 0');
    this.guardando.set(true);
    this.error.set(null);
    try {
      const oc = await this.api.crear({
        proveedorId: this.proveedorId()!,
        almacenId: this.almacenId()!,
        ...(this.fechaEntrega() ? { fechaEntrega: this.fechaEntrega() } : {}),
        notas: this.notas().trim(),
        enviar,
        items: this.lineas().map((l) => ({
          productoId: l.producto.id,
          cantidad: l.cantidad,
          costoUnitario: l.costo,
        })),
      });
      this.store.ok(
        enviar ? 'Orden enviada' : 'Borrador guardado',
        `${oc.codigo} · ${oc.proveedor.razonSocial}`,
      );
      this.creada.emit(oc);
      this.visible.set(false);
    } catch (e) {
      this.error.set(mensajeError(e) ?? 'No se pudo crear la orden');
    } finally {
      this.guardando.set(false);
    }
  }
}
