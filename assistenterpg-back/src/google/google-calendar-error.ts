type JsonObject = Record<string, unknown>;

export const GOOGLE_CALENDAR_REAUTH_REQUIRED_MESSAGE =
  'A autoriza\u00e7\u00e3o do Google Calendar expirou ou foi revogada. Reconecte o Calendar e tente novamente.';

export class GoogleCalendarReauthRequiredError extends Error {
  constructor() {
    super(GOOGLE_CALENDAR_REAUTH_REQUIRED_MESSAGE);
    this.name = 'GoogleCalendarReauthRequiredError';
  }
}

function asObject(value: unknown): JsonObject | null {
  return typeof value === 'object' && value !== null
    ? (value as JsonObject)
    : null;
}

function asLowerString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim().toLowerCase() : null;
}

function asStatus(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value !== 'string' || !/^\d{3}$/.test(value)) return null;
  return Number(value);
}

export function erroGoogleExigeReautorizacao(error: unknown): boolean {
  const root = asObject(error);
  const response = asObject(root?.response);
  const data = asObject(response?.data);
  const dataError = data?.error;
  const nestedError = asObject(dataError);

  const status =
    asStatus(response?.status) ??
    asStatus(nestedError?.code) ??
    asStatus(root?.code);
  const code =
    asLowerString(typeof dataError === 'string' ? dataError : null) ??
    asLowerString(root?.code);
  const description =
    asLowerString(data?.error_description) ?? asLowerString(root?.message);
  const nestedStatus = asLowerString(nestedError?.status);
  const nestedMessage = asLowerString(nestedError?.message);
  const reasons = Array.isArray(nestedError?.errors)
    ? nestedError.errors
        .map((item) => asLowerString(asObject(item)?.reason))
        .filter((reason): reason is string => Boolean(reason))
    : [];

  if (code === 'invalid_grant') return true;
  if (description?.includes('invalid_grant')) return true;

  return Boolean(
    status === 401 &&
    (nestedStatus === 'unauthenticated' ||
      reasons.includes('autherror') ||
      nestedMessage?.includes('invalid credentials')),
  );
}
