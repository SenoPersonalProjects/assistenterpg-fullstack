// src/personagem-base/dto/create-personagem-base.dto.ts
import { AtributoBaseEA, AtributoBase } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export type AtributoBaseCodigo = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';

/**
 * Alinhado ao enum do Prisma:
 * enum AtributoBaseEA { INT, PRE }
 */
export type AtributoBaseEACodigo = AtributoBaseEA;

export class GrauAprimoramentoDto {
  @IsString()
  @IsNotEmpty()
  tipoGrauCodigo: string;

  @IsInt()
  valor: number;
}

// ✅ NOVOS DTOs PARA GRAU DE TREINAMENTO
export class MelhoriaTreinamentoDto {
  @IsString()
  @IsNotEmpty()
  periciaCodigo: string;

  @IsInt()
  @IsIn([0, 5, 10, 15])
  grauAnterior: number;

  @IsInt()
  @IsIn([5, 10, 15, 20])
  grauNovo: number;
}

export class GrauTreinamentoDto {
  @IsInt()
  @IsIn([3, 7, 11, 16])
  nivel: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MelhoriaTreinamentoDto)
  melhorias: MelhoriaTreinamentoDto[];
}

export class PoderGenericoInstanciaDto {
  @IsInt()
  habilidadeId: number;

  @IsOptional()
  config?: any; // depois a gente tipa por poder
}

export class PassivaIntelectoConfigDto {
  // Perícias extras (Intelecto I: 0–1, Intelecto II: 0–2 no total)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  periciasCodigos?: string[];

  // Proficiências extras (Intelecto I: 0–1, Intelecto II: 0–2 no total)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proficienciasCodigos?: string[];

  // Aumentar treinamento de 1 perícia (I e II)
  @IsOptional()
  @IsString()
  periciaCodigoTreino?: string;

  // 1 grau de aprimoramento (apenas Intelecto II)
  @IsOptional()
  @IsString()
  tipoGrauCodigoAprimoramento?: string;
}

export class PassivasAtributoConfigDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PassivaIntelectoConfigDto)
  INT_I?: PassivaIntelectoConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PassivaIntelectoConfigDto)
  INT_II?: PassivaIntelectoConfigDto;
}

export class ItemInventarioDto {
  @IsInt()
  @IsNotEmpty()
  equipamentoId: number;

  @IsInt()
  @Min(1)
  @Max(99)
  quantidade: number;

  @IsOptional()
  @IsBoolean()
  equipado?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  modificacoesIds?: number[];

  @IsOptional()
  @IsString()
  nomeCustomizado?: string | null;

  @IsOptional()
  @IsString()
  notas?: string | null;
}

export class CreatePersonagemBaseDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsInt()
  @Min(1)
  nivel: number;

  @IsInt()
  claId: number;

  @IsInt()
  origemId: number;

  @IsInt()
  classeId: number;

  @IsOptional()
  @IsInt()
  trilhaId?: number | null;

  @IsOptional()
  @IsInt()
  caminhoId?: number | null;

  @IsInt()
  @Min(0)
  @Max(7)
  agilidade: number;

  @IsInt()
  @Min(0)
  @Max(7)
  forca: number;

  @IsInt()
  @Min(0)
  @Max(7)
  intelecto: number;

  @IsInt()
  @Min(0)
  @Max(7)
  presenca: number;

  @IsInt()
  @Min(0)
  @Max(7)
  vigor: number;

  @IsBoolean()
  estudouEscolaTecnica: boolean;

  // meta
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

  @IsEnum(AtributoBaseEA)
  atributoChaveEa: AtributoBaseEACodigo;

  @IsOptional()
  @IsInt()
  tecnicaInataId?: number | null;

  // proficiências extras (além das da classe)
  @IsArray()
  @IsString({ each: true })
  proficienciasCodigos: string[] = [];

  // graus (payload do usuário)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrauAprimoramentoDto)
  grausAprimoramento: GrauAprimoramentoDto[] = [];

  // ✅ NOVO: Graus de treinamento
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrauTreinamentoDto)
  grausTreinamento?: GrauTreinamentoDto[];

  // ✅ NOVO: Poderes genéricos selecionados
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PoderGenericoInstanciaDto)
  poderesGenericos?: PoderGenericoInstanciaDto[];

  // ✅ NOVO: Passivas de atributos selecionadas
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

  // escolhas (lista final)
  @IsArray()
  @IsString({ each: true })
  periciasClasseEscolhidasCodigos: string[] = [];

  @IsArray()
  @IsString({ each: true })
  periciasOrigemEscolhidasCodigos: string[] = [];

  @IsArray()
  @IsString({ each: true })
  periciasLivresCodigos: string[] = [];

  @IsOptional()
  @IsInt()
  periciasLivresExtras?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemInventarioDto)
  itensInventario?: ItemInventarioDto[];
}
