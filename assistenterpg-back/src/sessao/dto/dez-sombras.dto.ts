import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsArray,
  ArrayMaxSize,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export const ACOES_DEZ_SOMBRAS = [
  'INVOCAR',
  'LIBERAR',
  'COMANDAR',
  'MOVER',
  'USAR',
  'ASPECTO',
  'ENCERRAR_ASPECTO',
  'COMBO',
  'SINERGIA',
  'AMPLIAR',
  'RESSUSCITAR',
  'ECO',
  'CLONE',
  'ACERTO',
  'RITUAL',
  'CONCLUIR_RITUAL',
  'HERANCA',
  'ADAPTACAO',
  'DEFINIR_ASPECTO',
  'VINCULO_OROCHI',
  'APLICAR_CONDICAO',
  'ENCERRAR_VENENO',
  'FLOR_DEFESA',
  'MOVIMENTO_USUARIO',
  'PREPARAR_ASPECTOS',
] as const;
export class AcaoDezSombrasDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(125, { each: true })
  aspectos?: string[];
  @IsOptional() @IsInt() @Min(1) @Max(3) gastoEA?: number;
  @IsUUID('4') clientRequestId!: string;
  @IsIn(ACOES_DEZ_SOMBRAS) acao!: (typeof ACOES_DEZ_SOMBRAS)[number];
  @IsString() @MaxLength(60) sombra!: string;
  @IsOptional() @IsString() @MaxLength(60) habilidade?: string;
  @IsOptional() @IsString() @MaxLength(60) destino?: string;
  @IsOptional() @IsBoolean() sustentado?: boolean;
  @IsOptional() @IsBoolean() ritualSemAjuda?: boolean;
  @IsOptional() @IsString() @MaxLength(500) observacao?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  alvoPersonagemSessaoId?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) alvoNpcSessaoId?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  complexidade?: number;
}
