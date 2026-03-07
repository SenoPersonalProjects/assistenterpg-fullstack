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
import { TipoAmaldicoado } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
import { HomebrewArmaDto } from './criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from './criar-homebrew-protecao.dto';

/**
 * DTO para Artefato Amaldiçoado
 */
export class ArtefatoAmaldicoadoDto {
  @IsNotEmpty()
  @IsString()
  tipoBase: string; // Ex: "Amuleto", "Anel", "Talismã"

  @IsNotEmpty()
  @IsBoolean()
  proficienciaRequerida: boolean;

  @IsNotEmpty()
  @IsString()
  efeito: string;

  @IsNotEmpty()
  @IsString()
  custoUso: string; // Ex: "1 PE por uso"

  @IsNotEmpty()
  @IsString()
  manutencao: string; // Ex: "Requer recarga semanal"
}

/**
 * DTO para Arma Amaldiçoada
 */
export class ArmaAmaldicoadaDto {
  @IsNotEmpty()
  @IsString()
  tipoBase: string; // Ex: "FACA", "ESPADA"

  @IsNotEmpty()
  @IsBoolean()
  proficienciaRequerida: boolean;

  @IsNotEmpty()
  @IsString()
  efeito: string;

  // Dados da arma base (herda de HomebrewArmaDto)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => HomebrewArmaDto)
  dadosArma: HomebrewArmaDto;
}

/**
 * DTO para Proteção Amaldiçoada
 */
export class ProtecaoAmaldicoadaDto {
  @IsNotEmpty()
  @IsString()
  tipoBase: string; // Ex: "Colete", "Escudo"

  @IsNotEmpty()
  @IsBoolean()
  proficienciaRequerida: boolean;

  @IsNotEmpty()
  @IsString()
  efeito: string;

  // Dados da proteção base (herda de HomebrewProtecaoDto)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => HomebrewProtecaoDto)
  dadosProtecao: HomebrewProtecaoDto;
}

/**
 * DTO para homebrews de FERRAMENTA AMALDIÇOADA
 */
export class HomebrewFerramentaAmaldicoadaDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(TipoAmaldicoado)
  tipoAmaldicoado: TipoAmaldicoado; // ARMA, PROTECAO, ITEM, ARTEFATO

  // Um dos três deve ser fornecido (validado no validator)
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
