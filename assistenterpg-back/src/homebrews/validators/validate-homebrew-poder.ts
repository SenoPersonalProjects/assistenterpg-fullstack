// src/homebrews/validators/validate-homebrew-poder.ts

import { ValidationException } from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Poder Genérico
 */
export function validateHomebrewPoderCustom(dados: any): void {
  // ✅ Validar que efeitos não está vazio
  if (!dados.efeitos || typeof dados.efeitos !== 'string' || dados.efeitos.trim().length === 0) {
    throw new ValidationException(
      'Poder deve ter o campo "efeitos" preenchido',
      'efeitos',
      { comprimentoMinimo: 1, recebido: dados.efeitos?.length || 0 },
      'EMPTY_EFFECTS',
    );
  }
}
