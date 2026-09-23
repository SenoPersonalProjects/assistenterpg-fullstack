import {
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const TIPOS_AJUSTE_RITUALISTICO = ['ADICAO', 'SUBTRACAO'] as const;
const EFEITOS_AJUSTE_RITUALISTICO = [
  'REDUZIR_EFEITO',
  'REDUZIR_ALCANCE',
  'REDUZIR_AREA',
  'REDUZIR_DT',
  'PENALIDADE_TESTE',
  'CUSTO_EA',
  'PERDER_EFEITO_SECUNDARIO',
  'MELHORAR_ACAO',
  'AUMENTAR_ALCANCE',
  'AUMENTAR_DT',
  'BONUS_TESTE',
  'AUMENTAR_EFEITO',
] as const;

export class AjusteRitualisticoSessaoDto {
  @IsIn(TIPOS_AJUSTE_RITUALISTICO)
  tipo: (typeof TIPOS_AJUSTE_RITUALISTICO)[number];

  @IsIn(EFEITOS_AJUSTE_RITUALISTICO)
  efeito: (typeof EFEITOS_AJUSTE_RITUALISTICO)[number];

  @IsInt()
  @Min(1)
  pontos: number;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class UsarHabilidadeSessaoDto {
  @IsOptional()
  @IsUUID('4')
  clientRequestId?: string;

  @IsInt()
  @Min(1)
  habilidadeTecnicaId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  variacaoHabilidadeId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  acumulos?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  gastoPE?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  condicaoSessaoId?: number;

  @IsOptional()
  @IsBoolean()
  ignorarSobrecarga?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  investimentoIntegridade?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  alvosPersonagemSessaoIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  alvosNpcSessaoIds?: number[];

  @IsOptional()
  @IsBoolean()
  expansaoReativa?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => AjusteRitualisticoSessaoDto)
  ajustesRitualisticos?: AjusteRitualisticoSessaoDto[];
}
