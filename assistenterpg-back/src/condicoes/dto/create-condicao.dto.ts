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
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Descrição deve ter no mínimo 10 caracteres' })
  descricao: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Ícone deve ter no máximo 50 caracteres' })
  icone?: string;
}
