import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatePersonagemBaseDto } from './create-personagem-base.dto';

export class ReferenciaCatalogoDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  codigo?: string;
}

export class ReferenciaPoderGenericoDto {
  @IsInt()
  @Min(0)
  index: number;

  @IsOptional()
  @IsInt()
  habilidadeId?: number;

  @IsOptional()
  @IsString()
  habilidadeNome?: string;
}

export class ReferenciaPassivaDto {
  @IsInt()
  @Min(0)
  index: number;

  @IsOptional()
  @IsInt()
  passivaId?: number;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  nome?: string;
}

export class ReferenciaModificacaoItemDto {
  @IsInt()
  @Min(0)
  index: number;

  @IsOptional()
  @IsInt()
  modificacaoId?: number;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  nome?: string;
}

export class ReferenciaItemInventarioDto {
  @IsInt()
  @Min(0)
  index: number;

  @IsOptional()
  @IsInt()
  equipamentoId?: number;

  @IsOptional()
  @IsString()
  equipamentoCodigo?: string;

  @IsOptional()
  @IsString()
  equipamentoNome?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenciaModificacaoItemDto)
  modificacoes?: ReferenciaModificacaoItemDto[];
}

export class ReferenciasImportacaoPersonagemDto {
  @IsOptional()
  @IsInt()
  personagemIdOriginal?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenciaCatalogoDto)
  cla?: ReferenciaCatalogoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenciaCatalogoDto)
  origem?: ReferenciaCatalogoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenciaCatalogoDto)
  classe?: ReferenciaCatalogoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenciaCatalogoDto)
  trilha?: ReferenciaCatalogoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenciaCatalogoDto)
  caminho?: ReferenciaCatalogoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenciaCatalogoDto)
  alinhamento?: ReferenciaCatalogoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenciaCatalogoDto)
  tecnicaInata?: ReferenciaCatalogoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenciaPoderGenericoDto)
  poderesGenericos?: ReferenciaPoderGenericoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenciaPassivaDto)
  passivas?: ReferenciaPassivaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenciaItemInventarioDto)
  itensInventario?: ReferenciaItemInventarioDto[];
}

export class ImportarPersonagemBaseDto {
  @IsOptional()
  @IsString()
  schema?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  schemaVersion?: number;

  @IsOptional()
  @IsString()
  exportadoEm?: string;

  @IsOptional()
  @IsString()
  nomeSobrescrito?: string;

  @ValidateNested()
  @Type(() => CreatePersonagemBaseDto)
  personagem: CreatePersonagemBaseDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ReferenciasImportacaoPersonagemDto)
  referencias?: ReferenciasImportacaoPersonagemDto;
}
