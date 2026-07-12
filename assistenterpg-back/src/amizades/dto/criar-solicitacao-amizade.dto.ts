import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarSolicitacaoAmizadeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Informe email ou apelido do usuario' })
  @MaxLength(191)
  identificador?: string;

  @IsOptional()
  @IsInt({ message: 'usuarioId deve ser inteiro' })
  @Min(1, { message: 'usuarioId deve ser maior que zero' })
  usuarioId?: number;
}
