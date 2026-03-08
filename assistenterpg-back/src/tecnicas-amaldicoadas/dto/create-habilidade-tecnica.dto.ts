//src/tecnicas-amaldicoadas/dto/create-habilidade-tecnica.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { TipoExecucao, AreaEfeito, TipoDano } from '@prisma/client';

export class CreateHabilidadeTecnicaDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  tecnicaId: number;

  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsOptional()
  requisitos?: any;

  @IsNotEmpty()
  @IsEnum(TipoExecucao)
  execucao: TipoExecucao;

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
  @Min(0)
  custoPE?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoEA?: number;

  @IsOptional()
  testesExigidos?: any;

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
  dadosDano?: any;

  @IsOptional()
  @IsBoolean()
  escalonaPorGrau?: boolean;

  @IsOptional()
  @IsString()
  grauTipoGrauCodigo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  escalonamentoCustoEA?: number;

  @IsOptional()
  escalonamentoDano?: any;

  @IsNotEmpty()
  @IsString()
  efeito: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordem?: number;
}
