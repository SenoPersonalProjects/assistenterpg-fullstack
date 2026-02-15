// src/common/exceptions/habilidade.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// HABILIDADE - EXCEÇÕES
// ============================================================================

export class HabilidadeNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Habilidade não encontrada',
      HttpStatus.NOT_FOUND,
      'HABILIDADE_NOT_FOUND',
      { identificador },
    );
  }
}

export class HabilidadeNomeDuplicadoException extends BusinessException {
  constructor(nome: string) {
    super(
      `Habilidade com nome "${nome}" já existe`,
      'HABILIDADE_NOME_DUPLICADO',
      { nome },
    );
  }
}

export class TipoGrauNaoEncontradoException extends BaseException {
  constructor(codigosInvalidos: string[]) {
    super(
      `Tipos de grau não encontrados: ${codigosInvalidos.join(', ')}`,
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
      `Habilidade está sendo usada por ${totalUsos} entidade(s). Remova as referências primeiro.`,
      'HABILIDADE_EM_USO',
      { habilidadeId, totalUsos, detalhesUso },
    );
  }
}
