// src/homebrews/validators/validate-homebrew-trilha.ts

import {
  ValidationException,
  ValorForaDoIntervaloException,
} from '../../common/exceptions/validation.exception';

/**
 * Validações customizadas para Trilha
 */
export function validateHomebrewTrilhaCustom(dados: any): void {
  // ✅ Validar que nivelRequisito é positivo
  if (dados.nivelRequisito !== undefined && dados.nivelRequisito < 1) {
    throw new ValorForaDoIntervaloException(
      'nivelRequisito',
      1,
      20,
      dados.nivelRequisito,
    );
  }

  // ✅ Validar que tem pelo menos 1 habilidade
  if (!dados.habilidades || dados.habilidades.length === 0) {
    throw new ValidationException(
      'Trilha deve ter pelo menos 1 habilidade',
      'habilidades',
      { minimoHabilidades: 1, recebido: 0 },
      'MIN_ABILITIES_REQUIRED',
    );
  }

  // ✅ Validar níveis crescentes e únicos
  const niveis = dados.habilidades.map((h: any) => h.nivel);
  const niveisOrdenados = [...niveis].sort((a, b) => a - b);

  for (let i = 1; i < niveisOrdenados.length; i++) {
    if (niveisOrdenados[i] === niveisOrdenados[i - 1]) {
      throw new ValidationException(
        `Habilidades devem ter níveis únicos`,
        'habilidades.nivel',
        {
          nivelDuplicado: niveisOrdenados[i],
          posicoesAfetadas: niveis
            .map((n, idx) => ({ nivel: n, index: idx }))
            .filter((item) => item.nivel === niveisOrdenados[i])
            .map((item) => item.index),
        },
        'DUPLICATE_ABILITY_LEVELS',
      );
    }
  }
}
