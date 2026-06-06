import { IsNotEmpty, IsString } from 'class-validator';

export class DesativarContaDto {
  @IsString()
  @IsNotEmpty()
  senhaAtual: string;
}
