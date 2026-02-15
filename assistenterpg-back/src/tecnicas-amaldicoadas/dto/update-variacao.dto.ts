//src/tecnicas-amaldicoadas/dto/update-variacao.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { AreaEfeito, Prisma, TipoDano, TipoExecucao } from '@prisma/client';

export class UpdateVariacaoHabilidadeDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

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
  dadosDano?: Prisma.InputJsonValue;

  @IsOptional()
  @IsBoolean()
  escalonaPorGrau?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  escalonamentoCustoEA?: number;

  @IsOptional()
  escalonamentoDano?: Prisma.InputJsonValue;

  @IsOptional()
  @IsString()
  efeitoAdicional?: string;

  @IsOptional()
  requisitos?: Prisma.InputJsonValue;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordem?: number;
}
