// src/homebrews/dto/filtrar-homebrews.dto.ts

import { IsOptional, IsString, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoHomebrewConteudo, StatusPublicacao } from '@prisma/client';

/**
 * DTO para filtrar homebrews
 */
export class FiltrarHomebrewsDto {
  @IsOptional()
  @IsString()
  nome?: string; // Busca por nome (contains)

  @IsOptional()
  @IsEnum(TipoHomebrewConteudo)
  tipo?: TipoHomebrewConteudo; // Filtrar por tipo

  @IsOptional()
  @IsEnum(StatusPublicacao)
  status?: StatusPublicacao; // Filtrar por status

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  usuarioId?: number; // Filtrar homebrews de um usuário específico (ADMIN ou próprio usuário)

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  apenasPublicados?: boolean; // true = apenas publicados, false = todos

  // ✅ PAGINAÇÃO
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pagina?: number; // Página atual (default: 1)

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limite?: number; // Itens por página (default: 20)
}
