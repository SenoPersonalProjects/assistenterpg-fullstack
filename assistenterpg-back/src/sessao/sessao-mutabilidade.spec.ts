import { SessaoEncerradaException } from 'src/common/exceptions/campanha.exception';
import { assertSessaoMutavel } from './sessao-mutabilidade';

describe('assertSessaoMutavel', () => {
  it('permite sessão que ainda não foi encerrada', () => {
    expect(() =>
      assertSessaoMutavel({ status: 'EM_ANDAMENTO' }, 7, 21, 'alterar cena'),
    ).not.toThrow();
  });

  it('rejeita sessão encerrada com código e contexto estáveis', () => {
    expect(() =>
      assertSessaoMutavel({ status: 'ENCERRADA' }, 7, 21, 'alterar cena'),
    ).toThrow(SessaoEncerradaException);

    try {
      assertSessaoMutavel({ status: 'ENCERRADA' }, 7, 21, 'alterar cena');
    } catch (error) {
      expect(error).toMatchObject({
        code: 'SESSAO_ENCERRADA',
        details: {
          campanhaId: 7,
          sessaoId: 21,
          acao: 'alterar cena',
        },
      });
    }
  });
});
