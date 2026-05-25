import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EnviarMensagemAmigoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  conteudo: string;
}
