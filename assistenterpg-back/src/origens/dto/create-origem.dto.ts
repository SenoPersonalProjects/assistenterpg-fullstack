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
} from 'class-validator';
import { Type } from 'class-transformer';

// ✅ DTO para perícia da origem
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
  grupoEscolha?: number; // Para perícias do tipo ESCOLHA (ex: grupo 1, grupo 2)
}

export class CreateOrigemDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Descrição deve ter no máximo 2000 caracteres' })
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

  // ✅ Perícias da origem
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrigemPericiaDto)
  pericias?: OrigemPericiaDto[];

  // ✅ Habilidades iniciais da origem
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  habilidadesIds?: number[];
}
