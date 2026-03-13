import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EnviarChatSessaoDto {
  @IsString({ message: 'mensagem deve ser texto' })
  @IsNotEmpty({ message: 'mensagem e obrigatoria' })
  @MaxLength(100, { message: 'mensagem deve ter no maximo 100 caracteres' })
  mensagem: string;
}
