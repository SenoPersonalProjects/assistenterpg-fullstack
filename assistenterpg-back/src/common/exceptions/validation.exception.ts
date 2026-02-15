// src/common/exceptions/validation.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exceção de validação customizada
 */
export class ValidationException extends BaseException {
  constructor(
    message: string,
    field?: string,
    details?: any,
    code: string = 'VALIDATION_ERROR',
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, details, field);
  }
}

/**
 * Validações específicas
 */

export class CampoObrigatorioException extends ValidationException {
  constructor(field: string) {
    super(
      `O campo "${field}" é obrigatório`,
      field,
      undefined,
      'FIELD_REQUIRED',
    );
  }
}

export class FormatoInvalidoException extends ValidationException {
  constructor(field: string, formatoEsperado: string) {
    super(
      `O campo "${field}" está em formato inválido`,
      field,
      { formatoEsperado },
      'INVALID_FORMAT',
    );
  }
}

export class ValorForaDoIntervaloException extends ValidationException {
  constructor(field: string, min: number, max: number, valorRecebido: number) {
    super(
      `O campo "${field}" deve estar entre ${min} e ${max}`,
      field,
      { min, max, valorRecebido },
      'OUT_OF_RANGE',
    );
  }
}

export class ValoresUnicosException extends ValidationException {
  constructor(field: string, valorDuplicado: any) {
    super(
      `O campo "${field}" contém valores duplicados`,
      field,
      { valorDuplicado },
      'DUPLICATE_VALUES',
    );
  }
}
