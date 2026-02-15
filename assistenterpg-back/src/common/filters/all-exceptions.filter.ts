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
      } catch (dbError: any) {
        this.logger.error(`Database Error: ${dbError.message}`, dbError.stack);

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          code: dbError.code || 'DB_ERROR',
          message: dbError.message,
          details: dbError.details,
        });
      }
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage =
      exception instanceof Error ? exception.message : 'Erro interno no servidor';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      code: 'INTERNAL_ERROR',
      message: errorMessage,
    };

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      (errorResponse as any).stack = exception.stack;
    }

    this.logger.error(
      `Unhandled Exception: ${errorMessage}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
