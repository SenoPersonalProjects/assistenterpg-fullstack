import { IsInt, IsOptional, Min } from 'class-validator';

export class AtualizarRecursosPersonagemCampanhaDto {
  @IsOptional()
  @IsInt({ message: 'pvAtual deve ser inteiro' })
  @Min(0, { message: 'pvAtual não pode ser negativo' })
  pvAtual?: number;

  @IsOptional()
  @IsInt({ message: 'peAtual deve ser inteiro' })
  @Min(0, { message: 'peAtual não pode ser negativo' })
  peAtual?: number;

  @IsOptional()
  @IsInt({ message: 'eaAtual deve ser inteiro' })
  @Min(0, { message: 'eaAtual não pode ser negativo' })
  eaAtual?: number;

  @IsOptional()
  @IsInt({ message: 'sanAtual deve ser inteiro' })
  @Min(0, { message: 'sanAtual não pode ser negativo' })
  sanAtual?: number;
}
