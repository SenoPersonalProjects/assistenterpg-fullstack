// src/homebrews/validators/validate-homebrew-caminho.ts

import { ValidationException } from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Caminho
 */
export function validateHomebrewCaminhoCustom(dados: any): void {
  // ✅ Validar que tem pelo menos 1 habilidade
  if (!dados.habilidades || dados.habilidades.length === 0) {
    throw new ValidationException(
      'Caminho deve ter pelo menos 1 habilidade',
      'habilidades',
      { minimoHabilidades: 1, recebido: 0 },
      'MIN_ABILITIES_REQUIRED',
    );
  }
}
