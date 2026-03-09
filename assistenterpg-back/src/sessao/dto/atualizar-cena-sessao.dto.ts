import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

const TIPOS_CENA = [
  'LIVRE',
  'INVESTIGACAO',
  'FURTIVIDADE',
  'COMBATE',
  'OUTRA',
] as const;

export type TipoCenaSessao = (typeof TIPOS_CENA)[number];

export class AtualizarCenaSessaoDto {
  @IsEnum(TIPOS_CENA, {
    message: `tipo deve ser um dos valores: ${TIPOS_CENA.join(', ')}`,
  })
  tipo: TipoCenaSessao;

  @IsOptional()
  @IsString({ message: 'nome deve ser texto' })
  @MaxLength(120, { message: 'nome deve ter no maximo 120 caracteres' })
  nome?: string;
}
