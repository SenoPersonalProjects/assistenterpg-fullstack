import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { BaseException } from '../exceptions/base.exception';

export type ErrorResponseBody = {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  traceId: string;
  code: string;
  error: string;
  message: string | string[];
  details?: unknown;
  field?: string;
  stack?: string;
  errorType?: string;
};

type HttpExceptionPayload = {
  code: string;
  error: string;
  message: string | string[];
  details?: unknown;
  field?: string;
};

const CODE_BY_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
  [HttpStatus.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT',
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

function statusLabel(statusCode: number): string {
  const enumLabel = HttpStatus[statusCode];
  if (typeof enumLabel !== 'string') return 'Error';

  return enumLabel
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferFieldFromValidationMessages(
  message: string[],
): string | undefined {
  for (const validationMessage of message) {
    const eachMatch = validationMessage.match(
      /^each value in ([A-Za-z0-9_.[\]-]+)\s/,
    );
    if (eachMatch?.[1]) {
      return eachMatch[1];
    }

    const directMatch = validationMessage.match(
      /^([A-Za-z0-9_.[\]-]+)\s(?:must|should|cannot|has|is)\b/,
    );
    if (directMatch?.[1]) {
      return directMatch[1];
    }
  }

  return undefined;
}

function defaultCodeFor(
  statusCode: number,
  message: string | string[],
): string {
  if (statusCode === 400 && Array.isArray(message)) {
    return 'VALIDATION_ERROR';
  }

  return CODE_BY_STATUS[statusCode] ?? 'HTTP_EXCEPTION';
}

function getPath(request: Request): string {
  if (
    typeof request.originalUrl === 'string' &&
    request.originalUrl.length > 0
  ) {
    return request.originalUrl;
  }

  return request.url;
}

export function createErrorBase(
  request: Request,
  traceId: string,
  statusCode: number,
): Omit<
  ErrorResponseBody,
  'code' | 'error' | 'message' | 'details' | 'field' | 'stack' | 'errorType'
> {
  return {
    statusCode,
    timestamp: new Date().toISOString(),
    path: getPath(request),
    method: request.method,
    traceId,
  };
}

export function normalizeHttpExceptionPayload(
  statusCode: number,
  response: unknown,
  fallbackMessage: string,
  baseException?: BaseException,
): HttpExceptionPayload {
  const responseRecord = isRecord(response) ? response : undefined;
  const message =
    typeof response === 'string'
      ? response
      : responseRecord
        ? (toStringOrStringArray(responseRecord.message) ?? fallbackMessage)
        : fallbackMessage;

  const explicitCode = responseRecord
    ? toStringValue(responseRecord.code)
    : undefined;
  const explicitError = responseRecord
    ? toStringValue(responseRecord.error)
    : undefined;
  const detailsFromResponse = responseRecord
    ? responseRecord.details
    : undefined;
  const fieldFromResponse = responseRecord
    ? toStringValue(responseRecord.field)
    : undefined;

  let details = detailsFromResponse;
  if (details === undefined && Array.isArray(message)) {
    details = { validationErrors: message };
  }

  return {
    code:
      baseException?.code ??
      explicitCode ??
      defaultCodeFor(statusCode, message),
    error: explicitError ?? statusLabel(statusCode),
    message,
    details: baseException?.details ?? details,
    field:
      baseException?.field ??
      fieldFromResponse ??
      (Array.isArray(message)
        ? inferFieldFromValidationMessages(message)
        : undefined),
  };
}
