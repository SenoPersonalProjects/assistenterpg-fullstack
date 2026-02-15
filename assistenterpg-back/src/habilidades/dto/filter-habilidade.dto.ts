import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoHabilidade } from './create-habilidade.dto';

export class FilterHabilidadeDto {
  @IsOptional()
  @IsEnum(TipoHabilidade)
  tipo?: TipoHabilidade;

  @IsOptional()
  @IsString()
  origem?: string;

  @IsOptional()
  @IsString()
  busca?: string; // Busca por nome/descrição

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pagina?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limite?: number = 20;
}
