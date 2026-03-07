// src/common/exceptions/condicao.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// CONDIÇÃO - EXCEÇÕES
// ============================================================================

export class CondicaoNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Condição não encontrada',
      HttpStatus.NOT_FOUND,
      'CONDICAO_NOT_FOUND',
      { identificador },
    );
  }
}

export class CondicaoNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(`Condição com nome "${nome}" já existe`, 'CONDICAO_NOME_DUPLICADO', {
      nome,
    });
  }
}

export class CondicaoEmUsoException extends BusinessException {
  constructor(condicaoId: number, totalUsosSessoes: number) {
    super(
      `Condição está sendo usada em ${totalUsosSessoes} sessão(ões). Remova as referências primeiro.`,
      'CONDICAO_EM_USO',
      { condicaoId, totalUsosSessoes },
    );
  }
}
