import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CriarSolicitacaoAmizadeDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe email ou apelido do usuario' })
  @MaxLength(191)
  identificador!: string;
}
