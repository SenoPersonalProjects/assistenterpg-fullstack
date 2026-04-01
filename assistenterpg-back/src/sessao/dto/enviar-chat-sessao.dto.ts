import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EnviarChatSessaoDto {
  @IsString({ message: 'mensagem deve ser texto' })
  @IsNotEmpty({ message: 'mensagem e obrigatoria' })
  @MaxLength(800, { message: 'mensagem deve ter no maximo 800 caracteres' })
  mensagem: string;
}
