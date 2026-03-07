// src/equipamentos/dto/atualizar-equipamento.dto.ts

import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  TipoEquipamento,
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  ProficienciaArma,
  EmpunhaduraArma,
  TipoArma,
  SubtipoArmaDistancia,
  AlcanceArma,
  ProficienciaProtecao,
  TipoProtecao,
  TipoAcessorio,
  TipoExplosivo,
  TipoUsoEquipamento,
  TipoAmaldicoado,
  TipoFonte,
} from '@prisma/client';

/**
 * DTO para atualizar equipamento
 * Todos os campos são opcionais (permite atualização parcial)
 */
export class AtualizarEquipamentoDto {
  // ============================================================
  // CAMPOS BÁSICOS
  // ============================================================

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsOptional()
  @IsEnum(TipoEquipamento)
  tipo?: TipoEquipamento;

  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  @IsOptional()
  @IsEnum(CategoriaEquipamento)
  categoria?: CategoriaEquipamento;

  @IsOptional()
  @IsInt()
  @Min(0)
  espacos?: number;

  @IsOptional()
  @IsEnum(ComplexidadeMaldicao)
  complexidadeMaldicao?: ComplexidadeMaldicao;

  @IsOptional()
  @IsEnum(TipoUsoEquipamento)
  tipoUso?: TipoUsoEquipamento;

  @IsOptional()
  @IsEnum(TipoAmaldicoado)
  tipoAmaldicoado?: TipoAmaldicoado;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  efeito?: string;

  // ✅ CAMPOS FALTANTES DE MALDIÇÃO
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  efeitoMaldicao?: string;

  @IsOptional()
  @IsBoolean()
  requerFerramentasAmaldicoadas?: boolean;

  // ============================================================
  // CAMPOS DE ARMA
  // ============================================================

  @IsOptional()
  @IsEnum(ProficienciaArma)
  proficienciaArma?: ProficienciaArma;

  @IsOptional()
  @IsArray()
  @IsEnum(EmpunhaduraArma, { each: true })
  empunhaduras?: EmpunhaduraArma[];

  @IsOptional()
  @IsEnum(TipoArma)
  tipoArma?: TipoArma;

  @IsOptional()
  @IsEnum(SubtipoArmaDistancia)
  subtipoDistancia?: SubtipoArmaDistancia;

  @IsOptional()
  @IsBoolean()
  agil?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  criticoValor?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  criticoMultiplicador?: number;

  @IsOptional()
  @IsEnum(AlcanceArma)
  alcance?: AlcanceArma;

  @IsOptional()
  @IsString()
  tipoMunicaoCodigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  habilidadeEspecial?: string;

  // ============================================================
  // CAMPOS DE PROTEÇÃO
  // ============================================================

  @IsOptional()
  @IsEnum(ProficienciaProtecao)
  proficienciaProtecao?: ProficienciaProtecao;

  @IsOptional()
  @IsEnum(TipoProtecao)
  tipoProtecao?: TipoProtecao;

  @IsOptional()
  @IsInt()
  @Min(0)
  bonusDefesa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  penalidadeCarga?: number;

  // ============================================================
  // CAMPOS DE MUNIÇÃO
  // ============================================================

  @IsOptional()
  @IsInt()
  @Min(1)
  duracaoCenas?: number;

  @IsOptional()
  @IsBoolean()
  recuperavel?: boolean;

  // ============================================================
  // CAMPOS DE ACESSÓRIO
  // ============================================================

  @IsOptional()
  @IsEnum(TipoAcessorio)
  tipoAcessorio?: TipoAcessorio;

  @IsOptional()
  @IsString()
  periciaBonificada?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  bonusPericia?: number;

  @IsOptional()
  @IsBoolean()
  requereEmpunhar?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxVestimentas?: number;

  // ============================================================
  // CAMPOS DE EXPLOSIVO
  // ============================================================

  @IsOptional()
  @IsEnum(TipoExplosivo)
  tipoExplosivo?: TipoExplosivo;
}
