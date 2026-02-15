// src/homebrews/dto/tecnicas/shared-tecnica.dto.ts

import { IsNotEmpty, IsInt, IsString, IsEnum } from 'class-validator';
import { TipoDano } from '@prisma/client';

/**
 * Dados de dano (parte do dadosDano JSON)
 * Compartilhado entre HabilidadeTecnicaDto e VariacaoHabilidadeDto
 */
export class DadoDanoDto {
  @IsNotEmpty()
  @IsInt()
  quantidade: number; // Ex: 1, 2

  @IsNotEmpty()
  @IsString()
  dado: string; // Ex: "d4", "d6", "d8"

  @IsNotEmpty()
  @IsEnum(TipoDano)
  tipo: TipoDano; // CORTANTE, IMPACTO, PERFURANTE, etc.
}

/**
 * Escalonamento de dano
 * Compartilhado entre HabilidadeTecnicaDto e VariacaoHabilidadeDto
 */
export class EscalonamentoDanoDto {
  @IsNotEmpty()
  @IsInt()
  quantidade: number;

  @IsNotEmpty()
  @IsString()
  dado: string;

  @IsNotEmpty()
  @IsEnum(TipoDano)
  tipo: TipoDano;
}
