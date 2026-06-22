import { describe, expect, it } from 'vitest';
import {
  criarErroLocalUsuario,
  criarErroUsuario,
  extrairContextoErro,
  extrairMensagemErro,
  formatarSuporteErro,
  formatarErroComContexto,
} from './error-handler';

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
      retryAfterSeconds: undefined,
    });
  });

  it('uses body traceId as support reference when header is absent', () => {
    const error = {
      status: 500,
      body: {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        traceId: 'trace-body-123',
        message: 'Erro interno',
      },
    };

    const contexto = extrairContextoErro(error);
    expect(contexto.requestId).toBe('trace-body-123');
  });

  it('builds user-facing error with code, reference and retry cooldown', () => {
    const userError = criarErroUsuario({
      status: 429,
      retryAfterSeconds: 30,
      body: {
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        traceId: 'trace-rate-1',
        message: 'Muitas tentativas',
      },
    });

    expect(userError).toMatchObject({
      message: 'Muitas tentativas. Tente novamente em 30s.',
      code: 'RATE_LIMIT_EXCEEDED',
      referenceId: 'trace-rate-1',
      status: 429,
      retryAfterSeconds: 30,
    });
  });

  it('builds local user-facing error without support metadata', () => {
    expect(criarErroLocalUsuario('Campo obrigatorio.')).toEqual({
      message: 'Campo obrigatorio.',
    });
  });

  it('formats support line with code and reference', () => {
    expect(
      formatarSuporteErro({
        code: 'VALIDATION_ERROR',
        referenceId: 'trace-abc',
      }),
    ).toBe('Código: VALIDATION_ERROR | Ref: trace-abc');
  });

  it('formats message with default status/code context', () => {
    const error = {
      status: 404,
      code: 'NOT_FOUND',
    };

    const mensagem = formatarErroComContexto('Recurso não encontrado.', error);
    expect(mensagem).toBe('Recurso não encontrado. (status 404 | code NOT_FOUND)');
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

  it('formats 429 errors with Retry-After cooldown', () => {
    const mensagem = extrairMensagemErro({
      status: 429,
      retryAfterSeconds: 75,
    });

    expect(mensagem).toBe('Muitas tentativas. Tente novamente em 2 min.');
  });
});

