// src/homebrews/dto/equipamentos/base/equipamento-base.dto.ts

import {
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoriaEquipamento, TipoUsoEquipamento } from '@prisma/client';

/**
 * Campos compartilhados por TODOS os equipamentos
 */
export class EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(CategoriaEquipamento)
  categoria: CategoriaEquipamento;

  @IsNotEmpty()
  @IsInt()
  espacos: number;

  @IsOptional()
  @IsEnum(TipoUsoEquipamento)
  tipoUso?: TipoUsoEquipamento; // GERAL, VESTIVEL, CONSUMIVEL
}
