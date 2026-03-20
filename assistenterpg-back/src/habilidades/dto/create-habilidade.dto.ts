import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoFonte } from '@prisma/client';

// Enum dos tipos de habilidade (SEM TECNICA_INATA)
export enum TipoHabilidade {
  RECURSO_CLASSE = 'RECURSO_CLASSE',
  EFEITO_GRAU = 'EFEITO_GRAU',
  PODER_GENERICO = 'PODER_GENERICO',
  MECANICA_ESPECIAL = 'MECANICA_ESPECIAL',
  HABILIDADE_ORIGEM = 'HABILIDADE_ORIGEM',
  HABILIDADE_TRILHA = 'HABILIDADE_TRILHA',
  ESCOLA_TECNICA = 'ESCOLA_TECNICA',
}

// DTO para efeito de grau
export class EfeitoGrauDto {
  @IsString()
  @IsNotEmpty()
  tipoGrauCodigo: string;

  @IsOptional()
  @IsInt()
  valor?: number;

  @IsOptional()
  escalonamentoPorNivel?: any; // JSON livre
}

// DTO principal (SEM hereditaria e clasHereditariosIds)
export class CreateHabilidadeDto {
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'Codigo deve ter no maximo 60 caracteres' })
  codigo?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no minimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no maximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Descricao deve ter no maximo 1000 caracteres' })
  descricao?: string;

  @IsEnum(TipoHabilidade, {
    message: `Tipo deve ser: ${Object.values(TipoHabilidade).join(', ')}`,
  })
  tipo: TipoHabilidade;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  origem?: string;

  @IsOptional()
  requisitos?: any; // JSON livre (validar estrutura no service se necessario)

  @IsOptional()
  mecanicasEspeciais?: any; // JSON livre

  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  // Relacoes (apenas efeitos de grau)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EfeitoGrauDto)
  efeitosGrau?: EfeitoGrauDto[];
}
