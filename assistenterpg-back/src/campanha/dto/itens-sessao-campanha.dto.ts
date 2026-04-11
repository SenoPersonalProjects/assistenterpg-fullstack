import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriaEquipamento, TipoItemSessaoCampanha } from '@prisma/client';

export class CriarTemplateItemSessaoCampanhaDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string | null;

  @IsEnum(TipoItemSessaoCampanha)
  tipo: TipoItemSessaoCampanha;

  @IsOptional()
  @IsEnum(CategoriaEquipamento)
  categoria?: CategoriaEquipamento;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  peso?: number;

  @IsOptional()
  @IsBoolean()
  descricaoRevelada?: boolean;
}

export class AtualizarTemplateItemSessaoCampanhaDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string | null;

  @IsOptional()
  @IsEnum(TipoItemSessaoCampanha)
  tipo?: TipoItemSessaoCampanha;

  @IsOptional()
  @IsEnum(CategoriaEquipamento)
  categoria?: CategoriaEquipamento;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  peso?: number;

  @IsOptional()
  @IsBoolean()
  descricaoRevelada?: boolean;
}

export class CriarItemSessaoCampanhaDto extends CriarTemplateItemSessaoCampanhaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sessaoId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cenaId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  personagemCampanhaId?: number | null;
}

export class AtualizarItemSessaoCampanhaDto extends AtualizarTemplateItemSessaoCampanhaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sessaoId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cenaId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  personagemCampanhaId?: number | null;
}

export class AtribuirItemSessaoCampanhaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  personagemCampanhaId?: number | null;
}

export class RevelarItemSessaoCampanhaDto {
  @IsBoolean()
  descricaoRevelada: boolean;
}
