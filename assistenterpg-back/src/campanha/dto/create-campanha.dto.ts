// src/campanha/dto/create-campanha.dto.ts
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCampanhaDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres' })
  descricao?: string;
}
