import { describe, expect, it } from 'vitest';
import {
  criarErroControleTurno,
  montarPrecondicaoControleTurno,
} from './sessao-turnos';

describe('montarPrecondicaoControleTurno', () => {
  it('usa rodada e indice atuais na iniciativa normal', () => {
    expect(
      montarPrecondicaoControleTurno({
        rodadaAtual: 4,
        iniciativa: { indiceAtual: 2 },
        iniciativaAlternada: null,
      }),
    ).toEqual({ rodadaEsperada: 4, indiceTurnoEsperado: 2 });
  });

  it('usa rodada e lado atuais na iniciativa alternada', () => {
    expect(
      montarPrecondicaoControleTurno({
        rodadaAtual: 6,
        iniciativa: { indiceAtual: 0 },
        iniciativaAlternada: { ativo: true, ladoAtualId: 9 },
      }),
    ).toEqual({ rodadaEsperada: 6, ladoAtualIdEsperado: 9 });
  });
});

describe('criarErroControleTurno', () => {
  it('troca a mensagem de DB_P2028 preservando suporte tecnico', () => {
    const erro = criarErroControleTurno({
      status: 500,
      body: {
        statusCode: 500,
        code: 'DB_P2028',
        traceId: 'trace-turno-1',
        message: 'Transaction already closed',
      },
    });

    expect(erro).toEqual({
      message: 'A sessão demorou para processar efeitos automáticos. Tente novamente.',
      code: 'DB_P2028',
      referenceId: 'trace-turno-1',
      status: 500,
      retryAfterSeconds: undefined,
    });
  });

  it('mantem a mensagem padrao para outros erros', () => {
    const erro = criarErroControleTurno({
      status: 403,
      body: {
        statusCode: 403,
        code: 'ACESSO_NEGADO',
        traceId: 'trace-access-1',
      },
    });

    expect(erro).toMatchObject({
      message: 'Você não tem permissão para acessar este recurso',
      code: 'ACESSO_NEGADO',
      referenceId: 'trace-access-1',
      status: 403,
    });
  });
});
