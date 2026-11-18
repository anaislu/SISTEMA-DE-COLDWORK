import { desdeBase, desdeTotal } from './montos';

describe('montos (IGV 18 %)', () => {
  it('calcula IGV desde la base', () => {
    expect(desdeBase(100)).toEqual({ base: 100, igv: 18, total: 118 });
    expect(desdeBase(0.1)).toEqual({ base: 0.1, igv: 0.02, total: 0.12 });
  });

  it('separa IGV desde el total y siempre cuadra', () => {
    expect(desdeTotal(118)).toEqual({ base: 100, igv: 18, total: 118 });
    for (const total of [1, 9.99, 250.5, 1234.56, 99999.99]) {
      const d = desdeTotal(total);
      expect(Math.round((d.base + d.igv) * 100)).toBe(Math.round(total * 100));
    }
  });
});
