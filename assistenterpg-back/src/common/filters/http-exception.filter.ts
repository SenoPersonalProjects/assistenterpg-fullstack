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

    const exceptionResponse: any = exception.getResponse();

    // Estrutura de resposta de erro
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Se for BaseException (nossas exceções customizadas)
    if (exception instanceof BaseException) {
      errorResponse.code = exception.code;
      errorResponse.message = exceptionResponse.message || exception.message;
      errorResponse.details = exception.details;
      errorResponse.field = exception.field;

      // Adicionar stack trace apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = exception.stack;
      }
    } else {
      // HttpException padrão do NestJS
      errorResponse.code = 'HTTP_EXCEPTION';
      errorResponse.message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || 'Erro no servidor';

      if (typeof exceptionResponse === 'object') {
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
