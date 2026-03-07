// src/homebrews/dto/tecnicas/variacao-habilidade.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoExecucao, AreaEfeito, TipoDano } from '@prisma/client';
import { DadoDanoDto, EscalonamentoDanoDto } from './shared-tecnica.dto'; // ✅ IMPORTAR DO SHARED

/**
 * DTO para Variação de Habilidade (Liberação Superior/Máxima)
 */
export class VariacaoHabilidadeDto {
  @IsNotEmpty()
  @IsString()
  nome: string; // Ex: "Liberação Superior", "Liberação Máxima"

  @IsNotEmpty()
  @IsString()
  descricao: string;

  // Custos
  @IsOptional()
  @IsBoolean()
  substituiCustos?: boolean; // true = substitui, false = adiciona

  @IsOptional()
  @IsInt()
  custoPE?: number;

  @IsOptional()
  @IsInt()
  custoEA?: number;

  // Execução (opcional - sobrescreve se definido)
  @IsOptional()
  @IsEnum(TipoExecucao)
  execucao?: TipoExecucao;

  @IsOptional()
  @IsEnum(AreaEfeito)
  area?: AreaEfeito;

  @IsOptional()
  @IsString()
  alcance?: string;

  @IsOptional()
  @IsString()
  alvo?: string;

  @IsOptional()
  @IsString()
  duracao?: string;

  // Resistência (opcional - sobrescreve se definido)
  @IsOptional()
  @IsString()
  resistencia?: string;

  @IsOptional()
  @IsString()
  dtResistencia?: string;

  // Dano (SOBRESCREVE se definido)
  @IsOptional()
  @IsInt()
  criticoValor?: number;

  @IsOptional()
  @IsInt()
  criticoMultiplicador?: number;

  @IsOptional()
  @IsInt()
  danoFlat?: number;

  @IsOptional()
  @IsEnum(TipoDano)
  danoFlatTipo?: TipoDano;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DadoDanoDto)
  dadosDano?: DadoDanoDto[];

  // Escalonamento (opcional - sobrescreve se definido)
  @IsOptional()
  @IsBoolean()
  escalonaPorGrau?: boolean;

  @IsOptional()
  @IsInt()
  escalonamentoCustoEA?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EscalonamentoDanoDto)
  escalonamentoDano?: EscalonamentoDanoDto;

  // Efeito adicional
  @IsOptional()
  @IsString()
  efeitoAdicional?: string;

  // Requisitos específicos
  @IsOptional()
  requisitos?: any; // JSON livre

  // Ordem
  @IsOptional()
  @IsInt()
  ordem?: number;
}
