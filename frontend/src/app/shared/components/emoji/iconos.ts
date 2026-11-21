/**
 * Catálogo de emojis/íconos ilustrados de COLDWORK.
 *
 * Son SVG PROPIOS guardados en `public/emojis/` y servidos por la misma app:
 * cargan siempre (sin depender de otro servidor ni de la red del cliente),
 * se ven nítidos en cualquier pantalla y al imprimir, y no piden atribución.
 *
 * Para agregar uno:
 *  1. Guarda el SVG en `frontend/public/emojis/<nombre>.svg` (viewBox cuadrado).
 *  2. Agrega aquí el nombre y úsalo: <app-emoji nombre="<nombre>" />
 */
export const ICONOS = {
  copo: 'copo', // copo de nieve (logo)
  saludo: 'saludo', // mano saludando
  correo: 'correo', // sobre de correo
  edificio: 'edificio', // edificio de oficinas
} as const;

export type NombreIcono = keyof typeof ICONOS;

/** Ruta del SVG local (relativa a la app, funciona con cualquier base href). */
export function urlEmoji(nombre: NombreIcono): string {
  return `emojis/${ICONOS[nombre]}.svg`;
}
