import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { getOrCreateTraceId } from '../http/request-trace.util';

type ErrorWithStatus = {
  status?: number;
  statusCode?: number;
  response?: {
    statusCode?: number;
    message?: unknown;
  };
  getStatus?: () => number;
  message?: unknown;
};

const SENSITIVE_KEYS = new Set([
  'senha',
  'senhaAtual',
  'novaSenha',
  'password',
  'token',
  'access_token',
  'authorization',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitive(entry));
  }

  if (!isRecord(value)) {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = '[REDACTED]';
      continue;
    }

    result[key] = redactSensitive(entry);
  }

  return result;
}

function getErrorStatus(error: unknown): number {
  if (!isRecord(error)) return 500;

  const typedError = error as ErrorWithStatus;

  if (typeof typedError.getStatus === 'function') {
    return typedError.getStatus();
  }

  if (typeof typedError.status === 'number') {
    return typedError.status;
  }

  if (typeof typedError.statusCode === 'number') {
    return typedError.statusCode;
  }

  if (isRecord(typedError.response)) {
    const responseStatus = typedError.response.statusCode;
    if (typeof responseStatus === 'number') {
      return responseStatus;
    }
  }

  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (!isRecord(error)) return 'Erro desconhecido';

  const typedError = error as ErrorWithStatus;
  if (typeof typedError.message === 'string') {
    return typedError.message;
  }

  if (isRecord(typedError.response)) {
    const responseMessage = typedError.response.message;
    if (typeof responseMessage === 'string') return responseMessage;
    if (Array.isArray(responseMessage)) return responseMessage.join(', ');
  }

  return 'Erro desconhecido';
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const traceId = getOrCreateTraceId(request, response);
    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const query: unknown = request.query;
    const params: unknown = request.params;
    const userAgent = request.get('user-agent') || '';

    const now = Date.now();

    this.logger.log(
      `[traceId=${traceId}] -> [${method}] ${url} | Query: ${JSON.stringify(query)} | Params: ${JSON.stringify(params)} | UserAgent: ${userAgent}`,
    );

    if (process.env.NODE_ENV === 'development' && method !== 'GET') {
      const safeBody = redactSensitive(request.body);
      this.logger.debug(
        `[traceId=${traceId}] Body: ${JSON.stringify(safeBody)}`,
      );
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `[traceId=${traceId}] <- [${method}] ${url} | Status: ${response.statusCode} | Time: ${responseTime}ms`,
          );
        },
        error: (error: unknown) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[traceId=${traceId}] <- [${method}] ${url} | Status: ${getErrorStatus(error)} | Time: ${responseTime}ms | Error: ${getErrorMessage(error)}`,
          );
        },
      }),
    );
  }
}
