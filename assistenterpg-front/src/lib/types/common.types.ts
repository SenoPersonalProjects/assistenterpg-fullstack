// lib/types/common.types.ts
/**
 * Types comuns compartilhados entre todos os módulos
 */

export type AtributoBaseCodigo = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';
export type AtributoChaveEA = 'INT' | 'PRE';

/**
 * Estrutura de erro padrão da API
 */
export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  code?: string;
  traceId?: string;
  path?: string;
  method?: string;
  details?: Record<string, unknown>;
};

export type ErrorSupportInfo = {
  code?: string;
  referenceId?: string;
  status?: number;
};

export type UserFacingError = ErrorSupportInfo & {
  message: string;
  retryAfterSeconds?: number;
};

export type UserErrorState = string | UserFacingError;
