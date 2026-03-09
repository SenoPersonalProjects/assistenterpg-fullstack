import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { BaseException } from '../exceptions/base.exception';
import {
  createErrorBase,
  normalizeHttpExceptionPayload,
} from './error-response.util';

function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'POST',
    url: '/fallback',
    originalUrl: '/api/teste?x=1',
    ...overrides,
  } as Request;
}

describe('error-response.util', () => {
  describe('createErrorBase', () => {
    it('deve usar originalUrl quando existir', () => {
      const request = mockRequest();

      const base = createErrorBase(
        request,
        'trace-123',
        HttpStatus.BAD_REQUEST,
      );

      expect(base.path).toBe('/api/teste?x=1');
      expect(base.method).toBe('POST');
      expect(base.traceId).toBe('trace-123');
      expect(base.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(typeof base.timestamp).toBe('string');
    });

    it('deve usar url como fallback', () => {
      const request = mockRequest({ originalUrl: '' });

      const base = createErrorBase(request, 'trace-abc', HttpStatus.NOT_FOUND);

      expect(base.path).toBe('/fallback');
    });
  });

  describe('normalizeHttpExceptionPayload', () => {
    it('deve mapear erro de validacao para VALIDATION_ERROR', () => {
      const payload = normalizeHttpExceptionPayload(
        HttpStatus.BAD_REQUEST,
        {
          statusCode: 400,
          message: ['nome must be a string'],
          error: 'Bad Request',
        },
        'Erro padrao',
      );

      expect(payload.code).toBe('VALIDATION_ERROR');
      expect(payload.error).toBe('Bad Request');
      expect(payload.message).toEqual(['nome must be a string']);
      expect(payload.details).toEqual({
        validationErrors: ['nome must be a string'],
      });
      expect(payload.field).toBe('nome');
    });

    it('deve inferir field para mensagens "each value in ..."', () => {
      const payload = normalizeHttpExceptionPayload(
        HttpStatus.BAD_REQUEST,
        {
          statusCode: 400,
          message: ['each value in modificacoes must be an integer number'],
          error: 'Bad Request',
        },
        'Erro padrao',
      );

      expect(payload.code).toBe('VALIDATION_ERROR');
      expect(payload.field).toBe('modificacoes');
    });

    it('deve mapear erro de parse de param para VALIDATION_ERROR com details', () => {
      const payload = normalizeHttpExceptionPayload(
        HttpStatus.BAD_REQUEST,
        {
          statusCode: 400,
          message: 'Validation failed (numeric string is expected)',
          error: 'Bad Request',
        },
        'Erro padrao',
      );

      expect(payload.code).toBe('VALIDATION_ERROR');
      expect(payload.error).toBe('Bad Request');
      expect(payload.message).toBe(
        'Validation failed (numeric string is expected)',
      );
      expect(payload.details).toEqual({
        validationErrors: ['Validation failed (numeric string is expected)'],
      });
      expect(payload.field).toBeUndefined();
    });

    it('deve respeitar codigo explicito quando presente', () => {
      const payload = normalizeHttpExceptionPayload(
        HttpStatus.CONFLICT,
        {
          message: 'Conflito',
          code: 'CAMPANHA_DUPLICADA',
          error: 'Conflict',
        },
        'Erro padrao',
      );

      expect(payload.code).toBe('CAMPANHA_DUPLICADA');
      expect(payload.error).toBe('Conflict');
      expect(payload.message).toBe('Conflito');
    });

    it('deve priorizar BaseException para code/details/field', () => {
      const exception = new BaseException(
        'Campo invalido',
        HttpStatus.UNPROCESSABLE_ENTITY,
        'CAMPANHA_ERRO_NEGOCIO',
        { detalhe: 1 },
        'nome',
      );

      const payload = normalizeHttpExceptionPayload(
        HttpStatus.UNPROCESSABLE_ENTITY,
        { message: 'Mensagem externa', code: 'OUTRO_CODIGO' },
        'Erro padrao',
        exception,
      );

      expect(payload.code).toBe('CAMPANHA_ERRO_NEGOCIO');
      expect(payload.details).toEqual({ detalhe: 1 });
      expect(payload.field).toBe('nome');
      expect(payload.message).toBe('Mensagem externa');
    });
  });
});
