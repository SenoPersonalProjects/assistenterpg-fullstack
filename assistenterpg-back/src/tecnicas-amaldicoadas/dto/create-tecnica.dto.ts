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
import { Transform } from 'class-transformer';
import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client';

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
  @Transform(({ value }: { value: unknown }): unknown => {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.map((item: unknown) =>
      typeof item === 'string' ? item.trim() : item,
    );
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  clasHereditarios?: string[];

  @IsOptional()
  @IsString()
  linkExterno?: string;

  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  @IsOptional()
  requisitos?: any; // JSON
}
