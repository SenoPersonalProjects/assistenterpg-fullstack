import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

export class AmizadeNaoEncontradaException extends BaseException {
  constructor(identificador?: number) {
    super('Amizade nao encontrada', HttpStatus.NOT_FOUND, 'AMIZADE_NOT_FOUND', {
      identificador,
    });
  }
}

export class AmizadeSolicitacaoNaoEncontradaException extends BaseException {
  constructor(identificador?: number) {
    super(
      'Solicitacao de amizade nao encontrada',
      HttpStatus.NOT_FOUND,
      'AMIZADE_SOLICITACAO_NOT_FOUND',
      { identificador },
    );
  }
}

export class AmizadeSelfException extends BusinessException {
  constructor(usuarioId: number) {
    super('Voce nao pode adicionar a si mesmo', 'AMIZADE_SELF', {
      usuarioId,
    });
  }
}

export class AmizadeJaExisteException extends BusinessException {
  constructor(usuarioId: number, amigoId: number) {
    super('Este usuario ja esta na sua lista de amigos', 'AMIZADE_JA_EXISTE', {
      usuarioId,
      amigoId,
    });
  }
}

export class AmizadeSolicitacaoDuplicadaException extends BusinessException {
  constructor(usuarioId: number, amigoId: number) {
    super(
      'Ja existe uma solicitacao de amizade pendente entre estes usuarios',
      'AMIZADE_SOLICITACAO_DUPLICADA',
      { usuarioId, amigoId },
    );
  }
}

export class AmizadeAcaoNaoPermitidaException extends BusinessException {
  constructor(acao: string, amizadeId?: number) {
    super(
      'Voce nao pode realizar esta acao nesta solicitacao de amizade',
      'AMIZADE_ACAO_NEGADA',
      { acao, amizadeId },
    );
  }
}
