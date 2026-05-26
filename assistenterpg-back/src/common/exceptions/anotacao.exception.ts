// src/common/exceptions/anotacao.exception.ts
import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

export class AnotacaoNaoEncontradaException extends BaseException {
  constructor(id?: number) {
    super(
      'Anotação não encontrada',
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
      'Você não tem permissão para acessar esta anotação',
      'ANOTACAO_SEM_PERMISSAO',
      { id },
    );
  }
}

export class AnotacaoCampanhaSessaoInvalidaException extends BusinessException {
  constructor(campanhaId?: number | null, sessaoId?: number | null) {
    super(
      'Campanha e sessão informadas não correspondem',
      'ANOTACAO_CAMPANHA_SESSAO_INVALIDA',
      { campanhaId, sessaoId },
    );
  }
}
