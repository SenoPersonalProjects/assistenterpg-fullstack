// src/compendio/dto/create-subcategoria.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateSubcategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsInt()
  @IsNotEmpty()
  categoriaId: number;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
