// src/homebrews/validators/validate-homebrew-origem.ts

import { 
  ValidationException,
  ValoresUnicosException 
} from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Origem
 */
export function validateHomebrewOrigemCustom(dados: any): void {
  // ✅ Validar que tem pelo menos 1 perícia
  if (!dados.pericias || dados.pericias.length === 0) {
    throw new ValidationException(
      'Origem deve ter pelo menos 1 perícia',
      'pericias',
      { minimoPericias: 1, recebido: 0 },
      'MIN_SKILLS_REQUIRED',
    );
  }

  // ✅ Validar perícias únicas
  const periciasUnicas = new Set(dados.pericias);
  
  if (dados.pericias.length !== periciasUnicas.size) {
    const duplicadas = dados.pericias.filter(
      (pericia: any, index: number) => dados.pericias.indexOf(pericia) !== index
    );
    throw new ValoresUnicosException('pericias', duplicadas);
  }
}
