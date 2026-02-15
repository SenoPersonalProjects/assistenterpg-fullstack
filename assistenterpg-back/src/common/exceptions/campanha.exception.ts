// src/common/exceptions/campanha.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// CAMPANHA - EXCEÇÕES
// ============================================================================

export class CampanhaNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Campanha não encontrada',
      HttpStatus.NOT_FOUND,
      'CAMPANHA_NOT_FOUND',
      { identificador },
    );
  }
}

export class CampanhaAcessoNegadoException extends BusinessException {
  constructor(campanhaId?: number, usuarioId?: number) {
    super(
      'Você não tem acesso a esta campanha',
      'CAMPANHA_ACESSO_NEGADO',
      { campanhaId, usuarioId },
    );
  }
}

export class CampanhaApenasDonoException extends BusinessException {
  constructor(acao: string) {
    super(
      `Apenas o dono pode ${acao}`,
      'CAMPANHA_APENAS_DONO',
      { acao },
    );
  }
}

// ============================================================================
// USUÁRIO - EXCEÇÕES (relacionadas a campanha)
// ============================================================================

export class UsuarioNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Usuário não encontrado',
      HttpStatus.NOT_FOUND,
      'USUARIO_NOT_FOUND',
      { identificador },
    );
  }
}

export class UsuarioJaMembroCampanhaException extends BusinessException {
  constructor(usuarioId: number, campanhaId: number) {
    super(
      'Usuário já é membro desta campanha',
      'USUARIO_JA_MEMBRO',
      { usuarioId, campanhaId },
    );
  }
}

// ============================================================================
// CONVITE - EXCEÇÕES
// ============================================================================

export class ConviteNaoEncontradoException extends BaseException {
  constructor(codigo?: string) {
    super(
      'Convite não encontrado',
      HttpStatus.NOT_FOUND,
      'CONVITE_NOT_FOUND',
      { codigo },
    );
  }
}

export class ConviteInvalidoOuUtilizadoException extends BusinessException {
  constructor(codigo: string, status?: string) {
    super(
      'Convite inválido ou já utilizado',
      'CONVITE_INVALIDO',
      { codigo, status },
    );
  }
}

export class ConviteNaoPertenceUsuarioException extends BusinessException {
  constructor(conviteEmail: string, usuarioEmail: string) {
    super(
      'Este convite não pertence a este usuário',
      'CONVITE_NAO_PERTENCE_USUARIO',
      { conviteEmail, usuarioEmail },
    );
  }
}
