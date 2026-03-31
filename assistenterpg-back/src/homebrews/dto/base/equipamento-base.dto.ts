// src/homebrews/dto/equipamentos/base/equipamento-base.dto.ts

import { IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import {
  CategoriaEquipamento,
  TipoUsoEquipamento,
  TipoEquipamento,
} from '@prisma/client';

/**
 * Campos compartilhados por TODOS os equipamentos
 */
export class EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(TipoEquipamento)
  tipo: TipoEquipamento;

  @IsNotEmpty()
  @IsEnum(CategoriaEquipamento)
  categoria: CategoriaEquipamento;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  espacos: number;

  @IsOptional()
  @IsEnum(TipoUsoEquipamento)
  tipoUso?: TipoUsoEquipamento; // GERAL, VESTIVEL, CONSUMIVEL
}
