import { IsInt, IsOptional, Min } from 'class-validator';

export class AtualizarRecursosPersonagemSessaoDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  pvAtual?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  peAtual?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  eaAtual?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sanAtual?: number;
}
