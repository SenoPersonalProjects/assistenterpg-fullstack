// src/inventario/dto/remover-modificacao.dto.ts
import { IsInt } from 'class-validator';

export class RemoverModificacaoDto {
  @IsInt()
  itemId: number;

  @IsInt()
  modificacaoId: number;
}
