// src/homebrews/validators/validate-homebrew-tecnica.ts

import { 
  ValidationException,
  ValoresUnicosException 
} from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Técnica Amaldiçoada
 * (além das validações do DTO)
 */
export function validateHomebrewTecnicaCustom(dados: any): void {
  // ✅ Validar que tem pelo menos 1 habilidade
  if (!dados.habilidades || dados.habilidades.length === 0) {
    throw new ValidationException(
      'Técnica deve ter pelo menos 1 habilidade',
      'habilidades',
      { minimoHabilidades: 1, recebido: 0 },
      'MIN_ABILITIES_REQUIRED',
    );
  }

  // ✅ Validar códigos únicos de habilidades
  const codigos = dados.habilidades.map((h: any) => h.codigo);
  const codigosUnicos = new Set(codigos);
  
  if (codigos.length !== codigosUnicos.size) {
    // Encontrar duplicados
    const duplicados = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);
    throw new ValoresUnicosException('habilidades.codigo', duplicados);
  }

  // ✅ Validar variações (se existirem)
  dados.habilidades.forEach((hab: any, index: number) => {
    if (hab.variacoes && hab.variacoes.length > 0) {
      const nomesVariacoes = hab.variacoes.map((v: any) => v.nome);
      const nomesUnicos = new Set(nomesVariacoes);
      
      if (nomesVariacoes.length !== nomesUnicos.size) {
        const duplicados = nomesVariacoes.filter(
          (nome, i) => nomesVariacoes.indexOf(nome) !== i
        );
        
        throw new ValidationException(
          `Habilidade "${hab.nome || index}": Nomes de variações devem ser únicos`,
          `habilidades[${index}].variacoes`,
          { duplicados },
          'DUPLICATE_VARIATION_NAMES',
        );
      }
    }
  });
}
