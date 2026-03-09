import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessaoCampanhaDto {
  @IsOptional()
  @IsString({ message: 'titulo deve ser texto' })
  @MaxLength(120, { message: 'titulo deve ter no maximo 120 caracteres' })
  titulo?: string;
}
