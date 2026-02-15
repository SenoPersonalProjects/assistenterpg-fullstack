// src/homebrews/validators/validate-homebrew-equipamento.ts

import { 
  ValorForaDoIntervaloException,
  ValidationException 
} from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Equipamentos
 * (além das validações do DTO)
 */
export function validateHomebrewEquipamentoCustom(dados: any): void {
  // ✅ Validar categoria (CATEGORIA_0 a CATEGORIA_4 ou ESPECIAL)
  if (dados.categoria) {
    const categoriasValidas = [
      'CATEGORIA_0',
      'CATEGORIA_1',
      'CATEGORIA_2',
      'CATEGORIA_3',
      'CATEGORIA_4',
      'ESPECIAL',
    ];

    if (!categoriasValidas.includes(dados.categoria)) {
      throw new ValidationException(
        `Categoria inválida: "${dados.categoria}"`,
        'categoria',
        { categoriasValidas },
        'INVALID_CATEGORY',
      );
    }
  }

  // ✅ Validar espaços (mínimo 0, máximo razoável 10)
  if (dados.espacos !== undefined) {
    if (dados.espacos < 0 || dados.espacos > 10) {
      throw new ValorForaDoIntervaloException('espacos', 0, 10, dados.espacos);
    }
  }
}
