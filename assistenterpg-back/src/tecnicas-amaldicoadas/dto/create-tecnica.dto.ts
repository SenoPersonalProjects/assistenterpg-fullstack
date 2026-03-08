// src/tecnicas-amaldicoadas/dto/create-tecnica.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client'; // ✅ NOVO

export class CreateTecnicaDto {
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsEnum(TipoTecnicaAmaldicoada)
  tipo: TipoTecnicaAmaldicoada;

  @IsOptional()
  @IsBoolean()
  hereditaria?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clasHereditarios?: string[]; // Nomes dos clãs

  @IsOptional()
  @IsString()
  linkExterno?: string;

  // ✅ CORRIGIDO: origem → fonte
  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  // ✅ NOVO: suplementoId
  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  @IsOptional()
  requisitos?: any; // JSON
}
