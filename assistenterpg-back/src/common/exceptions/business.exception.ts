// src/common/exceptions/business.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exceções de regras de negócio
 */
export class BusinessException extends BaseException {
  constructor(message: string, code?: string, details?: any, field?: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, code, details, field);
  }
}

/**
 * Exceções específicas de regras de negócio
 */

// Homebrew
export class HomebrewNaoEncontradoException extends BusinessException {
  constructor(identificador: string | number) {
    super(
      `Homebrew não encontrado`,
      'HB_NOT_FOUND',
      { identificador },
    );
  }
}

export class HomebrewJaPublicadoException extends BusinessException {
  constructor(homebrewId: number) {
    super(
      'Este homebrew já está publicado',
      'HB_ALREADY_PUBLISHED',
      { homebrewId },
    );
  }
}

export class HomebrewDadosInvalidosException extends BusinessException {
  constructor(errors: string[]) {
    super(
      'Dados do homebrew inválidos',
      'HB_INVALID_DATA',
      { errors },
    );
  }
}

export class HomebrewTipoNaoSuportadoException extends BusinessException {
  constructor(tipo: string, tiposValidos?: string[]) {
    super(
      `Tipo de homebrew "${tipo}" não suportado`,
      'HB_UNSUPPORTED_TYPE',
      { tipo, tiposValidos },
    );
  }
}

// Personagem
export class PersonagemNaoEncontradoException extends BusinessException {
  constructor(personagemId: number) {
    super(
      'Personagem não encontrado',
      'CHAR_NOT_FOUND',
      { personagemId },
    );
  }
}

export class PontosInsuficientesException extends BusinessException {
  constructor(tipo: string, disponivel: number, necessario: number) {
    super(
      `Pontos de ${tipo} insuficientes`,
      'CHAR_INSUFFICIENT_POINTS',
      { tipo, disponivel, necessario },
    );
  }
}

// Equipamento
export class EquipamentoNaoEncontradoException extends BusinessException {
  constructor(equipamentoId: number) {
    super(
      'Equipamento não encontrado',
      'EQUIP_NOT_FOUND',
      { equipamentoId },
    );
  }
}

export class EspacoInsuficienteException extends BusinessException {
  constructor(espacoDisponivel: number, espacoNecessario: number) {
    super(
      'Espaço insuficiente no inventário',
      'INV_INSUFFICIENT_SPACE',
      { espacoDisponivel, espacoNecessario },
    );
  }
}

// Campanha
export class CampanhaNaoEncontradaException extends BusinessException {
  constructor(campanhaId: number) {
    super(
      'Campanha não encontrada',
      'CAMP_NOT_FOUND',
      { campanhaId },
    );
  }
}

export class UsuarioJaNaCampanhaException extends BusinessException {
  constructor(usuarioId: number, campanhaId: number) {
    super(
      'Usuário já está nesta campanha',
      'CAMP_USER_ALREADY_MEMBER',
      { usuarioId, campanhaId },
    );
  }
}
