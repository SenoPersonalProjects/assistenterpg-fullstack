import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CriarSolicitacaoAmizadeDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe email ou apelido do usuário' })
  @MaxLength(191)
  identificador!: string;
}
