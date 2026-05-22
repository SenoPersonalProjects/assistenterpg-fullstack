import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function gerarSegredoSessao(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashSegredoSessao(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function compararHashesSeguros(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');

  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
