// src/common/exceptions/campanha.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// CAMPANHA - EXCECOES
// ============================================================================

export class CampanhaNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Campanha não encontrada',
      HttpStatus.NOT_FOUND,
      'CAMPANHA_NOT_FOUND',
      {
        identificador,
      },
    );
  }
}

export class CampanhaAcessoNegadoException extends BusinessException {
  constructor(campanhaId?: number, usuarioId?: number) {
    super('Você não tem acesso a esta campanha', 'CAMPANHA_ACESSO_NEGADO', {
      campanhaId,
      usuarioId,
    });
  }
}

export class CampanhaApenasDonoException extends BusinessException {
  constructor(acao: string) {
    super(`Apenas o dono pode ${acao}`, 'CAMPANHA_APENAS_DONO', { acao });
  }
}

export class CampanhaApenasMestreException extends BusinessException {
  constructor(acao: string) {
    super(
      `Apenas mestre pode ${acao} nesta campanha`,
      'CAMPANHA_APENAS_MESTRE',
      { acao },
    );
  }
}

// ============================================================================
// USUARIO - EXCECOES (relacionadas a campanha)
// ============================================================================

export class UsuarioNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super('Usuário não encontrado', HttpStatus.NOT_FOUND, 'USUARIO_NOT_FOUND', {
      identificador,
    });
  }
}

export class UsuarioJaMembroCampanhaException extends BusinessException {
  constructor(usuarioId: number, campanhaId: number) {
    super('Usuário já e membro desta campanha', 'USUARIO_JA_MEMBRO', {
      usuarioId,
      campanhaId,
    });
  }
}

// ============================================================================
// CONVITE - EXCECOES
// ============================================================================

export class ConviteNaoEncontradoException extends BaseException {
  constructor(codigo?: string) {
    super('Convite não encontrado', HttpStatus.NOT_FOUND, 'CONVITE_NOT_FOUND', {
      codigo,
    });
  }
}

export class ConviteInvalidoOuUtilizadoException extends BusinessException {
  constructor(codigo: string, status?: string) {
    super('Convite inválido ou já utilizado', 'CONVITE_INVALIDO', {
      codigo,
      status,
    });
  }
}

export class ConviteNaoPertenceUsuarioException extends BusinessException {
  constructor(conviteEmail: string, usuarioEmail: string) {
    super(
      'Este convite não pertence a este usuário',
      'CONVITE_NAO_PERTENCE_USUARIO',
      {
        conviteEmail,
        usuarioEmail,
      },
    );
  }
}

export class ConvitePendenteDuplicadoException extends BusinessException {
  constructor(campanhaId: number, email: string) {
    super(
      'Já existe convite pendente para este email nesta campanha',
      'CONVITE_DUPLICADO_PENDENTE',
      {
        campanhaId,
        email,
      },
    );
  }
}

export class ConviteCodigoIndisponivelException extends BaseException {
  constructor(campanhaId: number, tentativas: number) {
    super(
      'Não foi possível gerar código unico para convite',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'CONVITE_CODIGO_INDISPONIVEL',
      { campanhaId, tentativas },
    );
  }
}

// ============================================================================
// PERSONAGEM DE CAMPANHA - EXCECOES
// ============================================================================

export class PersonagemCampanhaNaoEncontradoException extends BaseException {
  constructor(personagemCampanhaId?: number, campanhaId?: number) {
    super(
      'Personagem da campanha não encontrado',
      HttpStatus.NOT_FOUND,
      'PERSONAGEM_CAMPANHA_NOT_FOUND',
      {
        personagemCampanhaId,
        campanhaId,
      },
    );
  }
}

export class CampanhaPersonagemAssociacaoNegadaException extends BusinessException {
  constructor(campanhaId: number, usuarioId: number, personagemBaseId: number) {
    super(
      'Você não pode associar este personagem-base a esta campanha',
      'CAMPANHA_PERSONAGEM_ASSOCIACAO_NEGADA',
      {
        campanhaId,
        usuarioId,
        personagemBaseId,
      },
    );
  }
}

export class CampanhaPersonagemLimiteUsuarioException extends BusinessException {
  constructor(campanhaId: number, usuarioId: number) {
    super(
      'Este usuário já possui um personagem associado nesta campanha',
      'CAMPANHA_PERSONAGEM_LIMITE_USUARIO',
      {
        campanhaId,
        usuarioId,
      },
    );
  }
}

export class CampanhaPersonagemEdicaoNegadaException extends BusinessException {
  constructor(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    super(
      'Você não tem permissão para editar esta ficha de campanha',
      'CAMPANHA_PERSONAGEM_EDICAO_NEGADA',
      {
        campanhaId,
        personagemCampanhaId,
        usuarioId,
      },
    );
  }
}

export class CampanhaPersonagemDesassociacaoNegadaException extends BusinessException {
  constructor(
    campanhaId: number,
    personagemCampanhaId: number,
    sessaoId?: number,
  ) {
    super(
      'Não é possível desassociar personagem que já participou de sessão',
      'CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA',
      {
        campanhaId,
        personagemCampanhaId,
        sessaoId,
      },
    );
  }
}

export class CampanhaModificadorNaoEncontradoException extends BaseException {
  constructor(modificadorId: number, personagemCampanhaId: number) {
    super(
      'Modificador da ficha de campanha não encontrado',
      HttpStatus.NOT_FOUND,
      'CAMPANHA_MODIFICADOR_NOT_FOUND',
      {
        modificadorId,
        personagemCampanhaId,
      },
    );
  }
}

export class PersonagemCampanhaNucleoInvalidoException extends BusinessException {
  constructor(nucleo: string) {
    super('Núcleo amaldicoado inválido', 'CAMPANHA_NUCLEO_INVALIDO', {
      nucleo,
    });
  }
}

export class PersonagemCampanhaNucleoIndisponivelException extends BusinessException {
  constructor(nucleo: string) {
    super(
      'Núcleo amaldicoado não disponível para este personagem',
      'CAMPANHA_NUCLEO_INDISPONIVEL',
      { nucleo },
    );
  }
}

export class PersonagemCampanhaNucleoSacrificioIndisponivelException extends BusinessException {
  constructor(motivo: string) {
    super(
      'Não e possível sacrificar núcleo neste momento',
      'CAMPANHA_NUCLEO_SACRIFICIO_INVALIDO',
      { motivo },
    );
  }
}

export class PersonagemCampanhaNucleoCustoInsuficienteException extends BusinessException {
  constructor(custo: number, atual: number) {
    super(
      'PE insuficiente para sacrificar outro núcleo',
      'CAMPANHA_NUCLEO_PE_INSUFICIENTE',
      { custo, atual },
    );
  }
}

export class CampanhaModificadorJaDesfeitoException extends BusinessException {
  constructor(modificadorId: number, personagemCampanhaId: number) {
    super(
      'Este modificador já foi desfeito',
      'CAMPANHA_MODIFICADOR_JA_DESFEITO',
      {
        modificadorId,
        personagemCampanhaId,
      },
    );
  }
}

export class CampanhaModificadorInvalidoException extends BusinessException {
  constructor(motivo: string, details?: Record<string, unknown>) {
    super('Modificador narrativo invalido', 'CAMPANHA_MODIFICADOR_INVALIDO', {
      motivo,
      ...(details ?? {}),
    });
  }
}

export class SessaoCampanhaNaoEncontradaException extends BaseException {
  constructor(sessaoId?: number, campanhaId?: number) {
    super(
      'Sessão da campanha não encontrada',
      HttpStatus.NOT_FOUND,
      'SESSAO_CAMPANHA_NOT_FOUND',
      {
        sessaoId,
        campanhaId,
      },
    );
  }
}

export class SessaoTurnoIndisponivelEmCenaLivreException extends BusinessException {
  constructor(sessaoId?: number, campanhaId?: number) {
    super(
      'Cena livre não possui controle de turnos ou rodadas',
      'SESSAO_TURNO_INDISPONIVEL',
      {
        sessaoId,
        campanhaId,
      },
    );
  }
}

export class SessaoOrdemIniciativaInvalidaException extends BusinessException {
  constructor(sessaoId?: number, campanhaId?: number) {
    super(
      'Ordem de iniciativa inválida para os participantes atuais da sessão',
      'SESSAO_ORDEM_INICIATIVA_INVALIDA',
      {
        sessaoId,
        campanhaId,
      },
    );
  }
}

export class CenaSessaoNaoEncontradaException extends BaseException {
  constructor(cenaId?: number, sessaoId?: number, campanhaId?: number) {
    super(
      'Cena da sessão não encontrada',
      HttpStatus.NOT_FOUND,
      'CENA_SESSAO_NOT_FOUND',
      {
        cenaId,
        sessaoId,
        campanhaId,
      },
    );
  }
}

export class NpcSessaoNaoEncontradoException extends BaseException {
  constructor(npcSessaoId?: number, sessaoId?: number, campanhaId?: number) {
    super(
      'NPC/Ameaça da sessão não encontrado',
      HttpStatus.NOT_FOUND,
      'NPC_SESSAO_NOT_FOUND',
      {
        npcSessaoId,
        sessaoId,
        campanhaId,
      },
    );
  }
}

export class PersonagemSessaoNaoEncontradoException extends BaseException {
  constructor(
    personagemSessaoId?: number,
    sessaoId?: number,
    campanhaId?: number,
  ) {
    super(
      'Personagem da sessão não encontrado',
      HttpStatus.NOT_FOUND,
      'PERSONAGEM_SESSAO_NOT_FOUND',
      {
        personagemSessaoId,
        sessaoId,
        campanhaId,
      },
    );
  }
}

export class SessaoEventoNaoEncontradoException extends BaseException {
  constructor(eventoId?: number, sessaoId?: number, campanhaId?: number) {
    super(
      'Evento da sessão não encontrado',
      HttpStatus.NOT_FOUND,
      'SESSAO_EVENTO_NOT_FOUND',
      {
        eventoId,
        sessaoId,
        campanhaId,
      },
    );
  }
}

export class SessaoEventoDesfazerNaoPermitidoException extends BusinessException {
  constructor(eventoId: number, sessaoId: number, tipoEvento?: string) {
    super(
      'Este evento não pode ser desfeito com segurança',
      'SESSAO_EVENTO_DESFAZER_NAO_PERMITIDO',
      {
        eventoId,
        sessaoId,
        tipoEvento,
      },
    );
  }
}
