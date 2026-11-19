import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiService } from '../../api/services/api.service';
import { EmpresaActualService } from './empresa-actual.service';

describe('EmpresaActualService · permisos por área', () => {
  let svc: EmpresaActualService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: {} }] });
    svc = TestBed.inject(EmpresaActualService);
  });

  it('un trabajador solo puede entrar a sus áreas', () => {
    svc.cargar([{ id: 'E1', razonSocial: 'COLDWORK', ruc: null, rol: 'trabajador', areas: ['tecnica', 'contabilidad'] }]);
    expect(svc.puede('tecnica')).toBe(true);
    expect(svc.puede('contabilidad')).toBe(true);
    expect(svc.puede('ventas')).toBe(false);
    expect(svc.esAdmin()).toBe(false);
  });

  it('dueño y admin entran a todo', () => {
    for (const rol of ['dueno', 'admin'] as const) {
      svc.cargar([{ id: 'E1', razonSocial: 'COLDWORK', ruc: null, rol, areas: [] }]);
      expect(svc.puede('ventas')).toBe(true);
      expect(svc.esAdmin()).toBe(true);
    }
  });

  it('sin empresa no puede nada', () => {
    expect(svc.puede('ventas')).toBe(false);
  });
});
