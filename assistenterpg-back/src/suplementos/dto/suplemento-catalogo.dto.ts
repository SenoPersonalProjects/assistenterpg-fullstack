// src/suplementos/dto/suplemento-catalogo.dto.ts

import { StatusPublicacao } from '@prisma/client';

export class SuplementoCatalogoDto {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  versao: string;
  status: StatusPublicacao;
  icone?: string;
  banner?: string;
  tags?: string[];
  autor?: string;
  ativo?: boolean; // Se está ativo para o usuário (contexto específico)
  criadoEm: Date;
  atualizadoEm: Date;
}
