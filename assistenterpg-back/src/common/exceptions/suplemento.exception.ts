// src/common/exceptions/suplemento.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// SUPLEMENTO - EXCEÇÕES
// ============================================================================

export class SuplementoNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Suplemento não encontrado',
      HttpStatus.NOT_FOUND,
      'SUPLEMENTO_NOT_FOUND',
      { identificador },
    );
  }
}

export class SuplementoCodigoDuplicadoException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Suplemento com código "${codigo}" já existe`,
      'SUPLEMENTO_CODIGO_DUPLICADO',
      { codigo },
    );
  }
}

export class SuplementoComConteudoVinculadoException extends BusinessException {
  constructor(
    suplementoId: number,
    totalConteudo: number,
    detalhesConteudo: Record<string, number>,
  ) {
    super(
      `Suplemento possui ${totalConteudo} conteúdo(s) vinculado(s) e não pode ser deletado`,
      'SUPLEMENTO_COM_CONTEUDO_VINCULADO',
      { suplementoId, totalConteudo, detalhesConteudo },
    );
  }
}

export class SuplementoNaoPublicadoException extends BusinessException {
  constructor(suplementoId: number, statusAtual: string) {
    super(
      'Apenas suplementos publicados podem ser ativados',
      'SUPLEMENTO_NAO_PUBLICADO',
      { suplementoId, statusAtual },
    );
  }
}

export class SuplementoJaAtivoException extends BusinessException {
  constructor(usuarioId: number, suplementoId: number) {
    super('Suplemento já está ativo para este usuário', 'SUPLEMENTO_JA_ATIVO', {
      usuarioId,
      suplementoId,
    });
  }
}

export class SuplementoNaoAtivoException extends BaseException {
  constructor(usuarioId: number, suplementoId: number) {
    super(
      'Suplemento não está ativo para este usuário',
      HttpStatus.NOT_FOUND,
      'SUPLEMENTO_NAO_ATIVO',
      { usuarioId, suplementoId },
    );
  }
}
