import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  TamanhoNpcAmeaca,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';

class NpcAmeacaPericiaEspecialDto {
  @IsString()
  @MaxLength(80)
  codigo!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  dados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  bonus?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  descricao?: string;
}

class NpcAmeacaPassivaDto {
  @IsString()
  @MaxLength(120)
  nome!: string;

  @IsString()
  @MaxLength(2000)
  descricao!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  gatilho?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  alcance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  alvo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  duracao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  requisitos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  efeitoGuia?: string;
}

class NpcAmeacaAcaoDto {
  @IsString()
  @MaxLength(120)
  nome!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tipoExecucao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  alcance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  alvo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  duracao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  resistencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  dtResistencia?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  custoPE?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  custoEA?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  teste?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  dano?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  critico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  efeito?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  requisitos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;
}

export class CreateNpcAmeacaDto {
  @IsString()
  @MaxLength(120)
  nome!: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  descricao?: string;

  @IsOptional()
  @IsEnum(TipoFichaNpcAmeaca)
  fichaTipo?: TipoFichaNpcAmeaca;

  @IsEnum(TipoNpcAmeaca)
  tipo!: TipoNpcAmeaca;

  @IsOptional()
  @IsEnum(TamanhoNpcAmeaca)
  tamanho?: TamanhoNpcAmeaca;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  vd?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-20)
  @Max(50)
  agilidade?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-20)
  @Max(50)
  forca?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-20)
  @Max(50)
  intelecto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-20)
  @Max(50)
  presenca?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-20)
  @Max(50)
  vigor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  percepcao?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  iniciativa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  fortitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  reflexos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  vontade?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  luta?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-50)
  @Max(200)
  jujutsu?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  percepcaoDados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  iniciativaDados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  fortitudeDados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  reflexosDados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  vontadeDados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  lutaDados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  jujutsuDados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(200)
  defesa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99999)
  pontosVida?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99999)
  machucado?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(500)
  deslocamentoMetros?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcAmeacaPericiaEspecialDto)
  periciasEspeciais?: NpcAmeacaPericiaEspecialDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  resistencias?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  vulnerabilidades?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcAmeacaPassivaDto)
  passivas?: NpcAmeacaPassivaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcAmeacaAcaoDto)
  acoes?: NpcAmeacaAcaoDto[];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  usoTatico?: string;
}
