// lib/types/suplemento.types.ts
/**
 * Types relacionados a suplementos
 */

export type SuplementoStatus = 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO';

/**
 * DTO bruto retornado pela API de suplementos
 *
 * Observação: datas chegam como string (ISO) no payload HTTP.
 */
export type SuplementoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  versao: string;
  status: SuplementoStatus;
  icone?: string;
  banner?: string;
  tags?: string[];
  autor?: string;
  ativo?: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

