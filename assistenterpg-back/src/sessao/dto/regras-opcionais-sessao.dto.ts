import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const REGRAS_OPCIONAIS_SESSAO = [
  'INSPIRACAO',
  'ENCONTROS_SOCIAIS',
  'ESCALADA_DADOS',
] as const;

export type RegraOpcionalSessaoChave = (typeof REGRAS_OPCIONAIS_SESSAO)[number];

export class AtualizarRegraOpcionalSessaoDto {
  @IsIn(REGRAS_OPCIONAIS_SESSAO, {
    message: `chave deve ser uma das regras: ${REGRAS_OPCIONAIS_SESSAO.join(', ')}`,
  })
  chave: RegraOpcionalSessaoChave;

  @IsBoolean({ message: 'ativo deve ser booleano' })
  ativo: boolean;

  @IsOptional()
  @IsObject({ message: 'config deve ser um objeto' })
  config?: Record<string, unknown>;
}

export class AjustarInspiracaoSessaoDto {
  @IsInt({ message: 'delta deve ser inteiro' })
  @Min(-3, { message: 'delta minimo e -3' })
  @Max(3, { message: 'delta maximo e 3' })
  delta: number;
}

export class GastarInspiracaoSessaoDto {
  @IsInt({ message: 'custo deve ser inteiro' })
  @Min(1, { message: 'custo minimo e 1' })
  @Max(3, { message: 'custo maximo e 3' })
  custo: number;

  @IsIn(['BONUS_5', 'MAXIMIZAR', 'CRITICO'], {
    message: 'efeito deve ser BONUS_5, MAXIMIZAR ou CRITICO',
  })
  efeito: 'BONUS_5' | 'MAXIMIZAR' | 'CRITICO';
}

export class MotivacaoSocialSessaoDto {
  @IsString({ message: 'texto da motivacao deve ser texto' })
  @IsNotEmpty({ message: 'texto da motivacao e obrigatorio' })
  @MaxLength(160, { message: 'motivacao deve ter no maximo 160 caracteres' })
  texto: string;

  @IsOptional()
  @IsBoolean({ message: 'revelada deve ser booleano' })
  revelada?: boolean;
}

export class AlvoSocialSessaoDto {
  @IsOptional()
  @IsInt({ message: 'npcSessaoId deve ser inteiro' })
  @Min(1, { message: 'npcSessaoId deve ser positivo' })
  npcSessaoId?: number;

  @IsString({ message: 'nome deve ser texto' })
  @IsNotEmpty({ message: 'nome e obrigatorio' })
  @MaxLength(80, { message: 'nome deve ter no maximo 80 caracteres' })
  nome: string;

  @IsInt({ message: 'interesseAtual deve ser inteiro' })
  @Min(0, { message: 'interesseAtual minimo e 0' })
  @Max(4, { message: 'interesseAtual maximo e 4' })
  interesseAtual: number;

  @IsInt({ message: 'interesseAlvo deve ser inteiro' })
  @Min(1, { message: 'interesseAlvo minimo e 1' })
  @Max(5, { message: 'interesseAlvo maximo e 5' })
  interesseAlvo: number;

  @IsInt({ message: 'pacienciaAtual deve ser inteiro' })
  @Min(0, { message: 'pacienciaAtual minimo e 0' })
  @Max(5, { message: 'pacienciaAtual maximo e 5' })
  pacienciaAtual: number;

  @IsOptional()
  @IsArray({ message: 'motivacoes deve ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => MotivacaoSocialSessaoDto)
  motivacoes?: MotivacaoSocialSessaoDto[];
}

export class AtualizarEncontroSocialSessaoDto {
  @IsArray({ message: 'alvos deve ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => AlvoSocialSessaoDto)
  alvos: AlvoSocialSessaoDto[];
}

export class AtualizarEscaladaDadosSessaoDto {
  @IsBoolean({ message: 'ativaNesteCombate deve ser booleano' })
  ativaNesteCombate: boolean;

  @IsOptional()
  @IsInt({ message: 'rodadaInicio deve ser inteiro' })
  @Min(1, { message: 'rodadaInicio deve ser positiva' })
  rodadaInicio?: number;
}
