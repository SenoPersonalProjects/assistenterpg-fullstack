// src/homebrews/validators/validate-homebrew-equipamento.ts

import {
  ValorForaDoIntervaloException,
  ValidationException,
} from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Equipamentos
 * (além das validações do DTO)
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateHomebrewEquipamentoCustom(dados: unknown): void {
  if (!isRecord(dados)) return;

  // ✅ Validar categoria (CATEGORIA_0 a CATEGORIA_4 ou ESPECIAL)
  if (dados.categoria !== undefined && dados.categoria !== null) {
    const categoriasValidas = [
      'CATEGORIA_0',
      'CATEGORIA_1',
      'CATEGORIA_2',
      'CATEGORIA_3',
      'CATEGORIA_4',
      'ESPECIAL',
    ];

    const categoria = dados.categoria;
    if (
      typeof categoria !== 'string' ||
      !categoriasValidas.includes(categoria)
    ) {
      const categoriaTexto =
        typeof categoria === 'string' ? categoria : '<invalida>';
      throw new ValidationException(
        `Categoria inválida: "${categoriaTexto}"`,
        'categoria',
        { categoriasValidas },
        'INVALID_CATEGORY',
      );
    }
  }

  // ✅ Validar espaços (mínimo 0, máximo razoável 10)
  if (dados.espacos !== undefined) {
    const espacos = dados.espacos;
    if (typeof espacos !== 'number' || espacos < 0 || espacos > 10) {
      throw new ValorForaDoIntervaloException(
        'espacos',
        0,
        10,
        Number(espacos),
      );
    }
  }
}
