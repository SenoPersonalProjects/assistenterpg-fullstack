// src/common/exceptions/homebrew.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';

// ============================================================================
// HOMEBREW - EXCEÇÕES
// ============================================================================

export class HomebrewNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Homebrew não encontrado',
      HttpStatus.NOT_FOUND,
      'HOMEBREW_NOT_FOUND',
      { identificador },
    );
  }
}

export class HomebrewJaPublicadoException extends BusinessException {
  constructor(homebrewId: number) {
    super('Homebrew já está publicado', 'HOMEBREW_JA_PUBLICADO', {
      homebrewId,
    });
  }
}

export class HomebrewDadosInvalidosException extends ValidationException {
  constructor(erros: string[]) {
    super(
      'Dados do homebrew são inválidos',
      'dados',
      { erros },
      'HOMEBREW_DADOS_INVALIDOS',
    );
  }
}

export class HomebrewSemPermissaoException extends BaseException {
  constructor(
    acao: string,
    recurso: string = 'este homebrew',
    homebrewId?: number,
  ) {
    super(
      `Você não tem permissão para ${acao} ${recurso}`,
      HttpStatus.FORBIDDEN,
      'HOMEBREW_SEM_PERMISSAO',
      { acao, recurso, homebrewId },
    );
  }
}
