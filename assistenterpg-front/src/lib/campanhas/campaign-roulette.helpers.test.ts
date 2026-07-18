import { describe, expect, it } from 'vitest';
import type { CampanhaRoletaPool } from '@/lib/api/campanha-roleta';
import {
  agruparRepeticoesRoleta,
  calcularChanceRoleta,
  formatarChanceRoleta,
  lerConfigSnapshotRoleta,
} from './campaign-roulette.helpers';

const pool: CampanhaRoletaPool = {
  modo: 'TECNICA',
  claSelecionadoChave: 'cla:zenin',
  claDuplicadoChave: null,
  itens: [
    {
      chave: 'tecnica:a',
      nome: 'Técnica A',
      categoria: 'TECNICA',
      fonte: 'SISTEMA_BASE',
      ocorrencias: 1,
      pesoUnitario: 1,
      pesoTotal: 1,
      incluidoManualmente: false,
    },
    {
      chave: 'tecnica:b',
      nome: 'Técnica B',
      categoria: 'TECNICA',
      fonte: 'SISTEMA_BASE',
      hereditaria: true,
      ocorrencias: 1,
      pesoUnitario: 2,
      pesoTotal: 2,
      incluidoManualmente: false,
    },
    {
      chave: 'manual:c',
      nome: 'Técnica C',
      categoria: 'MANUAL',
      fonte: 'MANUAL',
      ocorrencias: 3,
      pesoUnitario: 1,
      pesoTotal: 3,
      incluidoManualmente: true,
    },
  ],
  quantidadeResultados: 3,
  pesoTotal: 6,
};

describe('campaign roulette helpers', () => {
  it('preserva repeticoes e agrega nomes sem diferenciar caixa', () => {
    expect(agruparRepeticoesRoleta('Zenin; Kamo; zenin; Zenin')).toEqual([
      { nome: 'Zenin', quantidade: 3 },
    ]);
  });

  it('nao sinaliza itens sem repeticao', () => {
    expect(agruparRepeticoesRoleta('Zenin; Kamo')).toEqual([]);
  });

  it('calcula chances por peso efetivo e repeticoes', () => {
    const simples = calcularChanceRoleta({ pool, item: pool.itens[0] });
    const hereditaria = calcularChanceRoleta({ pool, item: pool.itens[1] });
    const repetida = calcularChanceRoleta({ pool, item: pool.itens[2] });

    expect(simples.probabilidade).toBeCloseTo(1 / 6);
    expect(hereditaria.probabilidade).toBeCloseTo(2 / 6);
    expect(repetida.probabilidade).toBeCloseTo(3 / 6);
    expect(formatarChanceRoleta(hereditaria)).toBe(
      '33,33% · aprox. 1 em 3 · peso 2/6',
    );
  });

  it('divide igualmente um pool com pesos iguais', () => {
    const poolIgual: CampanhaRoletaPool = {
      ...pool,
      itens: pool.itens.slice(0, 2).map((item) => ({
        ...item,
        pesoUnitario: 1,
        pesoTotal: 1,
      })),
      quantidadeResultados: 2,
      pesoTotal: 2,
    };

    expect(
      calcularChanceRoleta({ pool: poolIgual, item: poolIgual.itens[0] })
        .probabilidade,
    ).toBe(0.5);
  });

  it('remove integralmente a primeira tecnica no segundo giro', () => {
    const excluida = calcularChanceRoleta({
      pool,
      item: pool.itens[1],
      etapa: 2,
      primeiroResultadoChave: 'tecnica:b',
    });
    const restante = calcularChanceRoleta({
      pool,
      item: pool.itens[2],
      etapa: 2,
      primeiroResultadoChave: 'tecnica:b',
    });

    expect(excluida.elegivel).toBe(false);
    expect(formatarChanceRoleta(excluida)).toBe('Inelegível nesta etapa');
    expect(restante.pesoTotal).toBe(4);
    expect(restante.probabilidade).toBeCloseTo(3 / 4);
  });

  it('restaura o pool original no terceiro giro', () => {
    const chance = calcularChanceRoleta({
      pool,
      item: pool.itens[1],
      etapa: 3,
      primeiroResultadoChave: 'tecnica:b',
    });

    expect(chance.elegivel).toBe(true);
    expect(chance.pesoTotal).toBe(6);
    expect(chance.probabilidade).toBeCloseTo(2 / 6);
  });

  it('trata pool sem peso sem dividir por zero', () => {
    const chance = calcularChanceRoleta({
      pool: { ...pool, pesoTotal: 0 },
      item: pool.itens[0],
    });

    expect(chance.elegivel).toBe(false);
    expect(chance.umEm).toBeNull();
  });

  it('aceita somente snapshots de configuracao com estrutura conhecida', () => {
    expect(
      lerConfigSnapshotRoleta({
        slot: 'TECNICA',
        modo: 'TECNICA',
        configVersao: 1,
        presetRevisao: 2,
        config: {
          fontes: { sistemaBase: true, suplementoIds: [], homebrewIds: [] },
          exclusoes: [],
          inclusoesCatalogo: [],
          listaManualTexto: '',
          compatibilidadesHereditarias: [],
        },
      }),
    ).not.toBeNull();
    expect(lerConfigSnapshotRoleta({ configVersao: 1 })).toBeNull();
  });
});
