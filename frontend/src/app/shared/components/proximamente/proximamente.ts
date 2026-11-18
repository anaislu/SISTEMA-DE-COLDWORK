import { Component, input } from '@angular/core';

/** Pantalla temporal para módulos que aún no se construyen. */
@Component({
  selector: 'app-proximamente',
  template: `
    <div class="caja">
      <i class="pi pi-wrench"></i>
      <h2>{{ titulo() ?? 'Módulo' }}</h2>
      <p>En construcción. Este módulo llega en uno de los próximos sprints.</p>
    </div>
  `,
  styles: `
    .caja { text-align: center; padding: 4rem 1rem; color: var(--p-text-muted-color); }
    .caja i { font-size: 2.5rem; color: var(--p-primary-color); }
    .caja h2 { color: var(--p-text-color); margin: 1rem 0 0.5rem; }
  `,
})
export class Proximamente {
  /** Viene de data.titulo en app.routes.ts. */
  readonly titulo = input<string>();
}
