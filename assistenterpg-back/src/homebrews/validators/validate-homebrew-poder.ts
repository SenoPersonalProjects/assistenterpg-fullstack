// src/homebrews/validators/validate-homebrew-poder.ts

import { ValidationException } from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Poder Genérico
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateHomebrewPoderCustom(dados: unknown): void {
  const efeitos = isRecord(dados) ? dados.efeitos : undefined;

  // ✅ Validar que efeitos não está vazio
  if (typeof efeitos !== 'string' || efeitos.trim().length === 0) {
    throw new ValidationException(
      'Poder deve ter o campo "efeitos" preenchido',
      'efeitos',
      {
        comprimentoMinimo: 1,
        recebido: typeof efeitos === 'string' ? efeitos.length : 0,
      },
      'EMPTY_EFFECTS',
    );
  }
}
