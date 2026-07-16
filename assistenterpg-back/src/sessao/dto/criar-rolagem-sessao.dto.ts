import { Type } from 'class-transformer';
import {
  IsInt,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export class ContextoRolagemSessaoDto {
  @IsOptional()
  @IsIn(['OUTRO'], { message: 'contexto.tipo deve ser OUTRO' })
  tipo?: 'OUTRO';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'contexto.dt deve ser um numero inteiro' })
  @Min(0, { message: 'contexto.dt deve ser maior ou igual a zero' })
  @Max(100000, { message: 'contexto.dt deve ser menor ou igual a 100000' })
  dt?: number;
}

@ValidatorConstraint({ name: 'rolagemSessaoPayloadCompativel', async: false })
class RolagemSessaoPayloadCompativelConstraint implements ValidatorConstraintInterface {
  validate(_tipo: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CriarRolagemSessaoDto;
    const tipoItem =
      dto.tipo === 'ATAQUE_ITEM_PERSONAGEM' ||
      dto.tipo === 'DANO_ITEM_PERSONAGEM' ||
      dto.tipo === 'CRITICO_ITEM_PERSONAGEM';
    if (
      !tipoItem &&
      (dto.itemInventarioCampanhaId !== undefined ||
        dto.atributoEscolhido !== undefined ||
        dto.ajusteFlatManual !== undefined ||
        dto.ajusteDadosManual !== undefined ||
        dto.empunhadura !== undefined)
    ) {
      return false;
    }
    if (dto.tipo === 'FORMULA') {
      return (
        typeof dto.expressao === 'string' &&
        dto.personagemSessaoId === undefined &&
        dto.habilidadeTecnicaId === undefined &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        dto.npcSessaoId === undefined &&
        dto.periciaCodigo === undefined &&
        dto.origemAtaque === undefined &&
        dto.origemDano === undefined &&
        dto.origemCritico === undefined &&
        dto.acaoIndice === undefined &&
        dto.contexto?.dt === undefined &&
        (dto.contexto?.tipo === undefined || dto.contexto.tipo === 'OUTRO')
      );
    }
    if (dto.tipo === 'PERICIA_PERSONAGEM' || dto.tipo === 'ATAQUE_PERSONAGEM') {
      return (
        dto.expressao === undefined &&
        Number.isInteger(dto.personagemSessaoId) &&
        dto.habilidadeTecnicaId === undefined &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        dto.npcSessaoId === undefined &&
        typeof dto.periciaCodigo === 'string' &&
        dto.origemAtaque === undefined &&
        dto.origemDano === undefined &&
        dto.origemCritico === undefined &&
        dto.acaoIndice === undefined &&
        dto.contexto?.tipo === undefined
      );
    }
    if (dto.tipo === 'TESTE_HABILIDADE_PERSONAGEM') {
      return (
        dto.expressao === undefined &&
        Number.isInteger(dto.personagemSessaoId) &&
        Number.isInteger(dto.habilidadeTecnicaId) &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        dto.npcSessaoId === undefined &&
        dto.periciaCodigo === undefined &&
        dto.origemAtaque === undefined &&
        dto.origemDano === undefined &&
        dto.origemCritico === undefined &&
        dto.acaoIndice === undefined &&
        dto.contexto === undefined
      );
    }
    if (dto.tipo === 'DANO_PERSONAGEM') {
      return (
        dto.expressao === undefined &&
        Number.isInteger(dto.personagemSessaoId) &&
        Number.isInteger(dto.habilidadeTecnicaId) &&
        dto.npcSessaoId === undefined &&
        dto.periciaCodigo === undefined &&
        dto.origemAtaque === undefined &&
        dto.origemDano === 'HABILIDADE_TECNICA' &&
        dto.origemCritico === undefined &&
        dto.acaoIndice === undefined &&
        dto.contexto === undefined
      );
    }
    if (dto.tipo === 'CRITICO_PERSONAGEM') {
      return (
        dto.expressao === undefined &&
        Number.isInteger(dto.personagemSessaoId) &&
        Number.isInteger(dto.habilidadeTecnicaId) &&
        dto.npcSessaoId === undefined &&
        dto.periciaCodigo === undefined &&
        dto.origemAtaque === undefined &&
        dto.origemDano === undefined &&
        dto.origemCritico === 'HABILIDADE_TECNICA' &&
        dto.acaoIndice === undefined &&
        dto.contexto === undefined
      );
    }
    if (dto.tipo === 'ATAQUE_ITEM_PERSONAGEM') {
      return (
        dto.expressao === undefined &&
        Number.isInteger(dto.personagemSessaoId) &&
        Number.isInteger(dto.itemInventarioCampanhaId) &&
        dto.habilidadeTecnicaId === undefined &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        dto.npcSessaoId === undefined &&
        dto.periciaCodigo === undefined &&
        dto.origemAtaque === undefined &&
        dto.origemDano === undefined &&
        dto.origemCritico === undefined &&
        dto.acaoIndice === undefined &&
        dto.empunhadura === undefined &&
        dto.contexto?.tipo === undefined
      );
    }
    if (
      dto.tipo === 'DANO_ITEM_PERSONAGEM' ||
      dto.tipo === 'CRITICO_ITEM_PERSONAGEM'
    ) {
      return (
        dto.expressao === undefined &&
        Number.isInteger(dto.personagemSessaoId) &&
        Number.isInteger(dto.itemInventarioCampanhaId) &&
        dto.habilidadeTecnicaId === undefined &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        dto.npcSessaoId === undefined &&
        dto.periciaCodigo === undefined &&
        dto.origemAtaque === undefined &&
        dto.origemDano === undefined &&
        dto.origemCritico === undefined &&
        dto.acaoIndice === undefined &&
        dto.atributoEscolhido === undefined &&
        dto.ajusteDadosManual === undefined &&
        dto.contexto === undefined
      );
    }
    if (dto.tipo === 'PERICIA_NPC') {
      return (
        dto.expressao === undefined &&
        dto.personagemSessaoId === undefined &&
        dto.habilidadeTecnicaId === undefined &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        Number.isInteger(dto.npcSessaoId) &&
        typeof dto.periciaCodigo === 'string' &&
        dto.origemAtaque === undefined &&
        dto.origemDano === undefined &&
        dto.origemCritico === undefined &&
        dto.acaoIndice === undefined &&
        dto.contexto?.tipo === undefined
      );
    }
    if (dto.tipo === 'ATAQUE_NPC') {
      const baseCompativel =
        dto.expressao === undefined &&
        dto.personagemSessaoId === undefined &&
        dto.habilidadeTecnicaId === undefined &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        Number.isInteger(dto.npcSessaoId) &&
        dto.origemDano === undefined &&
        dto.origemCritico === undefined &&
        dto.contexto?.tipo === undefined;
      if (dto.origemAtaque === 'PERICIA') {
        return (
          baseCompativel &&
          typeof dto.periciaCodigo === 'string' &&
          dto.acaoIndice === undefined
        );
      }
      if (dto.origemAtaque === 'ACAO') {
        return (
          baseCompativel &&
          dto.periciaCodigo === undefined &&
          Number.isInteger(dto.acaoIndice) &&
          Number(dto.acaoIndice) >= 0
        );
      }
    }
    if (dto.tipo === 'DANO_NPC') {
      return (
        dto.expressao === undefined &&
        dto.personagemSessaoId === undefined &&
        dto.habilidadeTecnicaId === undefined &&
        dto.variacaoHabilidadeId === undefined &&
        dto.acumulos === undefined &&
        Number.isInteger(dto.npcSessaoId) &&
        dto.periciaCodigo === undefined &&
        dto.origemAtaque === undefined &&
        dto.origemDano === 'ACAO' &&
        dto.origemCritico === undefined &&
        Number.isInteger(dto.acaoIndice) &&
        Number(dto.acaoIndice) >= 0 &&
        dto.contexto === undefined
      );
    }
    return false;
  }

  defaultMessage(): string {
    return 'Payload incompativel com o tipo de rolagem informado';
  }
}

export class CriarRolagemSessaoDto {
  @IsIn(
    [
      'FORMULA',
      'PERICIA_PERSONAGEM',
      'ATAQUE_PERSONAGEM',
      'PERICIA_NPC',
      'ATAQUE_NPC',
      'DANO_NPC',
      'TESTE_HABILIDADE_PERSONAGEM',
      'DANO_PERSONAGEM',
      'CRITICO_PERSONAGEM',
      'ATAQUE_ITEM_PERSONAGEM',
      'DANO_ITEM_PERSONAGEM',
      'CRITICO_ITEM_PERSONAGEM',
    ],
    {
      message: 'tipo de rolagem invalido',
    },
  )
  @Validate(RolagemSessaoPayloadCompativelConstraint)
  tipo:
    | 'FORMULA'
    | 'PERICIA_PERSONAGEM'
    | 'ATAQUE_PERSONAGEM'
    | 'PERICIA_NPC'
    | 'ATAQUE_NPC'
    | 'DANO_NPC'
    | 'TESTE_HABILIDADE_PERSONAGEM'
    | 'DANO_PERSONAGEM'
    | 'CRITICO_PERSONAGEM'
    | 'ATAQUE_ITEM_PERSONAGEM'
    | 'DANO_ITEM_PERSONAGEM'
    | 'CRITICO_ITEM_PERSONAGEM';

  @ValidateIf((dto: CriarRolagemSessaoDto) => dto.tipo === 'FORMULA')
  @IsString({ message: 'expressao deve ser texto' })
  @IsNotEmpty({ message: 'expressao e obrigatoria' })
  @MaxLength(800, { message: 'expressao deve ter no maximo 800 caracteres' })
  expressao?: string;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'PERICIA_PERSONAGEM' ||
      dto.tipo === 'ATAQUE_PERSONAGEM' ||
      dto.tipo === 'TESTE_HABILIDADE_PERSONAGEM' ||
      dto.tipo === 'DANO_PERSONAGEM' ||
      dto.tipo === 'CRITICO_PERSONAGEM' ||
      dto.tipo === 'ATAQUE_ITEM_PERSONAGEM' ||
      dto.tipo === 'DANO_ITEM_PERSONAGEM' ||
      dto.tipo === 'CRITICO_ITEM_PERSONAGEM',
  )
  @Type(() => Number)
  @IsInt({ message: 'personagemSessaoId deve ser um numero inteiro' })
  @Min(1, { message: 'personagemSessaoId deve ser positivo' })
  personagemSessaoId?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'ATAQUE_ITEM_PERSONAGEM' ||
      dto.tipo === 'DANO_ITEM_PERSONAGEM' ||
      dto.tipo === 'CRITICO_ITEM_PERSONAGEM',
  )
  @Type(() => Number)
  @IsInt({ message: 'itemInventarioCampanhaId deve ser um numero inteiro' })
  @Min(1, { message: 'itemInventarioCampanhaId deve ser positivo' })
  itemInventarioCampanhaId?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'ATAQUE_ITEM_PERSONAGEM' &&
      dto.atributoEscolhido !== undefined,
  )
  @IsIn(['FOR', 'AGI'], {
    message: 'atributoEscolhido deve ser FOR ou AGI',
  })
  atributoEscolhido?: 'FOR' | 'AGI';

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      (dto.tipo === 'ATAQUE_ITEM_PERSONAGEM' ||
        dto.tipo === 'DANO_ITEM_PERSONAGEM' ||
        dto.tipo === 'CRITICO_ITEM_PERSONAGEM') &&
      dto.ajusteFlatManual !== undefined,
  )
  @Type(() => Number)
  @IsInt({ message: 'ajusteFlatManual deve ser um numero inteiro' })
  @Min(-100, { message: 'ajusteFlatManual deve ser maior ou igual a -100' })
  @Max(100, { message: 'ajusteFlatManual deve ser menor ou igual a 100' })
  ajusteFlatManual?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'ATAQUE_ITEM_PERSONAGEM' &&
      dto.ajusteDadosManual !== undefined,
  )
  @Type(() => Number)
  @IsInt({ message: 'ajusteDadosManual deve ser um numero inteiro' })
  @Min(-10, { message: 'ajusteDadosManual deve ser maior ou igual a -10' })
  @Max(10, { message: 'ajusteDadosManual deve ser menor ou igual a 10' })
  ajusteDadosManual?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      (dto.tipo === 'DANO_ITEM_PERSONAGEM' ||
        dto.tipo === 'CRITICO_ITEM_PERSONAGEM') &&
      dto.empunhadura !== undefined,
  )
  @IsIn(['LEVE', 'UMA_MAO', 'DUAS_MAOS'], {
    message: 'empunhadura deve ser LEVE, UMA_MAO ou DUAS_MAOS',
  })
  empunhadura?: 'LEVE' | 'UMA_MAO' | 'DUAS_MAOS';

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'TESTE_HABILIDADE_PERSONAGEM' ||
      dto.tipo === 'DANO_PERSONAGEM' ||
      dto.tipo === 'CRITICO_PERSONAGEM',
  )
  @Type(() => Number)
  @IsInt({ message: 'habilidadeTecnicaId deve ser um numero inteiro' })
  @Min(1, { message: 'habilidadeTecnicaId deve ser positivo' })
  habilidadeTecnicaId?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      (dto.tipo === 'DANO_PERSONAGEM' || dto.tipo === 'CRITICO_PERSONAGEM') &&
      dto.variacaoHabilidadeId !== undefined,
  )
  @Type(() => Number)
  @IsInt({ message: 'variacaoHabilidadeId deve ser um numero inteiro' })
  @Min(1, { message: 'variacaoHabilidadeId deve ser positivo' })
  variacaoHabilidadeId?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      (dto.tipo === 'DANO_PERSONAGEM' || dto.tipo === 'CRITICO_PERSONAGEM') &&
      dto.acumulos !== undefined,
  )
  @Type(() => Number)
  @IsInt({ message: 'acumulos deve ser um numero inteiro' })
  @Min(0, { message: 'acumulos deve ser maior ou igual a zero' })
  @Max(5, { message: 'acumulos deve ser menor ou igual a 5' })
  acumulos?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'PERICIA_NPC' ||
      dto.tipo === 'ATAQUE_NPC' ||
      dto.tipo === 'DANO_NPC',
  )
  @Type(() => Number)
  @IsInt({ message: 'npcSessaoId deve ser um numero inteiro' })
  @Min(1, { message: 'npcSessaoId deve ser positivo' })
  npcSessaoId?: number;

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'PERICIA_PERSONAGEM' ||
      dto.tipo === 'ATAQUE_PERSONAGEM' ||
      dto.tipo === 'PERICIA_NPC' ||
      (dto.tipo === 'ATAQUE_NPC' && dto.origemAtaque === 'PERICIA'),
  )
  @IsString({ message: 'periciaCodigo deve ser texto' })
  @IsNotEmpty({ message: 'periciaCodigo e obrigatorio' })
  @MaxLength(80, { message: 'periciaCodigo deve ter no maximo 80 caracteres' })
  periciaCodigo?: string;

  @ValidateIf((dto: CriarRolagemSessaoDto) => dto.tipo === 'ATAQUE_NPC')
  @IsIn(['PERICIA', 'ACAO'], {
    message: 'origemAtaque deve ser PERICIA ou ACAO',
  })
  origemAtaque?: 'PERICIA' | 'ACAO';

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      dto.tipo === 'DANO_NPC' || dto.tipo === 'DANO_PERSONAGEM',
  )
  @IsIn(['ACAO', 'HABILIDADE_TECNICA'], {
    message: 'origemDano deve ser ACAO ou HABILIDADE_TECNICA',
  })
  origemDano?: 'ACAO' | 'HABILIDADE_TECNICA';

  @ValidateIf((dto: CriarRolagemSessaoDto) => dto.tipo === 'CRITICO_PERSONAGEM')
  @IsIn(['HABILIDADE_TECNICA'], {
    message: 'origemCritico deve ser HABILIDADE_TECNICA',
  })
  origemCritico?: 'HABILIDADE_TECNICA';

  @ValidateIf(
    (dto: CriarRolagemSessaoDto) =>
      (dto.tipo === 'ATAQUE_NPC' && dto.origemAtaque === 'ACAO') ||
      dto.tipo === 'DANO_NPC',
  )
  @Type(() => Number)
  @IsInt({ message: 'acaoIndice deve ser um numero inteiro' })
  @Min(0, { message: 'acaoIndice deve ser maior ou igual a zero' })
  acaoIndice?: number;

  @IsOptional()
  @IsIn(['PUBLICA', 'SECRETA_MESTRE'], {
    message: 'visibilidade deve ser PUBLICA ou SECRETA_MESTRE',
  })
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';

  @IsOptional()
  @IsObject({ message: 'contexto deve ser um objeto' })
  @ValidateNested()
  @Type(() => ContextoRolagemSessaoDto)
  contexto?: ContextoRolagemSessaoDto;

  @IsUUID('4', { message: 'clientRequestId deve ser um UUID v4' })
  clientRequestId: string;
}

export type CriarRolagemFormulaSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'FORMULA';
  expressao: string;
};

export type CriarRolagemPericiaSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'PERICIA_PERSONAGEM';
  personagemSessaoId: number;
  periciaCodigo: string;
};

export type CriarRolagemAtaquePersonagemSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'ATAQUE_PERSONAGEM';
  personagemSessaoId: number;
  periciaCodigo: string;
};

export type CriarRolagemMecanicaPersonagemSessaoDto =
  | CriarRolagemPericiaSessaoDto
  | CriarRolagemAtaquePersonagemSessaoDto;

export type CriarRolagemPericiaNpcSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'PERICIA_NPC';
  npcSessaoId: number;
  periciaCodigo: string;
};

export type CriarRolagemAtaqueNpcPericiaSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'ATAQUE_NPC';
  origemAtaque: 'PERICIA';
  npcSessaoId: number;
  periciaCodigo: string;
};

export type CriarRolagemAtaqueNpcAcaoSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'ATAQUE_NPC';
  origemAtaque: 'ACAO';
  npcSessaoId: number;
  acaoIndice: number;
};

export type CriarRolagemDanoNpcAcaoSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'DANO_NPC';
  origemDano: 'ACAO';
  npcSessaoId: number;
  acaoIndice: number;
};

export type CriarRolagemMecanicaNpcSessaoDto =
  | CriarRolagemPericiaNpcSessaoDto
  | CriarRolagemAtaqueNpcPericiaSessaoDto
  | CriarRolagemAtaqueNpcAcaoSessaoDto
  | CriarRolagemDanoNpcAcaoSessaoDto;

export type CriarRolagemTesteHabilidadePersonagemSessaoDto =
  CriarRolagemSessaoDto & {
    tipo: 'TESTE_HABILIDADE_PERSONAGEM';
    personagemSessaoId: number;
    habilidadeTecnicaId: number;
  };

export type CriarRolagemDanoHabilidadePersonagemSessaoDto =
  CriarRolagemSessaoDto & {
    tipo: 'DANO_PERSONAGEM';
    origemDano: 'HABILIDADE_TECNICA';
    personagemSessaoId: number;
    habilidadeTecnicaId: number;
  };

export type CriarRolagemCriticoHabilidadePersonagemSessaoDto =
  CriarRolagemSessaoDto & {
    tipo: 'CRITICO_PERSONAGEM';
    origemCritico: 'HABILIDADE_TECNICA';
    personagemSessaoId: number;
    habilidadeTecnicaId: number;
  };

export type CriarRolagemHabilidadePersonagemSessaoDto =
  | CriarRolagemTesteHabilidadePersonagemSessaoDto
  | CriarRolagemDanoHabilidadePersonagemSessaoDto
  | CriarRolagemCriticoHabilidadePersonagemSessaoDto;

export type CriarRolagemAtaqueItemPersonagemSessaoDto =
  CriarRolagemSessaoDto & {
    tipo: 'ATAQUE_ITEM_PERSONAGEM';
    personagemSessaoId: number;
    itemInventarioCampanhaId: number;
  };

export type CriarRolagemDanoItemPersonagemSessaoDto = CriarRolagemSessaoDto & {
  tipo: 'DANO_ITEM_PERSONAGEM';
  personagemSessaoId: number;
  itemInventarioCampanhaId: number;
};

export type CriarRolagemItemPersonagemSessaoDto =
  | CriarRolagemAtaqueItemPersonagemSessaoDto
  | CriarRolagemDanoItemPersonagemSessaoDto
  | (CriarRolagemSessaoDto & {
      tipo: 'CRITICO_ITEM_PERSONAGEM';
      personagemSessaoId: number;
      itemInventarioCampanhaId: number;
    });
