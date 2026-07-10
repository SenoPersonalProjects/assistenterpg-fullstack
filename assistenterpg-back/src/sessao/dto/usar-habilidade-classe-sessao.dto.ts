import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AprimoramentoTemporarioSessaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tecnicaId!: number;

  @IsString()
  tipoGrauCodigo!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  graus!: number;
}

export class UsarHabilidadeClasseSessaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  habilidadeId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  versaoNivel!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AprimoramentoTemporarioSessaoDto)
  aprimoramentos?: AprimoramentoTemporarioSessaoDto[];
}
