import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EnviarChatSessaoDto {
  @IsString({ message: 'mensagem deve ser texto' })
  @IsNotEmpty({ message: 'mensagem e obrigatoria' })
  @MaxLength(1000, { message: 'mensagem deve ter no maximo 1000 caracteres' })
  mensagem: string;
}
