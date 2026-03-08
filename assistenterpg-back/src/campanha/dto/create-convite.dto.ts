import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

const PAPEIS_CAMPANHA = ['MESTRE', 'JOGADOR', 'OBSERVADOR'] as const;
type PapelCampanha = (typeof PAPEIS_CAMPANHA)[number];

export class CreateConviteDto {
  @IsEmail({}, { message: 'Email invalido para convite' })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  email: string;

  @IsEnum(PAPEIS_CAMPANHA, {
    message: 'Papel deve ser MESTRE, JOGADOR ou OBSERVADOR',
  })
  papel: PapelCampanha;
}
