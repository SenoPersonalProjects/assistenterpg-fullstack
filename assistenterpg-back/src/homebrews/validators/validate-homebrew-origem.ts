// src/homebrews/validators/validate-homebrew-origem.ts

import {
  ValidationException,
  ValoresUnicosException,
} from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Origem
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateHomebrewOrigemCustom(dados: unknown): void {
  const periciasRaw = isRecord(dados) ? dados.pericias : undefined;

  // ✅ Validar que tem pelo menos 1 perícia
  if (!Array.isArray(periciasRaw) || periciasRaw.length === 0) {
    throw new ValidationException(
      'Origem deve ter pelo menos 1 perícia',
      'pericias',
      { minimoPericias: 1, recebido: 0 },
      'MIN_SKILLS_REQUIRED',
    );
  }

  // ✅ Validar perícias únicas
  const periciasUnicas = new Set(periciasRaw);

  if (periciasRaw.length !== periciasUnicas.size) {
    const duplicadas = periciasRaw.filter(
      (pericia, index) => periciasRaw.indexOf(pericia) !== index,
    );
    throw new ValoresUnicosException('pericias', duplicadas);
  }
}
