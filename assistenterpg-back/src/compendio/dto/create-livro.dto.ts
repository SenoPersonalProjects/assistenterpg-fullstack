import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusPublicacao } from '@prisma/client';

export class CreateLivroDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  codigo?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cor?: string;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsEnum(StatusPublicacao)
  status?: StatusPublicacao;

  @IsOptional()
  @IsInt()
  suplementoId?: number;
}
