import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

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
}
