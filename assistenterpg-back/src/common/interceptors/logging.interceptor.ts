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

/**
 * Interceptor para logging de requisições
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params } = request;
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
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `← [${method}] ${url} | Status: ${error.status || 500} | Time: ${responseTime}ms | Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
