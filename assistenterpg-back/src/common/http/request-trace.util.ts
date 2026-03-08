import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

type RequestWithTraceId = Request & {
  traceId?: string;
};

function normalizeHeaderValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    const first = value.find(
      (entry) => typeof entry === 'string' && entry.trim().length > 0,
    );
    return first?.trim() ?? '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
}

export function getOrCreateTraceId(
  request: Request,
  response?: Response,
): string {
  const requestWithTraceId = request as RequestWithTraceId;
  if (
    typeof requestWithTraceId.traceId === 'string' &&
    requestWithTraceId.traceId.trim().length > 0
  ) {
    const existing = requestWithTraceId.traceId.trim();
    if (response) {
      response.setHeader('x-request-id', existing);
    }
    return existing;
  }

  const incomingHeader = normalizeHeaderValue(request.header('x-request-id'));
  const traceId = incomingHeader || randomUUID();

  requestWithTraceId.traceId = traceId;

  if (response) {
    response.setHeader('x-request-id', traceId);
  }

  return traceId;
}
