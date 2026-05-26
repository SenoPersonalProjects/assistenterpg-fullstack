import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EnviarChatSessaoDto {
  @IsString({ message: 'mensagem deve ser texto' })
  @IsNotEmpty({ message: 'mensagem é obrigatória' })
  @MaxLength(800, { message: 'mensagem deve ter no máximo 800 caracteres' })
  mensagem: string;
}
