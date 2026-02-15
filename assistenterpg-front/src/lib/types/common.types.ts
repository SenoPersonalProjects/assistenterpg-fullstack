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
  details?: Record<string, any>;
};
