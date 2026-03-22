// src/inventario/dto/preview-itens-inventario.dto.ts

import {
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPreviewDto {
  @IsInt()
  equipamentoId: number;

  @IsInt()
  quantidade: number;

  @IsBoolean()
  equipado: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  modificacoes?: number[];

  // ✅ CORRIGIDO: Aceitar null
  @IsOptional()
  @IsString()
  nomeCustomizado?: string | null;
}

export class PreviewItensInventarioDto {
  @IsInt()
  forca: number;

  @IsOptional()
  @IsInt()
  intelecto?: number;

  @IsOptional()
  @IsBoolean()
  somarIntelecto?: boolean;

  @IsInt()
  prestigioBase: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPreviewDto)
  itens: ItemPreviewDto[];
}
