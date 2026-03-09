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
  @NotEquals(0, { message: 'valor nao pode ser zero' })
  @Min(-9999, { message: 'valor deve ser maior ou igual a -9999' })
  valor: number;

  @IsString({ message: 'nome deve ser texto' })
  @IsNotEmpty({ message: 'nome e obrigatorio' })
  @MaxLength(80, { message: 'nome deve ter no maximo 80 caracteres' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'descricao deve ser texto' })
  @MaxLength(500, { message: 'descricao deve ter no maximo 500 caracteres' })
  descricao?: string;
}
