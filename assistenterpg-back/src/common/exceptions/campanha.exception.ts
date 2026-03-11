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
      'Campanha nao encontrada',
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
    super('Voce nao tem acesso a esta campanha', 'CAMPANHA_ACESSO_NEGADO', {
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
    super('Usuario nao encontrado', HttpStatus.NOT_FOUND, 'USUARIO_NOT_FOUND', {
      identificador,
    });
  }
}

export class UsuarioJaMembroCampanhaException extends BusinessException {
  constructor(usuarioId: number, campanhaId: number) {
    super('Usuario ja e membro desta campanha', 'USUARIO_JA_MEMBRO', {
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
    super('Convite nao encontrado', HttpStatus.NOT_FOUND, 'CONVITE_NOT_FOUND', {
      codigo,
    });
  }
}

export class ConviteInvalidoOuUtilizadoException extends BusinessException {
  constructor(codigo: string, status?: string) {
    super('Convite invalido ou ja utilizado', 'CONVITE_INVALIDO', {
      codigo,
      status,
    });
  }
}

export class ConviteNaoPertenceUsuarioException extends BusinessException {
  constructor(conviteEmail: string, usuarioEmail: string) {
    super(
      'Este convite nao pertence a este usuario',
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
      'Ja existe convite pendente para este email nesta campanha',
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
      'Nao foi possivel gerar codigo unico para convite',
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
      'Personagem da campanha nao encontrado',
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
      'Voce nao pode associar este personagem-base a esta campanha',
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
      'Este usuario ja possui um personagem associado nesta campanha',
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
      'Voce nao tem permissao para editar esta ficha de campanha',
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
  constructor(campanhaId: number, personagemCampanhaId: number, sessaoId?: number) {
    super(
      'Nao e possivel desassociar personagem que ja participou de sessao',
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
      'Modificador da ficha de campanha nao encontrado',
      HttpStatus.NOT_FOUND,
      'CAMPANHA_MODIFICADOR_NOT_FOUND',
      {
        modificadorId,
        personagemCampanhaId,
      },
    );
  }
}

export class CampanhaModificadorJaDesfeitoException extends BusinessException {
  constructor(modificadorId: number, personagemCampanhaId: number) {
    super(
      'Este modificador ja foi desfeito',
      'CAMPANHA_MODIFICADOR_JA_DESFEITO',
      {
        modificadorId,
        personagemCampanhaId,
      },
    );
  }
}

export class SessaoCampanhaNaoEncontradaException extends BaseException {
  constructor(sessaoId?: number, campanhaId?: number) {
    super(
      'Sessao da campanha nao encontrada',
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
      'Cena livre nao possui controle de turnos ou rodadas',
      'SESSAO_TURNO_INDISPONIVEL',
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
      'Cena da sessao nao encontrada',
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
      'NPC/Ameaca da sessao nao encontrado',
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
