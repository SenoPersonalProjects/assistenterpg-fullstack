// src/common/exceptions/origem.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// ORIGEM - EXCEÇÕES
// ============================================================================

export class OrigemNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Origem não encontrada',
      HttpStatus.NOT_FOUND,
      'ORIGEM_NOT_FOUND',
      { identificador },
    );
  }
}

export class OrigemNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(
      `Origem com nome "${nome}" já existe`,
      'ORIGEM_NOME_DUPLICADO',
      { nome },
    );
  }
}

export class OrigemPericiasInvalidasException extends BaseException {
  constructor(periciasInvalidas?: number[]) {
    super(
      'Uma ou mais perícias fornecidas não existem',
      HttpStatus.NOT_FOUND,
      'ORIGEM_PERICIAS_INVALIDAS',
      { periciasInvalidas },
    );
  }
}

export class OrigemHabilidadesInvalidasException extends BaseException {
  constructor(habilidadesInvalidas?: number[]) {
    super(
      'Uma ou mais habilidades fornecidas não existem',
      HttpStatus.NOT_FOUND,
      'ORIGEM_HABILIDADES_INVALIDAS',
      { habilidadesInvalidas },
    );
  }
}

export class OrigemEmUsoException extends BusinessException {
  constructor(
    origemId: number,
    totalUsos: number,
    detalhesUso: {
      personagensBase: number;
      personagensCampanha: number;
    },
  ) {
    super(
      `Origem está sendo usada por ${totalUsos} personagem(ns). Remova as referências primeiro.`,
      'ORIGEM_EM_USO',
      { origemId, totalUsos, detalhesUso },
    );
  }
}
