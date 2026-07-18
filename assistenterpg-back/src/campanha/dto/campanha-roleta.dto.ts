import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { CampanhaRoletaModo, CampanhaRoletaSlot } from '@prisma/client';
import { CAMPANHA_ROLETA_LIMITES } from '../campanha-roleta';

export class CampanhaRoletaFontesDto {
  @IsBoolean()
  sistemaBase: boolean;

  @IsArray()
  @ArrayMaxSize(200)
  @IsInt({ each: true })
  @Min(1, { each: true })
  suplementoIds: number[];

  @IsArray()
  @ArrayMaxSize(200)
  @IsInt({ each: true })
  @Min(1, { each: true })
  homebrewIds: number[];
}

export class CampanhaRoletaCompatibilidadeDto {
  @IsString()
  @MaxLength(120)
  tecnicaChave: string;

  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  claChaves: string[];
}

export class CampanhaRoletaConfigDto {
  @ValidateNested()
  @Type(() => CampanhaRoletaFontesDto)
  fontes: CampanhaRoletaFontesDto;

  @IsArray()
  @ArrayMaxSize(CAMPANHA_ROLETA_LIMITES.resultadosDistintos)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  exclusoes: string[];

  @IsArray()
  @ArrayMaxSize(CAMPANHA_ROLETA_LIMITES.resultadosDistintos)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  inclusoesCatalogo: string[];

  @IsString()
  @MaxLength(CAMPANHA_ROLETA_LIMITES.listaManual)
  listaManualTexto: string;

  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CampanhaRoletaCompatibilidadeDto)
  compatibilidadesHereditarias: CampanhaRoletaCompatibilidadeDto[];
}

export class PreviewCampanhaRoletaDto {
  @IsIn(['CLA', 'TECNICA', 'CUSTOMIZADO'])
  slot: CampanhaRoletaSlot;

  @IsIn(['CLA', 'TECNICA', 'SIMPLES'])
  modo: CampanhaRoletaModo;

  @ValidateNested()
  @Type(() => CampanhaRoletaConfigDto)
  config: CampanhaRoletaConfigDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  claSelecionadoChave?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  claDuplicadoChave?: string;
}

export class SalvarPresetCampanhaRoletaDto {
  @IsIn(['CLA', 'TECNICA', 'SIMPLES'])
  modo: CampanhaRoletaModo;

  @ValidateNested()
  @Type(() => CampanhaRoletaConfigDto)
  config: CampanhaRoletaConfigDto;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  revisaoEsperada: number;
}

export class SalvarPermissaoCampanhaRoletaDto {
  @IsBoolean()
  podeConfigurar: boolean;

  @IsBoolean()
  podeGirar: boolean;
}

export class IniciarSorteioCampanhaRoletaDto {
  @IsIn(['CLA', 'TECNICA', 'CUSTOMIZADO'])
  slot: CampanhaRoletaSlot;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  alvoUsuarioId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  claSelecionadoChave?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  claDuplicadoChave?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  presetRevisaoEsperada: number;

  @IsUUID('4')
  clientRequestId: string;
}

export class AcaoSorteioCampanhaRoletaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  revisaoEsperada: number;

  @IsUUID('4')
  clientRequestId: string;
}

export class EscolherSorteioCampanhaRoletaDto extends AcaoSorteioCampanhaRoletaDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  indiceEscolhido: number;
}

export class HistoricoCampanhaRoletaQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CAMPANHA_ROLETA_LIMITES.historicoMaximo)
  limite = CAMPANHA_ROLETA_LIMITES.historicoPadrao;
}
