// src/origens/dto/create-origem.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoFonte } from '@prisma/client';

// DTO para pericia da origem
export class OrigemPericiaDto {
  @IsInt()
  @IsNotEmpty()
  periciaId: number;

  @IsEnum(['FIXA', 'ESCOLHA'], {
    message: 'Tipo deve ser FIXA ou ESCOLHA',
  })
  tipo: 'FIXA' | 'ESCOLHA';

  @IsOptional()
  @IsInt()
  grupoEscolha?: number; // Para pericias do tipo ESCOLHA (ex: grupo 1, grupo 2)
}

export class CreateOrigemDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no minimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no maximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Descricao deve ter no maximo 2000 caracteres' })
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  requisitosTexto?: string;

  @IsOptional()
  @IsBoolean()
  requerGrandeCla?: boolean;

  @IsOptional()
  @IsBoolean()
  requerTecnicaHeriditaria?: boolean;

  @IsOptional()
  @IsBoolean()
  bloqueiaTecnicaHeriditaria?: boolean;

  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  // Pericias da origem
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrigemPericiaDto)
  pericias?: OrigemPericiaDto[];

  // Habilidades iniciais da origem
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  habilidadesIds?: number[];
}
