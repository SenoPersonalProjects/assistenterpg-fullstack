// src/homebrews/validators/validate-homebrew-cla.ts

import { FormatoInvalidoException } from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Clã
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateHomebrewClaCustom(dados: unknown): void {
  if (!isRecord(dados)) return;

  const tecnicaInataId = dados.tecnicaInataId;

  // ✅ Se tem técnica inata, deve ser ID válido
  if (tecnicaInataId !== undefined && tecnicaInataId !== null) {
    if (typeof tecnicaInataId !== 'number' || tecnicaInataId <= 0) {
      throw new FormatoInvalidoException('tecnicaInataId', 'número positivo');
    }
  }
}
