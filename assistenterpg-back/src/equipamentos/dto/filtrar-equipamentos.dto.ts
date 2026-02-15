// src/inventario/dto/filtrar-equipamentos.dto.ts
import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoEquipamento,
  ComplexidadeMaldicao,
  ProficienciaArma,
  ProficienciaProtecao,
  AlcanceArma,
  TipoAcessorio,
} from '@prisma/client';

export class FiltrarEquipamentosDto {
  /**
   * Tipo de equipamento (ARMA, PROTECAO, ACESSORIO, etc)
   */
  @IsOptional()
  @IsEnum(TipoEquipamento)
  tipo?: TipoEquipamento;

  /**
   * Complexidade da maldição (NENHUMA, SIMPLES, COMPLEXA)
   */
  @IsOptional()
  @IsEnum(ComplexidadeMaldicao)
  complexidadeMaldicao?: ComplexidadeMaldicao;

  /**
   * Proficiência requerida para armas (SIMPLES, TATICA, PESADA)
   */
  @IsOptional()
  @IsEnum(ProficienciaArma)
  proficienciaArma?: ProficienciaArma;

  /**
   * Proficiência requerida para proteção (LEVE, PESADA, ESCUDO)
   */
  @IsOptional()
  @IsEnum(ProficienciaProtecao)
  proficienciaProtecao?: ProficienciaProtecao;

  /**
   * Alcance da arma (ADJACENTE, CURTO, MEDIO, LONGO, EXTREMO)
   */
  @IsOptional()
  @IsEnum(AlcanceArma)
  alcance?: AlcanceArma;

  /**
   * Tipo de acessório (KIT_PERICIA, UTENSILIO, VESTIMENTA)
   */
  @IsOptional()
  @IsEnum(TipoAcessorio)
  tipoAcessorio?: TipoAcessorio;

  /**
   * Categoria do equipamento (0-4, ESPECIAL)
   * Valor de 0 a 4 apenas
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  @Type(() => Number)
  categoria?: number;

  /**
   * Filtrar apenas equipamentos amaldiçoados
   * Retorna ITEM_AMALDICOADO, FERRAMENTA_AMALDICOADA e complexidade != NENHUMA
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  apenasAmaldicoados?: boolean;

  /**
   * Busca textual por nome, descrição ou código
   * Case-insensitive
   */
  @IsOptional()
  @IsString()
  busca?: string;

  /**
   * Número da página (mínimo 1)
   * Padrão: 1
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pagina?: number = 1;

  /**
   * Itens por página (1-100)
   * Padrão: 20
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limite?: number = 20;
}