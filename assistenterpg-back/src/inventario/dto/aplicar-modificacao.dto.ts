// src/inventario/dto/aplicar-modificacao.dto.ts
import { IsInt } from 'class-validator';

export class AplicarModificacaoDto {
  @IsInt()
  itemId: number;

  @IsInt()
  modificacaoId: number;
}
