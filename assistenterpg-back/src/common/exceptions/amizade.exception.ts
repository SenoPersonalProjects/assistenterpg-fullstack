import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

export class AmizadeNaoEncontradaException extends BaseException {
  constructor(identificador?: number) {
    super('Amizade não encontrada', HttpStatus.NOT_FOUND, 'AMIZADE_NOT_FOUND', {
      identificador,
    });
  }
}

export class AmizadeSolicitacaoNaoEncontradaException extends BaseException {
  constructor(identificador?: number) {
    super(
      'Solicitação de amizade não encontrada',
      HttpStatus.NOT_FOUND,
      'AMIZADE_SOLICITACAO_NOT_FOUND',
      { identificador },
    );
  }
}

export class AmizadeSelfException extends BusinessException {
  constructor(usuarioId: number) {
    super('Você não pode adicionar a si mesmo', 'AMIZADE_SELF', {
      usuarioId,
    });
  }
}

export class AmizadeJaExisteException extends BusinessException {
  constructor(usuarioId: number, amigoId: number) {
    super('Este usuário já esta na sua lista de amigos', 'AMIZADE_JA_EXISTE', {
      usuarioId,
      amigoId,
    });
  }
}

export class AmizadeSolicitacaoDuplicadaException extends BusinessException {
  constructor(usuarioId: number, amigoId: number) {
    super(
      'Já existe uma solicitação de amizade pendente entre estes usuários',
      'AMIZADE_SOLICITACAO_DUPLICADA',
      { usuarioId, amigoId },
    );
  }
}

export class AmizadeDestinoSolicitacaoInvalidoException extends BusinessException {
  constructor() {
    super(
      'Informe email, apelido ou usuario para enviar a solicitacao de amizade',
      'AMIZADE_DESTINO_INVALIDO',
    );
  }
}

export class AmizadeAcaoNaoPermitidaException extends BusinessException {
  constructor(acao: string, amizadeId?: number) {
    super(
      'Você não pode realizar esta ação nesta solicitação de amizade',
      'AMIZADE_ACAO_NEGADA',
      { acao, amizadeId },
    );
  }
}
