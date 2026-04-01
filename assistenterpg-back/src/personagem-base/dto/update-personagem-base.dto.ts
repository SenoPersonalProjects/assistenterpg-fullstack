// src/personagem-base/dto/update-personagem-base.dto.ts
import { AtributoBaseEA, AtributoBase } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GrauAprimoramentoDto,
  GrauTreinamentoDto,
  PoderGenericoInstanciaDto,
  HabilidadeConfigDto,
  PassivasAtributoConfigDto,
  ItemInventarioDto,
} from './create-personagem-base.dto';

export type AtributoBaseEACodigo = AtributoBaseEA;

export class UpdatePersonagemBaseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  nivel?: number;

  @IsOptional()
  @IsInt()
  claId?: number;

  @IsOptional()
  @IsInt()
  origemId?: number;

  @IsOptional()
  @IsInt()
  classeId?: number;

  @IsOptional()
  @IsInt()
  trilhaId?: number | null;

  @IsOptional()
  @IsInt()
  caminhoId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  agilidade?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  forca?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  intelecto?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  presenca?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  vigor?: number;

  @IsOptional()
  @IsBoolean()
  estudouEscolaTecnica?: boolean;

  @IsOptional()
  @IsInt()
  idade?: number | null;

  @IsOptional()
  @IsInt()
  prestigioBase?: number;

  @IsOptional()
  @IsInt()
  prestigioClaBase?: number | null;

  @IsOptional()
  @IsInt()
  alinhamentoId?: number | null;

  @IsOptional()
  @IsString()
  background?: string | null;

  @IsOptional()
  @IsEnum(AtributoBaseEA)
  atributoChaveEa?: AtributoBaseEACodigo;

  @IsOptional()
  @IsInt()
  tecnicaInataId?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proficienciasCodigos?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrauAprimoramentoDto)
  grausAprimoramento?: GrauAprimoramentoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrauTreinamentoDto)
  grausTreinamento?: GrauTreinamentoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PoderGenericoInstanciaDto)
  poderesGenericos?: PoderGenericoInstanciaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabilidadeConfigDto)
  habilidadesConfig?: HabilidadeConfigDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  passivasAtributoIds?: number[];

  @IsOptional()
  @IsArray()
  @IsEnum(AtributoBase, { each: true })
  passivasAtributosAtivos?: AtributoBase[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PassivasAtributoConfigDto)
  passivasAtributosConfig?: PassivasAtributoConfigDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  periciasClasseEscolhidasCodigos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  periciasOrigemEscolhidasCodigos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  periciasLivresCodigos?: string[];

  @IsOptional()
  @IsInt()
  periciasLivresExtras?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemInventarioDto)
  itensInventario?: ItemInventarioDto[];
}
