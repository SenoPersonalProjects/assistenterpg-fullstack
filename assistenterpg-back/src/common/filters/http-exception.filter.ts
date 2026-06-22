import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  buildHttpErrorResponse,
  ErrorResponseBody,
} from '../http/error-response.util';
import { getOrCreateTraceId } from '../http/request-trace.util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const traceId = getOrCreateTraceId(request, response);

    const errorResponse: ErrorResponseBody = buildHttpErrorResponse(
      exception,
      request,
      traceId,
    );

    this.logger.error(
      `[traceId=${traceId}] [${request.method}] ${request.originalUrl ?? request.url} - Status: ${status}`,
      JSON.stringify(errorResponse, null, 2),
    );

    response.status(status).json(errorResponse);
  }
}
