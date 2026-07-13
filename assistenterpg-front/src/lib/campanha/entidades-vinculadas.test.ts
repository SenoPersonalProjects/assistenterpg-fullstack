import { describe, expect, it } from 'vitest';
import {
  entidadeVinculadaAtivaNestaSessao,
  formatarUsoCapacidadeEntidadeVinculada,
  podeInvocarEntidadeVinculada,
  resolverFluxoCriacaoEntidadeVinculada,
  validarPontosVidaEntidadeVinculada,
} from './entidades-vinculadas';
import type { CapacidadeEntidadeVinculada } from '@/lib/types';

function criarCapacidade(
  overrides: Partial<CapacidadeEntidadeVinculada> = {},
): CapacidadeEntidadeVinculada {
  return {
    tipo: 'SHIKIGAMI',
    habilitado: true,
    modo: 'CRIAVEL',
    permiteCriarNovos: true,
    usaTemplates: false,
    cadastro: {
      unidade: 'QUANTIDADE',
      usado: 0,
      maximo: 1,
      disponivel: 1,
      excedente: 0,
    },
    ativo: {
      unidade: 'QUANTIDADE',
      usado: 0,
      maximo: 1,
      disponivel: 1,
      excedente: 0,
    },
    configuracoes: [],
    ...overrides,
  };
}

describe('entidades-vinculadas helpers', () => {
  it('valida PV atual e maximo', () => {
    expect(validarPontosVidaEntidadeVinculada(10, 0)).toBeNull();
    expect(validarPontosVidaEntidadeVinculada(0, 0)).toContain('PV maximo');
    expect(validarPontosVidaEntidadeVinculada(10, -1)).toContain('PV atual');
    expect(validarPontosVidaEntidadeVinculada(10, 11)).toContain(
      'PV atual nao pode ser maior',
    );
  });

  it('resolve ativo nesta sessao sem depender apenas do estado global', () => {
    expect(
      entidadeVinculadaAtivaNestaSessao({
        ativoNestaSessao: true,
        instanciasAtivas: [],
      }),
    ).toBe(true);
    expect(
      entidadeVinculadaAtivaNestaSessao({
        instanciasAtivas: [
          {
            id: 1,
            sessaoId: 21,
            cenaId: 31,
            pontosVidaAtual: 10,
            ocultoJogadores: false,
          },
        ],
      }),
    ).toBe(true);
    expect(entidadeVinculadaAtivaNestaSessao({})).toBe(false);
  });

  it('permite invocar estado ATIVO antigo quando nao esta ativo nesta sessao', () => {
    expect(
      podeInvocarEntidadeVinculada(
        {
          estado: 'ATIVO',
          ativoNestaSessao: false,
          instanciasAtivas: [],
        },
        false,
      ),
    ).toBe(true);
    expect(
      podeInvocarEntidadeVinculada(
        {
          estado: 'ATIVO',
          ativoNestaSessao: true,
          instanciasAtivas: [],
        },
        false,
      ),
    ).toBe(false);
    expect(
      podeInvocarEntidadeVinculada(
        {
          estado: 'DESTRUIDO',
          ativoNestaSessao: false,
          instanciasAtivas: [],
        },
        false,
      ),
    ).toBe(false);
  });

  it('formata capacidade por quantidade, vagas e limite aberto', () => {
    expect(
      formatarUsoCapacidadeEntidadeVinculada(criarCapacidade(), 'cadastro'),
    ).toBe('0/1');
    expect(
      formatarUsoCapacidadeEntidadeVinculada(
        criarCapacidade({
          ativo: {
            unidade: 'VAGAS',
            usado: 2,
            maximo: 4,
            disponivel: 2,
            excedente: 0,
          },
        }),
        'ativo',
      ),
    ).toBe('2/4 vagas');
    expect(
      formatarUsoCapacidadeEntidadeVinculada(
        criarCapacidade({
          cadastro: {
            unidade: 'QUANTIDADE',
            usado: 3,
            maximo: null,
            disponivel: null,
            excedente: 0,
          },
        }),
        'cadastro',
      ),
    ).toBe('3/sem limite');
  });

  it('distingue criacao manual, templates e tecnica bloqueada', () => {
    expect(resolverFluxoCriacaoEntidadeVinculada(criarCapacidade())).toEqual({
      habilitado: true,
      permiteCriacaoManual: true,
      permiteTemplates: false,
      bloqueado: false,
    });
    expect(
      resolverFluxoCriacaoEntidadeVinculada(
        criarCapacidade({
          modo: 'PREDEFINIDOS',
          permiteCriarNovos: false,
          usaTemplates: true,
        }),
      ),
    ).toMatchObject({
      permiteCriacaoManual: false,
      permiteTemplates: true,
      bloqueado: false,
    });
    expect(resolverFluxoCriacaoEntidadeVinculada(undefined).bloqueado).toBe(
      true,
    );
  });
});
