import { IsInt, IsOptional, Min } from 'class-validator';

export class UsarHabilidadeSessaoDto {
  @IsInt()
  @Min(1)
  habilidadeTecnicaId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  variacaoHabilidadeId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  acumulos?: number;
}
