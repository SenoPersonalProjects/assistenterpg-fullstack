import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UsarHabilidadeSessaoDto {
  @IsOptional()
  @IsUUID('4')
  clientRequestId?: string;

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
