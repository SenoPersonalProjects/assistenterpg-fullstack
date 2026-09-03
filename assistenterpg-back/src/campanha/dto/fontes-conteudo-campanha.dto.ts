import { IsArray, IsInt, IsOptional } from 'class-validator';

export class FontesConteudoCampanhaDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  suplementoIds?: number[] = [];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  homebrewIds?: number[] = [];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  homebrewGrupoIds?: number[] = [];
}
