import { IsInt, IsOptional, Min } from 'class-validator';

export class AtualizarRecursosPersonagemCampanhaDto {
  @IsOptional()
  @IsInt({ message: 'pvAtual deve ser inteiro' })
  @Min(0, { message: 'pvAtual nao pode ser negativo' })
  pvAtual?: number;

  @IsOptional()
  @IsInt({ message: 'peAtual deve ser inteiro' })
  @Min(0, { message: 'peAtual nao pode ser negativo' })
  peAtual?: number;

  @IsOptional()
  @IsInt({ message: 'eaAtual deve ser inteiro' })
  @Min(0, { message: 'eaAtual nao pode ser negativo' })
  eaAtual?: number;

  @IsOptional()
  @IsInt({ message: 'sanAtual deve ser inteiro' })
  @Min(0, { message: 'sanAtual nao pode ser negativo' })
  sanAtual?: number;
}
