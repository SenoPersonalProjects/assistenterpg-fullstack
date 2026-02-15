// src/homebrews/dto/tecnicas/habilidade-tecnica.dto.ts

import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoExecucao, AreaEfeito, TipoDano } from '@prisma/client';
import { DadoDanoDto, EscalonamentoDanoDto } from './shared-tecnica.dto'; // ✅ IMPORTAR DO SHARED
import { VariacaoHabilidadeDto } from './variacao-habilidade.dto'; // ✅ IMPORTAR

/**
 * DTO para Habilidade de Técnica Amaldiçoada
 */
export class HabilidadeTecnicaDto {
  @IsNotEmpty()
  @IsString()
  codigo: string; // Ex: "MANIPULACAO_SANGUE_CONVERGENCIA"

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  // Requisitos (JSON livre)
  @IsOptional()
  requisitos?: any; // Ex: { "Nível": 5, "Grau de Aprimoramento em Técnica Amaldiçoada": 2 }

  // Execução
  @IsNotEmpty()
  @IsEnum(TipoExecucao)
  execucao: TipoExecucao; // ACAO_PADRAO, ACAO_COMPLETA, REACAO, etc.

  @IsOptional()
  @IsEnum(AreaEfeito)
  area?: AreaEfeito; // CONE, CILINDRO, ESFERA, etc.

  @IsOptional()
  @IsString()
  alcance?: string; // Ex: "CURTO", "12m", "ADJACENTE"

  @IsOptional()
  @IsString()
  alvo?: string; // Ex: "Você", "1 criatura", "Todos em alcance curto"

  @IsOptional()
  @IsString()
  duracao?: string; // Ex: "Instantâneo", "Sustentado", "3 turnos"

  // Resistência
  @IsOptional()
  @IsString()
  resistencia?: string; // Ex: "Fortitude", "Reflexos"

  @IsOptional()
  @IsString()
  dtResistencia?: string; // Ex: "10 + Limite PE/EA + INT"

  // Custos
  @IsNotEmpty()
  @IsInt()
  custoPE: number;

  @IsNotEmpty()
  @IsInt()
  custoEA: number;

  // Testes exigidos
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testesExigidos?: string[]; // Ex: ["Atletismo", "Acrobacia"]

  // Crítico
  @IsOptional()
  @IsInt()
  criticoValor?: number; // Ex: 19

  @IsOptional()
  @IsInt()
  criticoMultiplicador?: number; // Ex: 2

  // Dano flat
  @IsOptional()
  @IsInt()
  danoFlat?: number;

  @IsOptional()
  @IsEnum(TipoDano)
  danoFlatTipo?: TipoDano;

  // Dados de dano
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DadoDanoDto)
  dadosDano?: DadoDanoDto[];

  // Escalonamento
  @IsOptional()
  @IsBoolean()
  escalonaPorGrau?: boolean;

  @IsOptional()
  @IsString()
  grauTipoGrauCodigo?: string; // Ex: "TECNICA_AMALDICOADA"

  @IsOptional()
  @IsInt()
  escalonamentoCustoEA?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EscalonamentoDanoDto)
  escalonamentoDano?: EscalonamentoDanoDto;

  // Efeito
  @IsNotEmpty()
  @IsString()
  efeito: string;

  // Variações (Liberação Superior/Máxima)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariacaoHabilidadeDto)
  variacoes?: VariacaoHabilidadeDto[];

  // Ordem
  @IsOptional()
  @IsInt()
  ordem?: number;
}
