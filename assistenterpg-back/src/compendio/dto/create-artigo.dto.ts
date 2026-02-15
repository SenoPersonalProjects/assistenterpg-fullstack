// src/compendio/dto/create-artigo.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateArtigoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  titulo: string;

  @IsOptional()
  @IsString()
  resumo?: string;

  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @IsInt()
  @IsNotEmpty()
  subcategoriaId: number;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  palavrasChave?: string;

  @IsOptional()
  @IsIn(['iniciante', 'intermediario', 'avancado'])
  nivelDificuldade?: 'iniciante' | 'intermediario' | 'avancado';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  artigosRelacionados?: string[];

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsBoolean()
  destaque?: boolean;
}
