import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AlterarEmailDto {
  @IsEmail()
  novoEmail: string;

  @IsString()
  @IsNotEmpty()
  senhaAtual: string;
}
