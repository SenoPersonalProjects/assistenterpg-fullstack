import { describe, expect, it } from 'vitest';
import { criarAcessibilidadeCampo } from './field-accessibility';

describe('criarAcessibilidadeCampo', () => {
  it('mantém descrição externa e associa ajuda e erro ao campo', () => {
    expect(
      criarAcessibilidadeCampo({
        id: 'nome',
        ariaDescribedBy: 'descricao-contextual',
        possuiAjuda: true,
        possuiErro: true,
      }),
    ).toEqual({
      helperId: 'nome-helper',
      errorId: 'nome-error',
      describedBy: 'descricao-contextual nome-helper nome-error',
      errorMessage: 'nome-error',
    });
  });

  it('não cria referência descritiva quando não há mensagens', () => {
    expect(
      criarAcessibilidadeCampo({
        id: 'nome',
        possuiAjuda: false,
        possuiErro: false,
      }),
    ).toEqual({
      helperId: 'nome-helper',
      errorId: 'nome-error',
      describedBy: undefined,
      errorMessage: undefined,
    });
  });
});
