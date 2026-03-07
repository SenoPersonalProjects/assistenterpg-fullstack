// src/homebrews/dto/tecnicas/criar-homebrew-tecnica.dto.ts

import {
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoTecnicaAmaldicoada } from '@prisma/client';
import { HabilidadeTecnicaDto } from './habilidade-tecnica.dto';

/**
 * DTO para homebrews de TÉCNICA AMALDIÇOADA
 */
export class HomebrewTecnicaDto {
  @IsNotEmpty()
  @IsEnum(TipoTecnicaAmaldicoada)
  tipo: TipoTecnicaAmaldicoada; // INATA, HEREDITARIA, etc.

  @IsOptional()
  @IsBoolean()
  hereditaria?: boolean; // Default: false

  @IsOptional()
  @IsString()
  linkExterno?: string; // URL de documentação/wiki

  @IsOptional()
  requisitos?: any; // JSON livre - Ex: { "nivel": 5, "atributo": "INT >= 3" }

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabilidadeTecnicaDto)
  habilidades: HabilidadeTecnicaDto[]; // Mínimo 1 habilidade
}
