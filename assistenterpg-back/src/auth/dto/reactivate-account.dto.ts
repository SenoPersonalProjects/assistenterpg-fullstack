import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ReactivateAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}
