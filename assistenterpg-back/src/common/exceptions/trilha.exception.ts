// src/common/exceptions/trilha.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// TRILHA - EXCEÇÕES
// ============================================================================

export class TrilhaNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super('Trilha não encontrada', HttpStatus.NOT_FOUND, 'TRILHA_NOT_FOUND', {
      identificador,
    });
  }
}

export class TrilhaClasseNaoEncontradaException extends BaseException {
  constructor(classeId: number) {
    super(
      `Classe #${classeId} não encontrada`,
      HttpStatus.NOT_FOUND,
      'TRILHA_CLASSE_NOT_FOUND',
      { classeId },
    );
  }
}

export class TrilhaNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(`Trilha com nome "${nome}" já existe`, 'TRILHA_NOME_DUPLICADO', {
      nome,
    });
  }
}

export class TrilhaEmUsoException extends BusinessException {
  constructor(
    trilhaId: number,
    totalUsos: number,
    detalhesUso: {
      personagensBase: number;
      personagensCampanha: number;
    },
  ) {
    super(
      `Trilha está sendo usada por ${totalUsos} personagem(ns). Remova as referências primeiro.`,
      'TRILHA_EM_USO',
      { trilhaId, totalUsos, detalhesUso },
    );
  }
}

// ============================================================================
// CAMINHO - EXCEÇÕES
// ============================================================================

export class CaminhoNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super('Caminho não encontrado', HttpStatus.NOT_FOUND, 'CAMINHO_NOT_FOUND', {
      identificador,
    });
  }
}

export class CaminhoNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(`Caminho com nome "${nome}" já existe`, 'CAMINHO_NOME_DUPLICADO', {
      nome,
    });
  }
}

export class CaminhoEmUsoException extends BusinessException {
  constructor(
    caminhoId: number,
    totalUsos: number,
    detalhesUso: {
      personagensBase: number;
      personagensCampanha: number;
    },
  ) {
    super(
      `Caminho está sendo usado por ${totalUsos} personagem(ns). Remova as referências primeiro.`,
      'CAMINHO_EM_USO',
      { caminhoId, totalUsos, detalhesUso },
    );
  }
}
