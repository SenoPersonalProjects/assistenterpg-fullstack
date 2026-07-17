import { BusinessException } from './business.exception';

export class MacroPersonagemConfigInvalidaException extends BusinessException {
  constructor(message: string) {
    super(message, 'MACRO_PERSONAGEM_CONFIG_INVALIDA');
  }
}

export class MacroPersonagemLimiteExcedidoException extends BusinessException {
  constructor(limite: number) {
    super(
      `O personagem atingiu o limite de ${limite} macros ativas.`,
      'MACRO_PERSONAGEM_LIMITE_EXCEDIDO',
      { limite },
    );
  }
}

export class MacroPersonagemNaoEncontradaException extends BusinessException {
  constructor(macroId: number) {
    super(
      'Macro personalizada nao encontrada.',
      'MACRO_PERSONAGEM_NAO_ENCONTRADA',
      {
        macroId,
      },
    );
  }
}

export class MacroPersonagemRevisaoConflitoException extends BusinessException {
  constructor(macroId: number) {
    super(
      'A macro foi alterada por outra operacao. Recarregue e tente novamente.',
      'MACRO_PERSONAGEM_REVISAO_CONFLITO',
      { macroId },
    );
  }
}

export class MacroPersonagemVisibilidadeNegadaException extends BusinessException {
  constructor() {
    super(
      'Somente o mestre pode usar visibilidade secreta para macros.',
      'MACRO_PERSONAGEM_VISIBILIDADE_NEGADA',
    );
  }
}

export class MacroPersonagemPericiaInvalidaException extends BusinessException {
  constructor(periciaCodigo: string) {
    super(
      'A pericia configurada para a macro nao existe.',
      'MACRO_PERSONAGEM_PERICIA_INVALIDA',
      { periciaCodigo },
    );
  }
}
