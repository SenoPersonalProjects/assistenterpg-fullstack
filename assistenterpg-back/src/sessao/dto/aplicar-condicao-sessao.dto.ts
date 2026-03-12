import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const DURACAO_MODOS = ['ATE_REMOVER', 'RODADAS', 'TURNOS_ALVO'] as const;

export type DuracaoCondicaoModo = (typeof DURACAO_MODOS)[number];

export class AplicarCondicaoSessaoDto {
  @IsInt()
  @Min(1)
  condicaoId!: number;

  @IsIn(['PERSONAGEM', 'NPC'])
  alvoTipo!: 'PERSONAGEM' | 'NPC';

  @ValidateIf((dto: AplicarCondicaoSessaoDto) => dto.alvoTipo === 'PERSONAGEM')
  @IsInt()
  @Min(1)
  personagemSessaoId?: number;

  @ValidateIf((dto: AplicarCondicaoSessaoDto) => dto.alvoTipo === 'NPC')
  @IsInt()
  @Min(1)
  npcSessaoId?: number;

  @IsOptional()
  @IsIn(DURACAO_MODOS)
  duracaoModo?: DuracaoCondicaoModo;

  @ValidateIf((dto: AplicarCondicaoSessaoDto) =>
    dto.duracaoModo === 'RODADAS' || dto.duracaoModo === 'TURNOS_ALVO',
  )
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim().length > 0 ? Number(value) : value,
  )
  @IsInt()
  @Min(1)
  duracaoValor?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  origemDescricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacao?: string;
}
