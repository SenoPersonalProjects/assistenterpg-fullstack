// src/common/exceptions/tipo-grau.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// TIPO DE GRAU - EXCEÇÕES
// ============================================================================

export class TipoGrauNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Tipo de grau não encontrado',
      HttpStatus.NOT_FOUND,
      'TIPO_GRAU_NOT_FOUND',
      { identificador },
    );
  }
}

// ✅ OPCIONAL: Para futuras validações de negócio
export class TipoGrauCodigoDuplicadoException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Tipo de grau com código "${codigo}" já existe`,
      'TIPO_GRAU_CODIGO_DUPLICADO',
      { codigo },
    );
  }
}

export class TipoGrauEmUsoException extends BusinessException {
  constructor(
    tipoGrauId: number,
    totalUsos: number,
    detalhesUso?: Record<string, number>,
  ) {
    super(
      `Tipo de grau está sendo usado em ${totalUsos} referência(s). Remova as referências primeiro.`,
      'TIPO_GRAU_EM_USO',
      { tipoGrauId, totalUsos, detalhesUso },
    );
  }
}
