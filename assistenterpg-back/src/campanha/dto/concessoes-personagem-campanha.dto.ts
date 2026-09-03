import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ConcederPoderGenericoCampanhaDto {
  @IsInt()
  @Min(1)
  habilidadeId: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class ConcederProficienciaCampanhaDto {
  @IsInt()
  @Min(1)
  proficienciaId: number;
}

export class CriarHabilidadePersonalizadaCampanhaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  descricao: string;
}
