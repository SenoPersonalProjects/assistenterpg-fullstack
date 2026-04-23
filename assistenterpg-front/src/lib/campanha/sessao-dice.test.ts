import { describe, expect, it } from 'vitest';
import {
  calcularResultadoDice,
  parseDiceInput,
  parseDiceExpression,
} from './sessao-dice';

describe('sessao-dice parser', () => {
  it('aceita espacos em operadores matematicos', () => {
    expect(parseDiceExpression('1d6 + 3').expression).toMatchObject({
      quantidade: 1,
      faces: 6,
      operador: '+',
      modificador: 3,
    });
    expect(parseDiceExpression('2d6 - 1').expression).toMatchObject({
      quantidade: 2,
      faces: 6,
      operador: '-',
      modificador: 1,
    });
    expect(parseDiceExpression('1d20 * 2').expression).toMatchObject({
      quantidade: 1,
      faces: 20,
      operador: '*',
      modificador: 2,
    });
    expect(parseDiceExpression('1d20 / 2').expression).toMatchObject({
      quantidade: 1,
      faces: 20,
      operador: '/',
      modificador: 2,
    });
  });

  it('aceita multiplas rolagens com espacos e separadores', () => {
    expect(parseDiceInput('d20 + 5 2d6 - 1').expressions).toEqual([
      expect.objectContaining({ quantidade: 1, faces: 20, operador: '+', modificador: 5 }),
      expect.objectContaining({ quantidade: 2, faces: 6, operador: '-', modificador: 1 }),
    ]);

    expect(parseDiceInput('d20 + 5, 2d6 - 1').expressions).toEqual([
      expect.objectContaining({ quantidade: 1, faces: 20, operador: '+', modificador: 5 }),
      expect.objectContaining({ quantidade: 2, faces: 6, operador: '-', modificador: 1 }),
    ]);

    expect(parseDiceInput('Ataque: d20 + 5 Defesa: d20 + 2').expressions).toEqual([
      expect.objectContaining({
        label: 'Ataque',
        quantidade: 1,
        faces: 20,
        modificador: 5,
      }),
      expect.objectContaining({
        label: 'Defesa',
        quantidade: 1,
        faces: 20,
        modificador: 2,
      }),
    ]);
  });
});

describe('calcularResultadoDice', () => {
  it('mantem rolagem normal somando dados e modificador uma vez', () => {
    const resultado = calcularResultadoDice({
      quantidade: 2,
      faces: 6,
      operador: '+',
      modificador: 5,
      aplicarModificadorPorDado: false,
      rolagens: [2, 6],
    });

    expect(resultado.totalBase).toBe(8);
    expect(resultado.rolagensFinais).toEqual([2, 6]);
    expect(resultado.total).toBe(13);
    expect(resultado.indiceEscolhido).toBeNull();
  });

  it('usa o maior valor individual como total principal para #', () => {
    const resultado = calcularResultadoDice({
      quantidade: 2,
      faces: 6,
      operador: '+',
      modificador: 5,
      aplicarModificadorPorDado: true,
      rolagens: [2, 6],
    });

    expect(resultado.keepMode).toBe('HIGHEST');
    expect(resultado.rolagensFinais).toEqual([7, 11]);
    expect(resultado.total).toBe(11);
    expect(resultado.indiceEscolhido).toBe(1);
  });

  it('usa o menor valor individual para # com keepMode LOWEST', () => {
    const resultado = calcularResultadoDice({
      quantidade: 2,
      faces: 6,
      operador: '+',
      modificador: 5,
      aplicarModificadorPorDado: true,
      keepMode: 'LOWEST',
      rolagens: [2, 6],
    });

    expect(resultado.keepMode).toBe('LOWEST');
    expect(resultado.rolagensFinais).toEqual([7, 11]);
    expect(resultado.total).toBe(7);
    expect(resultado.indiceEscolhido).toBe(0);
  });
});
