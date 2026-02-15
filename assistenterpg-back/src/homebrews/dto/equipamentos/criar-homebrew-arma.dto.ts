// src/homebrews/dto/equipamentos/criar-homebrew-arma.dto.ts

import { IsNotEmpty, IsEnum, IsBoolean, IsArray, ValidateNested, IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProficienciaArma,
  EmpunhaduraArma,
  TipoArma,
  SubtipoArmaDistancia,
  AlcanceArma,
  TipoDano,
} from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * Dano de arma
 */
export class DanoArmaDto {
  @IsOptional()
  @IsEnum(EmpunhaduraArma)
  empunhadura?: EmpunhaduraArma; // null para armas sem empunhadura específica

  @IsNotEmpty()
  @IsEnum(TipoDano)
  tipoDano: TipoDano;

  @IsNotEmpty()
  @IsString()
  rolagem: string; // Ex: "1d6", "2d4"

  @IsOptional()
  @IsInt()
  valorFlat?: number; // Dano fixo adicional (padrão: 0)
}

/**
 * DTO para homebrews de ARMA
 */
export class HomebrewArmaDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(ProficienciaArma)
  proficienciaArma: ProficienciaArma; // SIMPLES, TATICA

  @IsNotEmpty()
  @IsArray()
  @IsEnum(EmpunhaduraArma, { each: true })
  empunhaduras: EmpunhaduraArma[]; // [LEVE], [UMA_MAO], [DUAS_MAOS], [UMA_MAO, DUAS_MAOS]

  @IsNotEmpty()
  @IsEnum(TipoArma)
  tipoArma: TipoArma; // CORPO_A_CORPO, DISTANCIA

  @IsOptional()
  @IsEnum(SubtipoArmaDistancia)
  subtipoDistancia?: SubtipoArmaDistancia; // ARCO, ARMA_FOGO, LANCADOR

  @IsNotEmpty()
  @IsBoolean()
  agil: boolean;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DanoArmaDto)
  danos: DanoArmaDto[];

  @IsNotEmpty()
  @IsInt()
  criticoValor: number; // Ex: 19, 20

  @IsNotEmpty()
  @IsInt()
  criticoMultiplicador: number; // Ex: 2, 3

  @IsNotEmpty()
  @IsEnum(AlcanceArma)
  alcance: AlcanceArma; // ADJACENTE, CURTO, MEDIO, LONGO, EXTREMO

  @IsOptional()
  @IsString()
  tipoMunicaoCodigo?: string; // Ex: "BALAS_CURTAS"

  @IsOptional()
  @IsString()
  habilidadeEspecial?: string; // Ex: "Pode ser arremessada"
}
