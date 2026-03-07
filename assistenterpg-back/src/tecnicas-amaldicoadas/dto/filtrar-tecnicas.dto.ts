// src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts

import {
  IsOptional,
  IsBoolean,
  IsString,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client'; // ✅ NOVO

export class FiltrarTecnicasDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsEnum(TipoTecnicaAmaldicoada)
  tipo?: TipoTecnicaAmaldicoada;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hereditaria?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  claId?: number;

  @IsOptional()
  @IsString()
  claNome?: string;

  // ✅ CORRIGIDO: origem → fonte
  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  // ✅ NOVO: Filtrar por suplemento
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  suplementoId?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  incluirHabilidades?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  incluirClas?: boolean;
}
