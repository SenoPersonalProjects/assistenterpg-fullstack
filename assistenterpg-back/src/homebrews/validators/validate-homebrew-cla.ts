// src/homebrews/validators/validate-homebrew-cla.ts

import { FormatoInvalidoException } from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Clã
 */
export function validateHomebrewClaCustom(dados: any): void {
  // ✅ Se tem técnica inata, deve ser ID válido
  if (dados.tecnicaInataId !== undefined && dados.tecnicaInataId !== null) {
    if (typeof dados.tecnicaInataId !== 'number' || dados.tecnicaInataId <= 0) {
      throw new FormatoInvalidoException('tecnicaInataId', 'número positivo');
    }
  }
}
