// src/common/exceptions/database.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { Prisma } from '@prisma/client';

/**
 * Exceção de banco de dados
 */
export class DatabaseException extends BaseException {
  constructor(message: string, code: string, details?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, code, details);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Erro desconhecido';
}

/**
 * Converter erros do Prisma em exceções customizadas
 */
export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint violation
        const fields = error.meta?.target as string[];
        throw new DatabaseException(
          `Registro duplicado: ${fields?.join(', ') || 'campo único'}`,
          'DB_UNIQUE_VIOLATION',
          { fields, value: error.meta },
        );
      }

      case 'P2003':
        // Foreign key constraint violation
        throw new DatabaseException(
          'Referência inválida: registro relacionado não existe',
          'DB_FOREIGN_KEY_VIOLATION',
          { field: error.meta?.field_name },
        );

      case 'P2025':
        // Record not found
        throw new DatabaseException(
          'Registro não encontrado',
          'DB_RECORD_NOT_FOUND',
          { cause: error.meta?.cause },
        );

      case 'P2014':
        // Required relation violation
        throw new DatabaseException(
          'Violação de relação obrigatória',
          'DB_REQUIRED_RELATION',
          { relation: error.meta?.relation_name },
        );

      default:
        throw new DatabaseException(
          `Erro de banco de dados: ${error.message}`,
          `DB_${error.code}`,
          { meta: error.meta },
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseException(
      'Erro de validação no banco de dados',
      'DB_VALIDATION_ERROR',
      { message: error.message },
    );
  }

  // Erro genérico
  throw new DatabaseException(
    'Erro interno no banco de dados',
    'DB_INTERNAL_ERROR',
    { message: getErrorMessage(error) },
  );
}
