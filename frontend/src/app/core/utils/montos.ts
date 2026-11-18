/**
 * Utilidades de montos en soles. Se trabaja en CÉNTIMOS (enteros) para no
 * arrastrar errores de coma flotante; la BD usa numeric(14,2).
 */
export const TASA_IGV = 0.18;

export const aCentimos = (soles: number) => Math.round(soles * 100);
export const aSoles = (centimos: number) => centimos / 100;

export interface Desglose {
  base: number;
  igv: number;
  total: number;
}

/** Desde el valor de venta (sin IGV). */
export function desdeBase(base: number, tasa = TASA_IGV): Desglose {
  const b = aCentimos(base);
  const igv = Math.round(b * tasa);
  return { base: aSoles(b), igv: aSoles(igv), total: aSoles(b + igv) };
}

/** Desde el precio total (IGV incluido). La base se ajusta para que base + igv = total exacto. */
export function desdeTotal(total: number, tasa = TASA_IGV): Desglose {
  const t = aCentimos(total);
  const b = Math.round(t / (1 + tasa));
  return { base: aSoles(b), igv: aSoles(t - b), total: aSoles(t) };
}
