import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '../exceptions/database.exception';
import { BaseException } from '../exceptions/base.exception';
import {
  createErrorBase,
  ErrorResponseBody,
  normalizeHttpExceptionPayload,
} from '../http/error-response.util';
import { getOrCreateTraceId } from '../http/request-trace.util';

type DbErrorPayload = {
  code?: string;
  message: string;
  details?: unknown;
  stack?: string;
  name?: string;
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
      name: error.name,
    };
  }

  if (isRecord(error)) {
    const code = typeof error.code === 'string' ? error.code : undefined;
    const message =
      typeof error.message === 'string'
        ? error.message
        : 'Erro de banco de dados';
    const details = error.details;
    const name = typeof error.name === 'string' ? error.name : undefined;
    return { code, message, details, name };
  }

  return { message: 'Erro de banco de dados' };
}

function buildHttpErrorResponse(
  exception: HttpException,
  request: Request,
  traceId: string,
): ErrorResponseBody {
  const status = exception.getStatus();
  const payload = normalizeHttpExceptionPayload(
    status,
    exception.getResponse(),
    exception.message,
    exception instanceof BaseException ? exception : undefined,
  );

  const response: ErrorResponseBody = {
    ...createErrorBase(request, traceId, status),
    ...payload,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = exception.stack;
    response.errorType = exception.name;
  }

  return response;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = getOrCreateTraceId(request, response);

    if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      try {
        handlePrismaError(exception);
      } catch (dbError: unknown) {
        if (dbError instanceof HttpException) {
          const dbResponse = buildHttpErrorResponse(dbError, request, traceId);

          this.logger.error(
            `[traceId=${traceId}] [${request.method}] ${request.originalUrl ?? request.url} - Status: ${dbResponse.statusCode}`,
            JSON.stringify(dbResponse, null, 2),
          );

          return response.status(dbResponse.statusCode).json(dbResponse);
        }

        const erro = parseDbError(dbError);
        this.logger.error(
          `[traceId=${traceId}] Database Error: ${erro.message}`,
          erro.stack ?? '',
        );

        const dbResponse: ErrorResponseBody = {
          ...createErrorBase(
            request,
            traceId,
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
          code: erro.code ?? 'DB_ERROR',
          error: 'Internal Server Error',
          message: erro.message,
          details: erro.details,
        };

        if (process.env.NODE_ENV === 'development') {
          dbResponse.stack = erro.stack;
          dbResponse.errorType = erro.name ?? 'DatabaseError';
        }

        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(dbResponse);
      }
    }

    if (exception instanceof HttpException) {
      const httpResponse = buildHttpErrorResponse(exception, request, traceId);

      this.logger.error(
        `[traceId=${traceId}] [${request.method}] ${request.originalUrl ?? request.url} - Status: ${httpResponse.statusCode}`,
        JSON.stringify(httpResponse, null, 2),
      );

      return response.status(httpResponse.statusCode).json(httpResponse);
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: ErrorResponseBody = {
      ...createErrorBase(request, traceId, status),
      code: 'INTERNAL_ERROR',
      error: 'Internal Server Error',
      message: 'Erro interno no servidor',
    };

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
      errorResponse.errorType = exception.name;
      errorResponse.details = { message: exception.message };
    }

    this.logger.error(
      `[traceId=${traceId}] Unhandled Exception`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
