import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  NotEquals,
} from 'class-validator';
import { CAMPOS_MODIFICADOR_PERSONAGEM_CAMPANHA } from './personagem-campanha-campo-modificador.const';
import type { CampoModificadorPersonagemCampanha } from './personagem-campanha-campo-modificador.const';

export class AplicarModificadorPersonagemCampanhaDto {
  @IsEnum(CAMPOS_MODIFICADOR_PERSONAGEM_CAMPANHA, {
    message: `campo deve ser um dos valores: ${CAMPOS_MODIFICADOR_PERSONAGEM_CAMPANHA.join(', ')}`,
  })
  campo: CampoModificadorPersonagemCampanha;

  @IsInt({ message: 'valor deve ser inteiro' })
  @NotEquals(0, { message: 'valor não pode ser zero' })
  @Min(-9999, { message: 'valor deve ser maior ou igual a -9999' })
  valor: number;

  @IsString({ message: 'nome deve ser texto' })
  @IsNotEmpty({ message: 'nome é obrigatório' })
  @MaxLength(80, { message: 'nome deve ter no máximo 80 caracteres' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'descrição deve ser texto' })
  @MaxLength(500, { message: 'descrição deve ter no máximo 500 caracteres' })
  descricao?: string;

  @IsOptional()
  @IsString({ message: 'periciaCodigo deve ser texto' })
  @MaxLength(80, { message: 'periciaCodigo deve ter no mÃ¡ximo 80 caracteres' })
  periciaCodigo?: string;

  @IsOptional()
  @IsString({ message: 'tipoGrauCodigo deve ser texto' })
  @MaxLength(80, {
    message: 'tipoGrauCodigo deve ter no mÃ¡ximo 80 caracteres',
  })
  tipoGrauCodigo?: string;

  @IsOptional()
  @IsString({ message: 'atributoCodigo deve ser texto' })
  @MaxLength(32)
  atributoCodigo?: string;

  @IsOptional()
  @IsInt({ message: 'resistenciaTipoId deve ser inteiro' })
  @Min(1, { message: 'resistenciaTipoId deve ser maior ou igual a 1' })
  resistenciaTipoId?: number;

  @IsOptional()
  @IsInt({ message: 'sessaoId deve ser inteiro' })
  @Min(1, { message: 'sessaoId deve ser maior ou igual a 1' })
  sessaoId?: number;

  @IsOptional()
  @IsInt({ message: 'cenaId deve ser inteiro' })
  @Min(1, { message: 'cenaId deve ser maior ou igual a 1' })
  cenaId?: number;
}
