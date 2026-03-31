// src/common/exceptions/anotacao.exception.ts
import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

export class AnotacaoNaoEncontradaException extends BaseException {
  constructor(id?: number) {
    super(
      'Anotacao nao encontrada',
      HttpStatus.NOT_FOUND,
      'ANOTACAO_NOT_FOUND',
      {
        id,
      },
    );
  }
}

export class AnotacaoSemPermissaoException extends BusinessException {
  constructor(id?: number) {
    super(
      'Voce nao tem permissao para acessar esta anotacao',
      'ANOTACAO_SEM_PERMISSAO',
      { id },
    );
  }
}

export class AnotacaoCampanhaSessaoInvalidaException extends BusinessException {
  constructor(campanhaId?: number | null, sessaoId?: number | null) {
    super(
      'Campanha e sessao informadas nao correspondem',
      'ANOTACAO_CAMPANHA_SESSAO_INVALIDA',
      { campanhaId, sessaoId },
    );
  }
}
