import { computed, Injectable, signal } from '@angular/core';
import type { MiEmpresa } from '../../../modules/empresas/models/empresa.model';

const CLAVE = 'coldwork-empresa';

/** Empresa con la que se está trabajando (se recuerda entre visitas). */
@Injectable({ providedIn: 'root' })
export class EmpresaActualService {
  readonly empresas = signal<MiEmpresa[]>([]);
  private readonly elegidaId = signal<string | null>(localStorage.getItem(CLAVE));

  readonly actual = computed(() => {
    const lista = this.empresas();
    return lista.find((e) => e.id === this.elegidaId()) ?? lista[0] ?? null;
  });
  readonly id = computed(() => this.actual()?.id ?? null);
  readonly rol = computed(() => this.actual()?.rol ?? null);

  cargar(lista: MiEmpresa[]) {
    this.empresas.set(lista);
  }

  elegir(id: string) {
    this.elegidaId.set(id);
    localStorage.setItem(CLAVE, id);
  }

  limpiar() {
    this.empresas.set([]);
    this.elegidaId.set(null);
    localStorage.removeItem(CLAVE);
  }
}
