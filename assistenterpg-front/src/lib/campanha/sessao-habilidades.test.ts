import { describe, expect, it } from 'vitest';
import type {
  HabilidadeTecnicaSessaoCampanha,
  VariacaoHabilidadeSessaoCampanha,
} from '../types/campanha.types';
import {
  duracaoEhSustentada,
  formatarCustos,
  resolverCustoExibicaoSessao,
} from './sessao-habilidades';

function habilidadeBase(
  overrides: Partial<HabilidadeTecnicaSessaoCampanha> = {},
): HabilidadeTecnicaSessaoCampanha {
  return {
    id: 1,
    tecnicaId: 10,
    codigo: 'HAB_TESTE',
    nome: 'Habilidade Teste',
    descricao: 'desc',
    requisitos: null,
    execucao: 'ACAO_PADRAO',
    area: null,
    alcance: null,
    alvo: null,
    duracao: 'Sustentada',
    custoPE: 0,
    custoEA: 2,
    custoSustentacaoEA: null,
    custoSustentacaoPE: null,
    escalonaPorGrau: true,
    grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
    acumulosMaximos: 2,
    escalonamentoCustoEA: 1,
    escalonamentoCustoPE: 0,
    escalonamentoTipo: 'OUTRO',
    escalonamentoEfeito: null,
    escalonamentoDano: null,
    danoFlat: null,
    danoFlatTipo: null,
    efeito: 'efeito',
    ordem: 1,
    variacoes: [],
    ...overrides,
  };
}

function variacaoBase(
  overrides: Partial<VariacaoHabilidadeSessaoCampanha> = {},
): VariacaoHabilidadeSessaoCampanha {
  return {
    id: 11,
    habilidadeTecnicaId: 1,
    nome: 'Variacao Teste',
    descricao: 'desc',
    substituiCustos: false,
    custoPE: 0,
    custoEA: 0,
    custoSustentacaoEA: null,
    custoSustentacaoPE: null,
    execucao: null,
    area: null,
    alcance: null,
    alvo: null,
    duracao: null,
    resistencia: null,
    dtResistencia: null,
    danoFlat: null,
    danoFlatTipo: null,
    efeitoAdicional: null,
    escalonaPorGrau: null,
    grauTipoGrauCodigo: null,
    acumulosMaximos: 0,
    escalonamentoCustoEA: null,
    escalonamentoCustoPE: null,
    escalonamentoTipo: null,
    escalonamentoEfeito: null,
    escalonamentoDano: null,
    requisitos: null,
    ordem: 1,
    ...overrides,
  };
}

describe('sessao-habilidades utils', () => {
  it('formata custos EA + PE corretamente', () => {
    expect(formatarCustos(2, 3)).toBe('EA 2 | PE 3');
    expect(formatarCustos(1, 0)).toBe('EA 1');
    expect(formatarCustos(0, 0)).toBe('Sem custo');
  });

  it('identifica duracao sustentada com variacoes de texto', () => {
    expect(duracaoEhSustentada('Sustentada')).toBe(true);
    expect(duracaoEhSustentada('Concentração')).toBe(true);
    expect(duracaoEhSustentada('Instantanea')).toBe(false);
  });

  it('aplica fallback de sustentacao para habilidade sustentada', () => {
    const custo = resolverCustoExibicaoSessao(habilidadeBase());

    expect(custo.sustentada).toBe(true);
    expect(custo.custoSustentacaoEA).toBe(1);
    expect(custo.custoSustentacaoPE).toBe(0);
    expect(custo.escalonavel).toBe(true);
    expect(custo.escalonamentoCustoEA).toBe(1);
  });

  it('respeita override de variacao para custos e sustentacao EA/PE', () => {
    const habilidade = habilidadeBase({
      custoEA: 2,
      custoPE: 1,
      custoSustentacaoEA: 1,
      custoSustentacaoPE: 0,
    });
    const variacao = variacaoBase({
      custoEA: 3,
      custoPE: 2,
      custoSustentacaoEA: 4,
      custoSustentacaoPE: 5,
      duracao: 'Sustentada',
      escalonaPorGrau: true,
      acumulosMaximos: 4,
      escalonamentoCustoEA: 2,
      escalonamentoCustoPE: 1,
    });

    const custo = resolverCustoExibicaoSessao(habilidade, variacao);

    expect(custo.custoEA).toBe(5);
    expect(custo.custoPE).toBe(3);
    expect(custo.custoSustentacaoEA).toBe(4);
    expect(custo.custoSustentacaoPE).toBe(5);
    expect(custo.escalonavel).toBe(true);
    expect(custo.acumulosMaximos).toBe(4);
    expect(custo.escalonamentoCustoEA).toBe(2);
    expect(custo.escalonamentoCustoPE).toBe(1);
  });
});
