import { Component, computed, input } from '@angular/core';
import { type NombreIcono, urlEmoji } from './iconos';

/**
 * Emoji/ícono ilustrado como IMAGEN (SVG propio en public/emojis), nunca como
 * carácter Unicode: se ve igual en Windows, Android, iPhone y al imprimir,
 * y carga siempre porque lo sirve la misma app.
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
    draggable="false"
  />`,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: -0.15em;
    }
    img {
      width: 1.1em;
      height: 1.1em;
      object-fit: contain;
    }
  `,
})
export class Emoji {
  readonly nombre = input.required<NombreIcono>();
  readonly etiqueta = input('');
  protected readonly src = computed(() => urlEmoji(this.nombre()));
}
