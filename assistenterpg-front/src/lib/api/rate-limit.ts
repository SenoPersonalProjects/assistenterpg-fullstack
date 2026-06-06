const RATE_LIMIT_FALLBACK_MESSAGE =
  'Muitas tentativas. Aguarde antes de tentar novamente.';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function headerValue(headers: unknown, name: string): unknown {
  const record = asRecord(headers);
  if (!record) return undefined;

  const getter = record.get;
  if (typeof getter === 'function') {
    const value = getter.call(headers, name);
    if (value !== undefined && value !== null) return value;
  }

  return (
    record[name] ??
    record[name.toLowerCase()] ??
    record[name.toUpperCase()]
  );
}

export function parseRetryAfterSeconds(
  value: unknown,
  nowMs = Date.now(),
): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.ceil(value));
  }

  if (typeof value !== 'string' || !value.trim()) return null;

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.ceil(numeric));
  }

  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return null;

  return Math.max(0, Math.ceil((retryAt - nowMs) / 1000));
}

export function extractRetryAfterSeconds(
  error: unknown,
  nowMs = Date.now(),
): number | null {
  const err = asRecord(error);
  if (!err) return null;

  const response = asRecord(err.response);
  const body = asRecord(err.body) ?? asRecord(response?.data);
  const details = asRecord(body?.details);
  const status = Number(err.status ?? response?.status ?? body?.statusCode ?? 0);

  if (status !== 429) return null;

  const direct = parseRetryAfterSeconds(err.retryAfterSeconds, nowMs);
  if (direct !== null) return direct;

  const fromDetails = parseRetryAfterSeconds(
    details?.retryAfterSeconds ?? details?.retryAfter,
    nowMs,
  );
  if (fromDetails !== null) return fromDetails;

  return parseRetryAfterSeconds(
    headerValue(response?.headers, 'retry-after'),
    nowMs,
  );
}

export function isRateLimitError(error: unknown): boolean {
  const err = asRecord(error);
  const response = asRecord(err?.response);
  const body = asRecord(err?.body) ?? asRecord(response?.data);
  return Number(err?.status ?? response?.status ?? body?.statusCode ?? 0) === 429;
}

export function formatCooldownDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

export function formatRateLimitMessage(seconds: number | null): string {
  if (seconds === null) return RATE_LIMIT_FALLBACK_MESSAGE;

  return `Muitas tentativas. Tente novamente em ${formatCooldownDuration(seconds)}.`;
}
