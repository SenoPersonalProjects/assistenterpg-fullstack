// src/homebrews/dto/equipamentos/criar-homebrew-ferramenta-amaldicoada.dto.ts

import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsBoolean,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/mapped-types';
import { TipoAmaldicoado } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
import { HomebrewArmaDto } from './criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from './criar-homebrew-protecao.dto';

export class DadosArmaAmaldicoadaDto extends OmitType(HomebrewArmaDto, [
  'tipo',
  'categoria',
  'espacos',
  'tipoUso',
] as const) {}

export class DadosProtecaoAmaldicoadaDto extends OmitType(HomebrewProtecaoDto, [
  'tipo',
  'categoria',
  'espacos',
  'tipoUso',
] as const) {}

/**
 * DTO para Artefato Amaldicoado
 */
export class ArtefatoAmaldicoadoDto {
  @IsNotEmpty()
  @IsString()
  tipoBase: string;

  @IsNotEmpty()
  @IsBoolean()
  proficienciaRequerida: boolean;

  @IsNotEmpty()
  @IsString()
  efeito: string;

  @IsNotEmpty()
  @IsString()
  custoUso: string;

  @IsNotEmpty()
  @IsString()
  manutencao: string;
}

/**
 * DTO para Arma Amaldicoada
 */
export class ArmaAmaldicoadaDto {
  @IsNotEmpty()
  @IsString()
  tipoBase: string;

  @IsNotEmpty()
  @IsBoolean()
  proficienciaRequerida: boolean;

  @IsNotEmpty()
  @IsString()
  efeito: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DadosArmaAmaldicoadaDto)
  dadosArma: DadosArmaAmaldicoadaDto;
}

/**
 * DTO para Protecao Amaldicoada
 */
export class ProtecaoAmaldicoadaDto {
  @IsNotEmpty()
  @IsString()
  tipoBase: string;

  @IsNotEmpty()
  @IsBoolean()
  proficienciaRequerida: boolean;

  @IsNotEmpty()
  @IsString()
  efeito: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DadosProtecaoAmaldicoadaDto)
  dadosProtecao: DadosProtecaoAmaldicoadaDto;
}

/**
 * DTO para homebrews de FERRAMENTA_AMALDICOADA
 */
export class HomebrewFerramentaAmaldicoadaDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(TipoAmaldicoado)
  tipoAmaldicoado: TipoAmaldicoado;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArmaAmaldicoadaDto)
  armaAmaldicoada?: ArmaAmaldicoadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProtecaoAmaldicoadaDto)
  protecaoAmaldicoada?: ProtecaoAmaldicoadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArtefatoAmaldicoadoDto)
  artefatoAmaldicoado?: ArtefatoAmaldicoadoDto;
}
