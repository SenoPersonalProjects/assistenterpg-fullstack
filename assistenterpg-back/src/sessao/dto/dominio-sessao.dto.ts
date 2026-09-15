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
  Min,
} from 'class-validator';

const TIPOS_DOMINIO = ['FECHADO', 'ABERTO'] as const;
const ACOES_DOMINIO = [
  'FORMAR',
  'INTERROMPER',
  'REFINAR',
  'FORCAR',
  'PRESSIONAR',
  'ESTABILIZAR',
  'REFORCAR',
  'RECONFIGURAR',
  'DESFAZER',
  'REGISTRAR_RUPTURA',
  'ATRAVESSAR',
] as const;
const TIPOS_DEFESA = ['CESTA_OCA', 'DOMINIO_SIMPLES', 'AMPLIFICACAO'] as const;

export class CriarDominioNpcSessaoDto {
  @IsUUID('4')
  clientRequestId!: string;

  @IsInt()
  @Min(1)
  npcSessaoId!: number;

  @IsString()
  nome!: string;

  @IsOptional()
  @IsString()
  descricaoAcertoGarantido?: string;

  @IsIn(TIPOS_DOMINIO)
  tipo!: (typeof TIPOS_DOMINIO)[number];

  @IsInt()
  @Min(2)
  @Max(5)
  grauBarreira!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  investimentoIntegridade?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoEA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoPE?: number;

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
}

export class AcaoDominioSessaoDto {
  @IsUUID('4')
  clientRequestId!: string;

  @IsIn(ACOES_DOMINIO)
  acao!: (typeof ACOES_DOMINIO)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  dominioAlvoId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  resultadoAtaque?: number;

  @IsOptional()
  @IsIn(['NORMAL', 'POTENCIALIZADO', 'EXCEPCIONAL'])
  potenciaRuptura?: 'NORMAL' | 'POTENCIALIZADO' | 'EXCEPCIONAL';

  @IsOptional()
  @IsBoolean()
  golpeConcentrado?: boolean;

  @IsOptional()
  @IsIn(['ENTRAR', 'SAIR'])
  direcaoTravessia?: 'ENTRAR' | 'SAIR';

  @IsOptional()
  @IsInt()
  @Min(1)
  resultadoTravessia?: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class CriarDisputaDominioSessaoDto {
  @IsUUID('4')
  clientRequestId!: string;

  @IsArray()
  @ArrayMaxSize(12)
  @IsInt({ each: true })
  @Min(1, { each: true })
  dominioIds!: number[];

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
}

export class ResolverDisputaDominioSessaoDto {
  @IsUUID('4')
  clientRequestId!: string;
}

export class CriarDefesaAntiDominioSessaoDto {
  @IsUUID('4')
  clientRequestId!: string;

  @IsIn(TIPOS_DEFESA)
  tipo!: (typeof TIPOS_DEFESA)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  personagemSessaoId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  npcSessaoId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoEA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  custoPE?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  grauAntiBarreira?: number;

  @IsOptional()
  @IsBoolean()
  pesEnraizados?: boolean;

  @IsOptional()
  @IsString()
  variacao?: string;
}

export class DormirInterludioSessaoDto {
  @IsUUID('4')
  clientRequestId!: string;
}
