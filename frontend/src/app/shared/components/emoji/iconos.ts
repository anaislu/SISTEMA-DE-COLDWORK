/**
 * Catálogo de emojis/íconos ilustrados de COLDWORK, sacados de Flaticon
 * (https://www.flaticon.es) y usados por LINK directo a su CDN.
 *
 * Para agregar uno:
 *  1. Búscalo en flaticon.es (que sea gratuito, sin corona de Premium).
 *  2. Copia el número del ícono (aparece en la URL de la imagen:
 *     https://cdn-icons-png.flaticon.com/512/642/642000.png → 642000).
 *  3. Agrégalo aquí con un nombre y úsalo: <app-emoji nombre="copo" />
 *  4. Anótalo en docs/CREDITOS.md (la licencia gratuita pide atribución).
 */
export const ICONOS = {
  copo: 642000, // copo de nieve (logo)
  saludo: 2866069, // mano saludando
  correo: 4338995, // sobre de correo
  edificio: 2098439, // edificio de oficinas
} as const;

export type NombreIcono = keyof typeof ICONOS;

/** URL del PNG en el CDN de Flaticon. La carpeta es el ID sin los 3 últimos dígitos. */
export function urlFlaticon(id: number, tamano: 16 | 24 | 32 | 64 | 128 | 256 | 512 = 128): string {
  return `https://cdn-icons-png.flaticon.com/${tamano}/${Math.floor(id / 1000)}/${id}.png`;
}
