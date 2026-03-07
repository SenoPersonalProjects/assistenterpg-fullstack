// src/clas/dto/create-cla.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  MinLength,
  MaxLength,
  IsEnum,
  Min,
} from 'class-validator';
import { TipoFonte } from '@prisma/client';

export class CreateClaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Descrição deve ter no máximo 2000 caracteres' })
  descricao?: string;

  @IsBoolean()
  grandeCla: boolean;

  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  // ✅ CORRIGIDO: Técnicas hereditárias do clã (IDs de TecnicaAmaldicoada)
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tecnicasHereditariasIds?: number[];
}
