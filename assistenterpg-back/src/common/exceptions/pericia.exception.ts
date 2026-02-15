// src/common/exceptions/pericia.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

// ============================================================================
// PERÍCIA - EXCEÇÕES
// ============================================================================

export class PericiaNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Perícia não encontrada',
      HttpStatus.NOT_FOUND,
      'PERICIA_NOT_FOUND',
      { identificador },
    );
  }
}
