import { Component, computed, input } from '@angular/core';

/**
 * Emoji como IMAGEN por link (Twemoji), nunca como carácter Unicode:
 * se ve igual en Windows, Android, iPhone y al imprimir.
 *
 * Uso: <app-emoji codigo="1f44b" etiqueta="saludo" />
 * Códigos: https://github.com/jdecked/twemoji (nombre del archivo SVG).
 */
const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/';

@Component({
  selector: 'app-emoji',
  template: `<img [src]="src()" [alt]="etiqueta()" [attr.aria-hidden]="etiqueta() ? null : 'true'" draggable="false" />`,
  styles: `
    :host { display: inline-flex; vertical-align: -0.15em; }
    img { width: 1.1em; height: 1.1em; }
  `,
})
export class Emoji {
  readonly codigo = input.required<string>();
  readonly etiqueta = input('');
  protected readonly src = computed(() => `${BASE}${this.codigo()}.svg`);
}
