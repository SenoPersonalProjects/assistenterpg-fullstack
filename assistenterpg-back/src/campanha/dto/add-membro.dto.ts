import { IsEnum, IsInt, Min } from 'class-validator';

const PAPEIS_CAMPANHA = ['MESTRE', 'JOGADOR', 'OBSERVADOR'] as const;
type PapelCampanha = (typeof PAPEIS_CAMPANHA)[number];

export class AddMembroDto {
  @IsInt({ message: 'usuarioId deve ser inteiro' })
  @Min(1, { message: 'usuarioId deve ser maior que zero' })
  usuarioId: number;

  @IsEnum(PAPEIS_CAMPANHA, {
    message: 'Papel deve ser MESTRE, JOGADOR ou OBSERVADOR',
  })
  papel: PapelCampanha;
}
