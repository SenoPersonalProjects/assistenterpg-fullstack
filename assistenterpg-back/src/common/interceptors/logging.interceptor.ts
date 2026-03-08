// src/common/interceptors/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getErrorStatus(error: unknown): number {
  if (isRecord(error) && typeof error.status === 'number') return error.status;
  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === 'string')
    return error.message;
  return 'Erro desconhecido';
}

/**
 * Interceptor para logging de requisições
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const body: unknown = request.body;
    const query: unknown = request.query;
    const params: unknown = request.params;
    const userAgent = request.get('user-agent') || '';

    const now = Date.now();

    this.logger.log(
      `→ [${method}] ${url} | Query: ${JSON.stringify(query)} | Params: ${JSON.stringify(params)} | UserAgent: ${userAgent}`,
    );

    // Log do body apenas em desenvolvimento (cuidado com senhas!)
    if (process.env.NODE_ENV === 'development' && method !== 'GET') {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `← [${method}] ${url} | Status: 200 | Time: ${responseTime}ms`,
          );
        },
        error: (error: unknown) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `← [${method}] ${url} | Status: ${getErrorStatus(error)} | Time: ${responseTime}ms | Error: ${getErrorMessage(error)}`,
          );
        },
      }),
    );
  }
}
