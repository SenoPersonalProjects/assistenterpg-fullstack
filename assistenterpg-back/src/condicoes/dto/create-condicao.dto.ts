// src/condicoes/dto/create-condicao.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
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
  descricao: string; // ✅ Obrigatório no schema
}
