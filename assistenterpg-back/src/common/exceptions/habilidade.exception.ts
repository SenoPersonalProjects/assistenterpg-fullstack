// src/common/exceptions/habilidade.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// HABILIDADE - EXCECOES
// ============================================================================

export class HabilidadeNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Habilidade nao encontrada',
      HttpStatus.NOT_FOUND,
      'HABILIDADE_NOT_FOUND',
      { identificador },
    );
  }
}

export class HabilidadeNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(
      `Habilidade com nome "${nome}" ja existe`,
      'HABILIDADE_NOME_DUPLICADO',
      { nome },
    );
  }
}

export class HabilidadeCodigoDuplicadoException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Habilidade com codigo "${codigo}" ja existe`,
      'HABILIDADE_CODIGO_DUPLICADO',
      { codigo },
    );
  }
}

export class TipoGrauNaoEncontradoException extends BaseException {
  constructor(codigosInvalidos: string[]) {
    super(
      `Tipos de grau nao encontrados: ${codigosInvalidos.join(', ')}`,
      HttpStatus.NOT_FOUND,
      'TIPO_GRAU_NOT_FOUND',
      { codigosInvalidos },
    );
  }
}

export class HabilidadeEmUsoException extends BusinessException {
  constructor(
    habilidadeId: number,
    totalUsos: number,
    detalhesUso: {
      personagensBase: number;
      personagensCampanha: number;
      classes: number;
      trilhas: number;
      origens: number;
    },
  ) {
    super(
      `Habilidade esta sendo usada por ${totalUsos} entidade(s). Remova as referencias primeiro.`,
      'HABILIDADE_EM_USO',
      { habilidadeId, totalUsos, detalhesUso },
    );
  }
}
