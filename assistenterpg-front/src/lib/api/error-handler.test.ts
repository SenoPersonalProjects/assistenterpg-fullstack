import { describe, expect, it } from 'vitest';
import { extrairContextoErro, formatarErroComContexto } from './error-handler';

describe('error-handler context helpers', () => {
  it('extracts status, code, method, endpoint and requestId', () => {
    const error = {
      status: 422,
      code: 'VALIDATION_ERROR',
      response: {
        status: 422,
        config: {
          method: 'post',
          url: '/personagens-base',
        },
        headers: {
          'x-request-id': 'req-123',
        },
      },
      body: {
        statusCode: 422,
        code: 'VALIDATION_ERROR',
      },
    };

    const contexto = extrairContextoErro(error);
    expect(contexto).toEqual({
      status: 422,
      code: 'VALIDATION_ERROR',
      method: 'POST',
      endpoint: '/personagens-base',
      requestId: 'req-123',
    });
  });

  it('formats message with default status/code context', () => {
    const error = {
      status: 404,
      code: 'NOT_FOUND',
    };

    const mensagem = formatarErroComContexto('Recurso nao encontrado.', error);
    expect(mensagem).toBe('Recurso nao encontrado. (status 404 | code NOT_FOUND)');
  });

  it('formats message including endpoint and requestId when enabled', () => {
    const error = {
      response: {
        status: 500,
        config: {
          method: 'get',
          url: '/campanhas/10',
        },
        headers: {
          'x-correlation-id': 'corr-xyz',
        },
      },
      body: {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      },
    };

    const mensagem = formatarErroComContexto('Erro interno.', error, {
      incluirEndpoint: true,
      incluirRequestId: true,
    });

    expect(mensagem).toBe(
      'Erro interno. (status 500 | code INTERNAL_ERROR | GET /campanhas/10 | requestId corr-xyz)',
    );
  });

  it('returns base message when no context is available', () => {
    const mensagem = formatarErroComContexto('Falha generica.', new Error('x'));
    expect(mensagem).toBe('Falha generica.');
  });
});

