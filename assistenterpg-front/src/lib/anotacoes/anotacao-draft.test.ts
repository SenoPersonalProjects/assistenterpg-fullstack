import { describe, expect, it } from 'vitest';
import {
  criarChaveRascunhoAnotacao,
  rascunhosAnotacaoDiferem,
  type RascunhoAnotacao,
} from './anotacao-draft';

const RASCUNHO: RascunhoAnotacao = {
  editandoId: null,
  titulo: 'Pista',
  conteudo: 'Conteúdo seguro',
  campanhaId: '10',
  sessaoId: '20',
};

describe('rascunho de anotação', () => {
  it('isola a chave por usuário e rejeita identificadores inválidos', () => {
    expect(criarChaveRascunhoAnotacao(10)).toContain(':10');
    expect(criarChaveRascunhoAnotacao(0)).toBeNull();
    expect(criarChaveRascunhoAnotacao(1.5)).toBeNull();
  });

  it('detecta mudanças que exigem confirmação antes do descarte', () => {
    expect(rascunhosAnotacaoDiferem(RASCUNHO, { ...RASCUNHO })).toBe(false);
    expect(
      rascunhosAnotacaoDiferem(RASCUNHO, {
        ...RASCUNHO,
        conteudo: 'Alterado',
      }),
    ).toBe(true);
  });
});
