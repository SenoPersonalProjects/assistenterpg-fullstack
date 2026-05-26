import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResolverUsuarioAmizadeDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe email ou apelido do usuário' })
  @MaxLength(191)
  identificador!: string;
}
