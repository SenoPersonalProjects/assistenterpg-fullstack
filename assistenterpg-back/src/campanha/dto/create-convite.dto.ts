import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

const PAPEIS_CAMPANHA = ['MESTRE', 'JOGADOR', 'OBSERVADOR'] as const;
type PapelCampanha = (typeof PAPEIS_CAMPANHA)[number];

export class CreateConviteDto {
  @ValidateIf((dto: CreateConviteDto) => !dto.apelido && !dto.usuarioId)
  @IsEmail({}, { message: 'Email invalido para convite' })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  email?: string;

  @ValidateIf((dto: CreateConviteDto) => !dto.email && !dto.usuarioId)
  @IsString()
  @IsNotEmpty({ message: 'Apelido e obrigatorio' })
  apelido?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usuarioId?: number;

  @IsEnum(PAPEIS_CAMPANHA, {
    message: 'Papel deve ser MESTRE, JOGADOR ou OBSERVADOR',
  })
  papel: PapelCampanha;
}
