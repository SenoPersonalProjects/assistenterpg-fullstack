import { IsNotEmpty, IsInt, IsArray, IsOptional } from 'class-validator';

export type HomebrewTrilhaHabilidadeDto = {
  nivel: number;
  [key: string]: unknown;
};

export class HomebrewTrilhaDto {
  @IsNotEmpty()
  @IsInt()
  classeId: number;

  @IsOptional()
  @IsInt()
  nivelRequisito?: number;

  @IsNotEmpty()
  @IsArray()
  habilidades: HomebrewTrilhaHabilidadeDto[];
}
