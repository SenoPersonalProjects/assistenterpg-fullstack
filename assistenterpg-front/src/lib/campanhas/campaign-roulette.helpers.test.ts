import { describe, expect, it } from 'vitest';
import type {
  CampanhaRoletaConfig,
  CampanhaRoletaEstado,
  CampanhaRoletaHistoricoItem,
  CampanhaRoletaPool,
  CampanhaRoletaPreset,
} from '@/lib/api/campanha-roleta';
import {
  aplicarSelecaoCatalogoRoleta,
  agruparCatalogoRoleta,
  agruparRepeticoesRoleta,
  calcularChanceRoleta,
  formatarChanceRoleta,
  historicoCompativelComPresetRoleta,
  itensCatalogoDisponiveisRoleta,
  lerConfigSnapshotRoleta,
  montarResumoConfigRoleta,
  removerEstadoPorSlotRoleta,
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

const config: CampanhaRoletaConfig = {
  fontes: { sistemaBase: false, suplementoIds: [7], homebrewIds: [] },
  exclusoes: [],
  inclusoesCatalogo: [],
  listaManualTexto: 'Teste; Outro; teste',
  compatibilidadesHereditarias: [],
};

const catalogo: CampanhaRoletaEstado['catalogo'] = {
  itens: [
    {
      chave: 'CLA:BASE',
      nome: 'Clã base',
      categoria: 'CLA',
      fonte: 'SISTEMA_BASE',
    },
    {
      chave: 'CLA:SUPLEMENTO',
      nome: 'Clã suplemento',
      categoria: 'CLA',
      fonte: 'SUPLEMENTO',
      fonteId: 7,
    },
    {
      chave: 'TECNICA:SUPLEMENTO',
      nome: 'Técnica suplemento',
      categoria: 'TECNICA',
      fonte: 'SUPLEMENTO',
      fonteId: 7,
      hereditaria: true,
    },
  ],
  suplementos: [{ id: 7, codigo: 'SUP', nome: 'Suplemento ativo' }],
  homebrews: [],
  participantes: [],
};

describe('campaign roulette helpers', () => {
  it('remove o slot sem manter uma entrada undefined', () => {
    const estado = removerEstadoPorSlotRoleta(
      { CLA: { id: 1 }, TECNICA: { id: 2 } },
      'CLA',
    );

    expect(estado).toEqual({ TECNICA: { id: 2 } });
    expect(Object.keys(estado)).not.toContain('CLA');
  });

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

  it('monta a visualizacao ociosa com lista manual e repeticoes', () => {
    const resumo = montarResumoConfigRoleta({
      modo: 'SIMPLES',
      config,
      catalogo,
    });

    expect(resumo.pool.itens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: 'Teste', ocorrencias: 2, pesoTotal: 2 }),
        expect.objectContaining({ nome: 'Outro', ocorrencias: 1, pesoTotal: 1 }),
      ]),
    );
    expect(resumo.pool.pesoTotal).toBe(3);
    expect(resumo.erros).toEqual([]);
  });

  it('mostra somente itens de fontes habilitadas e compativeis com o modo', () => {
    expect(
      itensCatalogoDisponiveisRoleta({
        itens: catalogo.itens,
        modo: 'CLA',
        config,
      }).map((item) => item.chave),
    ).toEqual(['CLA:SUPLEMENTO']);
  });

  it('agrupa o catalogo habilitado pelo nome da fonte', () => {
    const grupos = agruparCatalogoRoleta({ catalogo, modo: 'CLA', config });

    expect(grupos).toEqual([
      expect.objectContaining({
        chave: 'SUPLEMENTO:7',
        nome: 'Suplemento ativo',
        itens: [expect.objectContaining({ chave: 'CLA:SUPLEMENTO' })],
      }),
    ]);
  });

  it('usa exclusoes nos modos de regra e inclusoes no modo simples', () => {
    const regra = aplicarSelecaoCatalogoRoleta(
      config,
      'CLA',
      ['CLA:SUPLEMENTO'],
      false,
    );
    const simples = aplicarSelecaoCatalogoRoleta(
      config,
      'SIMPLES',
      ['CLA:SUPLEMENTO'],
      true,
    );

    expect(regra.exclusoes).toContain('CLA:SUPLEMENTO');
    expect(simples.inclusoesCatalogo).toContain('CLA:SUPLEMENTO');
  });

  it('sinaliza resumo vazio sem dividir ou inventar possibilidades', () => {
    const resumo = montarResumoConfigRoleta({
      modo: 'SIMPLES',
      config: { ...config, listaManualTexto: '' },
      catalogo,
    });

    expect(resumo.pool.quantidadeResultados).toBe(0);
    expect(resumo.erros).toContain(
      'Selecione ao menos uma possibilidade ou informe uma lista própria.',
    );
  });

  it('marca tecnicas hereditarias como condicionais no resumo', () => {
    const resumo = montarResumoConfigRoleta({
      modo: 'TECNICA',
      config: { ...config, listaManualTexto: '' },
      catalogo,
    });

    expect(resumo.tecnicasHereditariasCondicionais).toBe(1);
  });

  it('recupera resultado historico somente da revisao atual do preset', () => {
    const preset = {
      id: 1,
      campanhaId: 2,
      slot: 'CUSTOMIZADO',
      modo: 'SIMPLES',
      configVersao: 1,
      config,
      revisao: 4,
      atualizadoEm: '2026-07-18T12:00:00.000Z',
    } satisfies CampanhaRoletaPreset;
    const historico = {
      id: 10,
      campanhaId: 2,
      presetId: 1,
      slot: 'CUSTOMIZADO',
      modo: 'SIMPLES',
      alvo: null,
      status: 'FINALIZADO',
      configSnapshot: {
        slot: 'CUSTOMIZADO',
        modo: 'SIMPLES',
        configVersao: 1,
        presetRevisao: 4,
        config,
      },
      poolSnapshot: pool,
      resultados: [pool.itens[0]],
      resultadoFinal: pool.itens[0],
      revisao: 2,
      iniciadoPor: null,
      finalizadoPor: null,
      canceladoPor: null,
      criadoEm: '2026-07-18T12:00:00.000Z',
      atualizadoEm: '2026-07-18T12:00:01.000Z',
      finalizadoEm: '2026-07-18T12:00:01.000Z',
      canceladoEm: null,
      eventos: [],
    } satisfies CampanhaRoletaHistoricoItem;

    expect(historicoCompativelComPresetRoleta(historico, preset)).toBe(historico);
    expect(
      historicoCompativelComPresetRoleta(historico, { ...preset, revisao: 5 }),
    ).toBeNull();
  });
});
