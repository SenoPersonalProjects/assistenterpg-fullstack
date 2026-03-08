// src/homebrews/validators/validate-homebrew-caminho.ts

import { ValidationException } from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Caminho
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateHomebrewCaminhoCustom(dados: unknown): void {
  const habilidades = isRecord(dados) ? dados.habilidades : undefined;

  // ✅ Validar que tem pelo menos 1 habilidade
  if (!Array.isArray(habilidades) || habilidades.length === 0) {
    throw new ValidationException(
      'Caminho deve ter pelo menos 1 habilidade',
      'habilidades',
      { minimoHabilidades: 1, recebido: 0 },
      'MIN_ABILITIES_REQUIRED',
    );
  }
}
