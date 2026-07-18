import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

export class CampanhaRoletaAcessoNegadoException extends BusinessException {
  constructor(acao: string) {
    super(
      `Voce nao tem permissao para ${acao} nesta roleta.`,
      'CAMPAIGN_ROULETTE_FORBIDDEN',
      { acao },
    );
  }
}

export class CampanhaRoletaConfigInvalidaException extends BusinessException {
  constructor(motivo: string) {
    super(
      'Configuracao de roleta invalida.',
      'CAMPAIGN_ROULETTE_INVALID_CONFIG',
      {
        motivo,
      },
    );
  }
}

export class CampanhaRoletaSorteioInvalidoException extends BusinessException {
  constructor(motivo: string, sorteioId?: number) {
    super('Operacao de sorteio invalida.', 'CAMPAIGN_ROULETTE_INVALID_DRAW', {
      motivo,
      sorteioId,
    });
  }
}

export class CampanhaRoletaSorteioNaoEncontradoException extends BaseException {
  constructor(sorteioId: number) {
    super(
      'Sorteio de roleta nao encontrado.',
      HttpStatus.NOT_FOUND,
      'CAMPAIGN_ROULETTE_DRAW_NOT_FOUND',
      { sorteioId },
    );
  }
}

export class CampanhaRoletaConflitoException extends BaseException {
  constructor(motivo: string) {
    super(
      'A roleta foi alterada por outra operacao.',
      HttpStatus.CONFLICT,
      'CAMPAIGN_ROULETTE_CONFLICT',
      { motivo },
    );
  }
}

export class CampanhaRoletaIdempotenciaConflitoException extends BaseException {
  constructor(clientRequestId: string) {
    super(
      'clientRequestId ja utilizado com outra intencao.',
      HttpStatus.CONFLICT,
      'CAMPAIGN_ROULETTE_IDEMPOTENCY_CONFLICT',
      { clientRequestId },
    );
  }
}

export class CampanhaRoletaPermissaoInvalidaException extends BusinessException {
  constructor(motivo: string) {
    super(
      'Permissao de roleta invalida.',
      'CAMPAIGN_ROULETTE_INVALID_PERMISSION',
      {
        motivo,
      },
    );
  }
}
