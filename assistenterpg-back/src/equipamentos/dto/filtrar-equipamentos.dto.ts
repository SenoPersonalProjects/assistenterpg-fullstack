// src/inventario/dto/filtrar-equipamentos.dto.ts
import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  TipoEquipamento,
  ComplexidadeMaldicao,
  ProficienciaArma,
  ProficienciaProtecao,
  AlcanceArma,
  TipoAcessorio,
  TipoFonte,
} from '@prisma/client';

const parseBooleanQueryValue = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return value;
};

export class FiltrarEquipamentosDto {
  /**
   * Tipo de equipamento (ARMA, PROTECAO, ACESSORIO, etc)
   */
  @IsOptional()
  @IsEnum(TipoEquipamento)
  tipo?: TipoEquipamento;

  @IsOptional()
  @IsArray()
  @IsEnum(TipoFonte, { each: true })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') return value.split(',');
    return value;
  })
  fontes?: TipoFonte[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  suplementoId?: number;

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
  @Transform(parseBooleanQueryValue)
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
