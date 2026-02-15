// src/homebrews/dto/homebrew-detalhado.dto.ts

import { TipoHomebrewConteudo, StatusPublicacao } from '@prisma/client';

/**
 * DTO de resposta para Homebrew detalhado
 * Inclui dados do dono
 */
export class HomebrewDetalhadoDto {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: TipoHomebrewConteudo;
  status: StatusPublicacao;
  dados: any; // JSON - Estrutura varia por tipo
  tags?: string[];
  versao: string;

  // Dono
  usuarioId: number;
  usuarioApelido?: string; // ✅ CORRIGIDO (era usuarioNome)

  // Timestamps
  criadoEm: Date;
  atualizadoEm: Date;
}
