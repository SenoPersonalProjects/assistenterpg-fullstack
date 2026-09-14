import { describe, expect, it } from 'vitest';
import { criarErroClienteObservavel } from './cliente';

describe('criarErroClienteObservavel', () => {
  it('remove quebras de linha e limita o conteúdo de erro', () => {
    const erro = criarErroClienteObservavel(
      'ERRO_JAVASCRIPT',
      new Error(`falha\n${'x'.repeat(600)}`),
      { rota: '/campanhas/1', versao: 'abc123' },
    );

    expect(erro).toMatchObject({
      tipo: 'ERRO_JAVASCRIPT',
      rota: '/campanhas/1',
      versao: 'abc123',
    });
    expect(erro.mensagem).not.toContain('\n');
    expect(erro.mensagem.length).toBe(500);
  });
});
