//src/tecnicas-amaldicoadas/dto/create-variacao.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import {
  TipoExecucao,
  AreaEfeito,
  TipoDano,
  TipoEscalonamentoHabilidade,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

export class CreateVariacaoHabilidadeDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  habilidadeTecnicaId: number;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsOptional()
  @IsBoolean()
  substituiCustos?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoPE?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoEA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoSustentacaoEA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoSustentacaoPE?: number;

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

  @IsOptional()
  @IsString()
  resistencia?: string;

  @IsOptional()
  @IsString()
  dtResistencia?: string;

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
  dadosDano?: Prisma.JsonValue;

  @IsOptional()
  @IsBoolean()
  escalonaPorGrau?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  escalonamentoCustoEA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  escalonamentoCustoPE?: number;

  @IsOptional()
  @IsEnum(TipoEscalonamentoHabilidade)
  escalonamentoTipo?: TipoEscalonamentoHabilidade;

  @IsOptional()
  escalonamentoEfeito?: Prisma.JsonValue;

  @IsOptional()
  escalonamentoDano?: Prisma.JsonValue;

  @IsOptional()
  @IsString()
  efeitoAdicional?: string;

  @IsOptional()
  requisitos?: Prisma.JsonValue;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordem?: number;
}
