// src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '../exceptions/database.exception';

type DbErrorPayload = {
  code?: string;
  message: string;
  details?: unknown;
  stack?: string;
};

type InternalErrorResponse = {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDbError(error: unknown): DbErrorPayload {
  if (error instanceof Error) {
    const code =
      isRecord(error) && typeof error.code === 'string'
        ? error.code
        : undefined;
    const details = isRecord(error) ? error.details : undefined;
    return {
      code,
      message: error.message,
      details,
      stack: error.stack,
    };
  }

  if (isRecord(error)) {
    const code = typeof error.code === 'string' ? error.code : undefined;
    const message =
      typeof error.message === 'string'
        ? error.message
        : 'Erro de banco de dados';
    const details = error.details;
    return { code, message, details };
  }

  return { message: 'Erro de banco de dados' };
}

/**
 * Filtro global para exceções não-HTTP (fallback)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Tratar erros do Prisma
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      try {
        handlePrismaError(exception);
      } catch (dbError: unknown) {
        const erro = parseDbError(dbError);
        this.logger.error(`Database Error: ${erro.message}`, erro.stack ?? '');

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          code: erro.code ?? 'DB_ERROR',
          message: erro.message,
          details: erro.details,
        });
      }
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage =
      exception instanceof Error
        ? exception.message
        : 'Erro interno no servidor';

    const errorResponse: InternalErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      code: 'INTERNAL_ERROR',
      message: errorMessage,
    };

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    this.logger.error(
      `Unhandled Exception: ${errorMessage}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
