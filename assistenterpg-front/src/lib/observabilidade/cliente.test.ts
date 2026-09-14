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

  it('redige tokens e senhas da mensagem enviada ao coletor', () => {
    const erro = criarErroClienteObservavel(
      'PROMISE_REJEITADA',
      new Error('Bearer segredo token=abc senha=123'),
      { rota: '/campanhas/1', versao: 'abc123' },
    );

    expect(erro.mensagem).toContain('[redigido]');
    expect(erro.mensagem).not.toContain('segredo');
    expect(erro.mensagem).not.toContain('abc');
    expect(erro.mensagem).not.toContain('123');
  });
});
