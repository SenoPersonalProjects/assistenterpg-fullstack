import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProficienciaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descricao?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  categoria: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  subtipo?: string | null;
}
