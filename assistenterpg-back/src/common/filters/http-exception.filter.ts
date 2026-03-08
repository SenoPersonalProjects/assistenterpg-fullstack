// src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base.exception';

type ErrorResponseBody = {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  code?: string;
  message?: string | string[];
  details?: unknown;
  field?: string;
  stack?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function toStringOrStringArray(value: unknown): string | string[] | undefined {
  if (typeof value === 'string') return value;
  if (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === 'string')
  ) {
    return value;
  }
  return undefined;
}

/**
 * Filtro global para HttpException
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // ✅ CORRETO
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    // Estrutura de resposta de erro
    const errorResponse: ErrorResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Se for BaseException (nossas exceções customizadas)
    if (exception instanceof BaseException) {
      errorResponse.code = exception.code;
      const mensagem = isRecord(exceptionResponse)
        ? toStringOrStringArray(exceptionResponse.message)
        : undefined;
      errorResponse.message = mensagem ?? exception.message;
      errorResponse.details = exception.details;
      errorResponse.field = exception.field;

      // Adicionar stack trace apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = exception.stack;
      }
    } else {
      // HttpException padrão do NestJS
      errorResponse.code =
        isRecord(exceptionResponse) && toStringValue(exceptionResponse.code)
          ? toStringValue(exceptionResponse.code)
          : 'HTTP_EXCEPTION';
      errorResponse.message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : isRecord(exceptionResponse)
            ? (toStringOrStringArray(exceptionResponse.message) ??
              'Erro no servidor')
            : 'Erro no servidor';

      if (isRecord(exceptionResponse)) {
        errorResponse.details = exceptionResponse;
      }
    }

    // Log do erro
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status}`,
      JSON.stringify(errorResponse, null, 2),
    );

    response.status(status).json(errorResponse);
  }
}
