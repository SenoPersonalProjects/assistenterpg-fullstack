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
} from 'class-validator';
import { Type } from 'class-transformer';

// ✅ Enum dos tipos de habilidade (SEM TECNICA_INATA)
export enum TipoHabilidade {
  RECURSO_CLASSE = 'RECURSO_CLASSE',
  EFEITO_GRAU = 'EFEITO_GRAU',
  PODER_GENERICO = 'PODER_GENERICO',
  MECANICA_ESPECIAL = 'MECANICA_ESPECIAL',
  HABILIDADE_ORIGEM = 'HABILIDADE_ORIGEM',
  HABILIDADE_TRILHA = 'HABILIDADE_TRILHA',
  ESCOLA_TECNICA = 'ESCOLA_TECNICA',
}

// ✅ DTO para efeito de grau
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

// ✅ DTO principal (SEM hereditaria e clasHereditariosIds)
export class CreateHabilidadeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
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
  requisitos?: any; // JSON livre (validar estrutura no service se necessário)

  @IsOptional()
  mecanicasEspeciais?: any; // JSON livre

  // ✅ Relações (apenas efeitos de grau)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EfeitoGrauDto)
  efeitosGrau?: EfeitoGrauDto[];
}
