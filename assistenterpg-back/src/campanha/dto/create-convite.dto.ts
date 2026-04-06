import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

const PAPEIS_CAMPANHA = ['MESTRE', 'JOGADOR', 'OBSERVADOR'] as const;
type PapelCampanha = (typeof PAPEIS_CAMPANHA)[number];

export class CreateConviteDto {
  @ValidateIf((dto: CreateConviteDto) => !dto.apelido)
  @IsEmail({}, { message: 'Email invalido para convite' })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  email?: string;

  @ValidateIf((dto: CreateConviteDto) => !dto.email)
  @IsString()
  @IsNotEmpty({ message: 'Apelido e obrigatorio' })
  apelido?: string;

  @IsEnum(PAPEIS_CAMPANHA, {
    message: 'Papel deve ser MESTRE, JOGADOR ou OBSERVADOR',
  })
  papel: PapelCampanha;
}
