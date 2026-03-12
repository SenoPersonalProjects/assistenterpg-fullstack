const MOJIBAKE_PATTERN = /Ã.|Â.|â[\u0080-\u00BF]|�/;

function scoreMojibake(value: string): number {
  return (value.match(/Ã|Â|â|�/g) ?? []).length;
}

function latin1ToUtf8(value: string): string {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    bytes[i] = value.charCodeAt(i) & 0xff;
  }
  return new TextDecoder('utf-8').decode(bytes);
}

export function corrigirMojibakeTexto(value: string): string {
  if (!value || !MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  const reparado = latin1ToUtf8(value);
  return scoreMojibake(reparado) < scoreMojibake(value) ? reparado : value;
}

export function corrigirMojibakeDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return corrigirMojibakeTexto(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => corrigirMojibakeDeep(item)) as T;
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, item]) => [key, corrigirMojibakeDeep(item)],
    );
    return Object.fromEntries(entries) as T;
  }

  return value;
}
