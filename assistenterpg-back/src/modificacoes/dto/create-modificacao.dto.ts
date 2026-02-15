// src/modificacoes/dto/create-modificacao.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoModificacao, TipoFonte } from '@prisma/client';
import type { RestricoesModificacao } from '../types/restricoes.types';

export class CreateModificacaoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Código deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Código deve ter no máximo 50 caracteres' })
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  descricao?: string;

  @IsEnum(TipoModificacao, {
    message: `Tipo deve ser: ${Object.values(TipoModificacao).join(', ')}`,
  })
  tipo: TipoModificacao;

  @IsInt()
  incrementoEspacos: number;

  // ✅ NOVO: Sistema de restrições flexível
  @IsOptional()
  @IsObject()
  restricoes?: RestricoesModificacao;

  @IsOptional()
  @IsObject()
  efeitosMecanicos?: any; // JSON livre

  // ✅ NOVO: Fonte e suplemento
  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  // ✅ IDs de equipamentos compatíveis (opcional na criação)
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  equipamentosCompatíveisIds?: number[];
}
