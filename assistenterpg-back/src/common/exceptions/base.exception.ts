// src/common/exceptions/base.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Interface para detalhes de erro estruturados
 */
export interface ErrorDetails {
  code?: string; // Código do erro (ex: "HB_001", "USER_NOT_FOUND")
  message: string; // Mensagem principal
  details?: unknown; // Detalhes adicionais (objeto, array, etc)
  field?: string; // Campo específico que causou o erro
  timestamp?: string; // Timestamp do erro
  path?: string; // Rota onde ocorreu o erro
  stack?: string; // Stack trace (apenas em DEV)
}

/**
 * Exceção base customizada
 */
export class BaseException extends HttpException {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly field?: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    status: HttpStatus,
    code?: string,
    details?: unknown,
    field?: string,
  ) {
    super(
      {
        statusCode: status,
        message,
        code: code || 'UNKNOWN_ERROR',
        details,
        field,
        timestamp: new Date().toISOString(),
      },
      status,
    );

    this.code = code || 'UNKNOWN_ERROR';
    this.details = details;
    this.field = field;
    this.timestamp = new Date().toISOString();

    // Manter o nome correto da exceção
    this.name = this.constructor.name;

    // Capturar stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
