import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessaoCampanhaDto {
  @IsOptional()
  @IsString({ message: 'titulo deve ser texto' })
  @MaxLength(120, { message: 'título deve ter no máximo 120 caracteres' })
  titulo?: string;
}
