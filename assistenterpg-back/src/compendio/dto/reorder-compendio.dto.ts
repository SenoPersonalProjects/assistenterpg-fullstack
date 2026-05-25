import { ArrayNotEmpty, IsArray, IsIn, IsInt } from 'class-validator';

export class ReorderCompendioDto {
  @IsIn(['livro', 'categoria', 'subcategoria', 'artigo'])
  tipo: 'livro' | 'categoria' | 'subcategoria' | 'artigo';

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
