import { describe, expect, it } from 'vitest';
import {
  entidadeVinculadaAtivaNestaSessao,
  podeInvocarEntidadeVinculada,
  validarPontosVidaEntidadeVinculada,
} from './entidades-vinculadas';

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
});
