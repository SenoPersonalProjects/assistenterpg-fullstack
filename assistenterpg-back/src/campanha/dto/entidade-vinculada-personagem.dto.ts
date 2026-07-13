import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EstadoEntidadeVinculadaPersonagem,
  TamanhoNpcAmeaca,
  TipoEntidadeVinculadaPersonagem,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';

export enum PapelCalculoEntidadeVinculada {
  AGIL = 'AGIL',
  FLEXIVEL = 'FLEXIVEL',
  TANQUE = 'TANQUE',
}

export class CriarEntidadeVinculadaPersonagemDto {
  @IsEnum(TipoEntidadeVinculadaPersonagem)
  tipo: TipoEntidadeVinculadaPersonagem;

  @IsString()
  @MaxLength(120)
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string | null;

  @IsOptional()
  @IsString()
  conceito?: string | null;

  @IsOptional()
  @IsString()
  aparencia?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  nivelReferencia?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  grauReferencia?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tecnicaOrigemId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tipoGrauCodigo?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  npcAmeacaOrigemId?: number | null;

  @IsOptional()
  @IsEnum(TipoFichaNpcAmeaca)
  fichaTipo?: TipoFichaNpcAmeaca;

  @IsOptional()
  @IsEnum(TipoNpcAmeaca)
  tipoNpc?: TipoNpcAmeaca;

  @IsOptional()
  @IsEnum(TamanhoNpcAmeaca)
  tamanho?: TamanhoNpcAmeaca;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  vd?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  agilidade?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  forca?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  intelecto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  presenca?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  vigor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  percepcao?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  iniciativa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fortitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reflexos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  vontade?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  luta?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  jujutsu?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pontaria?: number;

  @IsOptional()
  @IsEnum(PapelCalculoEntidadeVinculada)
  papel?: PapelCalculoEntidadeVinculada;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  defesa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pontosVidaMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pontosVidaAtual?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  rd?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  deslocamentoMetros?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vagasOcupadas?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cargasMax?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cargasAtual?: number | null;

  @IsOptional()
  @IsObject()
  periciasEspeciais?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  resistencias?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  vulnerabilidades?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  passivas?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  acoes?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  habilidades?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  custos?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  limites?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown> | null;

  @IsOptional()
  @IsBoolean()
  overrideMestre?: boolean;
}

export class AtualizarEntidadeVinculadaPersonagemDto extends PartialType(
  CriarEntidadeVinculadaPersonagemDto,
) {}

export class AtualizarEstadoEntidadeVinculadaDto {
  @IsEnum(EstadoEntidadeVinculadaPersonagem)
  estado: EstadoEntidadeVinculadaPersonagem;
}

export class AssociarTemplateEntidadeVinculadaDto {
  @IsOptional()
  @IsBoolean()
  overrideMestre?: boolean;
}

export class InvocarEntidadeVinculadaSessaoDto {
  @IsOptional()
  @IsBoolean()
  ocultoJogadores?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cenaId?: number | null;

  @IsOptional()
  @IsBoolean()
  ignorarLimite?: boolean;
}

export class ConcederMaldicaoControladaSessaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  personagemCampanhaId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  npcAmeacaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  npcSessaoId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string | null;
}
