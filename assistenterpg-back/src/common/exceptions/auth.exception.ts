// src/common/exceptions/auth.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

// ============================================================================
// AUTENTICAÇÃO - EXCEÇÕES
// ============================================================================

/**
 * ✅ SEGURANÇA: Mensagem genérica para não revelar se email existe
 */
export class CredenciaisInvalidasException extends BaseException {
  constructor() {
    super(
      'Credenciais inválidas',
      HttpStatus.UNAUTHORIZED,
      'CREDENCIAIS_INVALIDAS',
    );
  }
}

/**
 * Token JWT inválido ou expirado
 */
export class TokenInvalidoException extends BaseException {
  constructor(motivo?: string) {
    super(
      'Token inválido ou expirado',
      HttpStatus.UNAUTHORIZED,
      'TOKEN_INVALIDO',
      { motivo },
    );
  }
}

/**
 * Usuário do token não existe mais no sistema
 */
export class UsuarioTokenNaoEncontradoException extends BaseException {
  constructor(usuarioId: number) {
    super(
      'Usuário do token não encontrado',
      HttpStatus.UNAUTHORIZED,
      'USUARIO_TOKEN_NAO_ENCONTRADO',
      { usuarioId },
    );
  }
}

// ============================================================================
// AUTORIZAÇÃO - EXCEÇÕES
// ============================================================================

/**
 * Requisição sem token JWT
 */
export class UsuarioNaoAutenticadoException extends BaseException {
  constructor() {
    super(
      'Autenticação necessária',
      HttpStatus.UNAUTHORIZED,
      'USUARIO_NAO_AUTENTICADO',
    );
  }
}

/**
 * Usuário autenticado mas sem permissão
 */
export class AcessoNegadoException extends BaseException {
  constructor(recurso?: string, roleNecessaria?: string) {
    const mensagem = roleNecessaria
      ? `Acesso negado. Role necessária: ${roleNecessaria}`
      : 'Acesso negado';

    super(
      mensagem,
      HttpStatus.FORBIDDEN,
      'ACESSO_NEGADO',
      { recurso, roleNecessaria },
    );
  }
}
