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
  'INICIATIVA_ALTERNADA',
  'CONSUMIR_COM_CALMA',
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
  @Max(5, { message: 'interesseAtual maximo e 5' })
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

  @IsOptional()
  @IsInt({ message: 'bonusAtual deve ser inteiro' })
  @Min(0, { message: 'bonusAtual minimo e 0' })
  @Max(6, { message: 'bonusAtual maximo e 6' })
  bonusAtual?: number;
}

export class ParticipanteLadoIniciativaAlternadaDto {
  @IsString({ message: 'participanteToken deve ser texto' })
  @IsNotEmpty({ message: 'participanteToken e obrigatorio' })
  @MaxLength(80, {
    message: 'participanteToken deve ter no maximo 80 caracteres',
  })
  participanteToken: string;
}

export class LadoIniciativaAlternadaDto {
  @IsOptional()
  @IsInt({ message: 'id do lado deve ser inteiro' })
  @Min(1, { message: 'id do lado deve ser positivo' })
  id?: number;

  @IsString({ message: 'nome do lado deve ser texto' })
  @IsNotEmpty({ message: 'nome do lado e obrigatorio' })
  @MaxLength(40, { message: 'nome do lado deve ter no maximo 40 caracteres' })
  nome: string;

  @IsOptional()
  @IsInt({ message: 'ordem do lado deve ser inteiro' })
  @Min(0, { message: 'ordem do lado deve ser positiva' })
  ordem?: number;

  @IsArray({ message: 'participantes deve ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => ParticipanteLadoIniciativaAlternadaDto)
  participantes: ParticipanteLadoIniciativaAlternadaDto[];
}

export class AtualizarIniciativaAlternadaSessaoDto {
  @IsArray({ message: 'lados deve ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => LadoIniciativaAlternadaDto)
  lados: LadoIniciativaAlternadaDto[];

  @IsOptional()
  @IsInt({ message: 'ladoAtualId deve ser inteiro' })
  @Min(1, { message: 'ladoAtualId deve ser positivo' })
  ladoAtualId?: number;
}

export class MarcarParticipanteIniciativaAlternadaDto {
  @IsString({ message: 'participanteToken deve ser texto' })
  @IsNotEmpty({ message: 'participanteToken e obrigatorio' })
  @MaxLength(80, {
    message: 'participanteToken deve ter no maximo 80 caracteres',
  })
  participanteToken: string;

  @IsBoolean({ message: 'jaAgiu deve ser booleano' })
  jaAgiu: boolean;
}

export class ConsumirItemSessaoDto {
  @IsInt({ message: 'itemInventarioCampanhaId deve ser inteiro' })
  @Min(1, { message: 'itemInventarioCampanhaId deve ser positivo' })
  itemInventarioCampanhaId: number;

  @IsIn(['NORMAL', 'COM_CALMA', 'MANUAL'], {
    message: 'modo deve ser NORMAL, COM_CALMA ou MANUAL',
  })
  modo: 'NORMAL' | 'COM_CALMA' | 'MANUAL';

  @IsOptional()
  @IsIn(['PERSONAGEM', 'NPC'], {
    message: 'alvoTipo deve ser PERSONAGEM ou NPC',
  })
  alvoTipo?: 'PERSONAGEM' | 'NPC';

  @IsOptional()
  @IsInt({ message: 'alvoId deve ser inteiro' })
  @Min(1, { message: 'alvoId deve ser positivo' })
  alvoId?: number;

  @IsOptional()
  @IsString({ message: 'observacao deve ser texto' })
  @MaxLength(240, { message: 'observacao deve ter no maximo 240 caracteres' })
  observacao?: string;
}
