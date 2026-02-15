// src/common/exceptions/proficiencia.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// PROFICIÊNCIA - EXCEÇÕES
// ============================================================================

export class ProficienciaNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Proficiência não encontrada',
      HttpStatus.NOT_FOUND,
      'PROFICIENCIA_NOT_FOUND',
      { identificador },
    );
  }
}

// ✅ OPCIONAL: Para futuras validações de negócio
export class ProficienciaNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(
      `Proficiência com nome "${nome}" já existe`,
      'PROFICIENCIA_NOME_DUPLICADO',
      { nome },
    );
  }
}

export class ProficienciaEmUsoException extends BusinessException {
  constructor(
    proficienciaId: number,
    totalUsos: number,
    detalhesUso?: Record<string, number>,
  ) {
    super(
      `Proficiência está sendo usada em ${totalUsos} referência(s). Remova as referências primeiro.`,
      'PROFICIENCIA_EM_USO',
      { proficienciaId, totalUsos, detalhesUso },
    );
  }
}
