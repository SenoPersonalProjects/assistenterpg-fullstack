// src/common/exceptions/classe.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// CLASSE - EXCEÇÕES
// ============================================================================

export class ClasseNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Classe não encontrada',
      HttpStatus.NOT_FOUND,
      'CLASSE_NOT_FOUND',
      { identificador },
    );
  }
}

export class ClasseNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(
      `Classe com nome "${nome}" já existe`,
      'CLASSE_NOME_DUPLICADO',
      { nome },
    );
  }
}

export class ClasseEmUsoException extends BusinessException {
  constructor(
    totalUsos: number,
    usosPersonagensBase: number,
    usosPersonagensCampanha: number,
  ) {
    super(
      `Classe está sendo usada por ${totalUsos} personagem(ns). Remova as referências primeiro.`,
      'CLASSE_EM_USO',
      { totalUsos, usosPersonagensBase, usosPersonagensCampanha },
    );
  }
}
