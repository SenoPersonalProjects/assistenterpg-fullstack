// src/condicoes/dto/create-condicao.dto.ts

import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateCondicaoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no minimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no maximo 100 caracteres' })
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Descricao deve ter no minimo 10 caracteres' })
  descricao: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Icone deve ter no maximo 50 caracteres' })
  icone?: string;
}
