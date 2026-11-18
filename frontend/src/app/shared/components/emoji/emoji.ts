import { Component, computed, input } from '@angular/core';
import { ICONOS, type NombreIcono, urlFlaticon } from './iconos';

/**
 * Emoji/ícono ilustrado como IMAGEN por link de Flaticon, nunca como
 * carácter Unicode: se ve igual en Windows, Android, iPhone y al imprimir.
 *
 * Uso:  <app-emoji nombre="saludo" etiqueta="saludo" />
 * El catálogo de nombres está en iconos.ts.
 */
@Component({
  selector: 'app-emoji',
  template: `<img
    [src]="src()"
    [alt]="etiqueta()"
    [attr.aria-hidden]="etiqueta() ? null : 'true'"
    loading="lazy"
    draggable="false"
  />`,
  styles: `
    :host { display: inline-flex; vertical-align: -0.15em; }
    img { width: 1.1em; height: 1.1em; object-fit: contain; }
  `,
})
export class Emoji {
  readonly nombre = input.required<NombreIcono>();
  readonly etiqueta = input('');
  protected readonly src = computed(() => urlFlaticon(ICONOS[this.nombre()]));
}
