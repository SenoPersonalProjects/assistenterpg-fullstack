// src/inventario/dto/preview-itens-inventario.dto.ts

import {
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsString,
  IsObject,
  ValidateIf,
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

  @IsOptional()
  @IsObject()
  estado?: Record<string, unknown> | null;
}

export class PreviewItensInventarioDto {
  @IsOptional()
  @IsInt()
  personagemBaseId?: number;

  @ValidateIf(
    (dto: PreviewItensInventarioDto) => dto.personagemBaseId === undefined,
  )
  @IsInt()
  forca?: number;

  @IsOptional()
  @IsInt()
  intelecto?: number;

  @IsOptional()
  @IsBoolean()
  somarIntelecto?: boolean;

  @IsOptional()
  @IsBoolean()
  reduzirItensLeves?: boolean;

  @IsOptional()
  @IsInt()
  reduzirCategoriaEm?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reduzirCategoriaExcetoTipos?: string[];

  @ValidateIf(
    (dto: PreviewItensInventarioDto) => dto.personagemBaseId === undefined,
  )
  @IsInt()
  prestigioBase?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPreviewDto)
  itens: ItemPreviewDto[];
}
