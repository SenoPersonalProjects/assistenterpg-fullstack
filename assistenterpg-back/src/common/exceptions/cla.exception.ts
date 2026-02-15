// src/common/exceptions/cla.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';

// ============================================================================
// CLÃ - EXCEÇÕES
// ============================================================================

export class ClaNaoEncontradoException extends BaseException {
  constructor(identificador: string | number) {
    super(
      'Clã não encontrado',
      HttpStatus.NOT_FOUND,
      'CLA_NOT_FOUND',
      { identificador },
    );
  }
}

export class ClaNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(
      `Clã com nome "${nome}" já existe`,
      'CLA_NOME_DUPLICADO',
      { nome },
    );
  }
}

export class TecnicasHereditariasInvalidasException extends BusinessException {
  constructor(idsInvalidos?: number[]) {
    super(
      'Uma ou mais técnicas fornecidas não existem ou não são hereditárias',
      'CLA_TECNICAS_INVALIDAS',
      { idsInvalidos },
    );
  }
}

export class ClaEmUsoException extends BusinessException {
  constructor(totalUsos: number, usosBase: number, usosCampanha: number) {
    super(
      `Clã está sendo usado por ${totalUsos} personagem(ns). Remova as referências primeiro.`,
      'CLA_EM_USO',
      { totalUsos, usosBase, usosCampanha },
    );
  }
}
