import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Validate,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from 'class-validator';
import type {
  MacroPersonalizadaTipo,
  VisibilidadeRolagemMacro,
} from '@prisma/client';
import {
  MACRO_PERSONAGEM_DESCRICAO_MAX,
  MACRO_PERSONAGEM_NOME_MAX,
  normalizarConfigMacroPersonalizada,
} from '../personagem-campanha-macro';

@ValidatorConstraint({ name: 'configMacroPersonalizadaValida', async: false })
class ConfigMacroPersonalizadaValidaConstraint implements ValidatorConstraintInterface {
  validate(config: unknown, args: ValidationArguments): boolean {
    const dto = args.object as { tipo?: MacroPersonalizadaTipo };
    if (!dto.tipo) return false;
    try {
      normalizarConfigMacroPersonalizada(dto.tipo, config);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'config incompativel com o tipo de macro informado';
  }
}

export class SalvarMacroPersonagemCampanhaDto {
  @IsIn(['ATAQUE_PERICIA', 'DANO_FORMULA', 'FORMULA_LIVRE'])
  tipo: MacroPersonalizadaTipo;

  @IsString()
  @MaxLength(MACRO_PERSONAGEM_NOME_MAX)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(MACRO_PERSONAGEM_DESCRICAO_MAX)
  descricao?: string;

  @IsOptional()
  @IsIn(['PUBLICA', 'SECRETA_MESTRE'])
  visibilidadePadrao?: VisibilidadeRolagemMacro;

  @IsObject()
  @Validate(ConfigMacroPersonalizadaValidaConstraint)
  config: Record<string, unknown>;
}

export class CriarMacroPersonagemCampanhaDto extends SalvarMacroPersonagemCampanhaDto {}

export class AtualizarMacroPersonagemCampanhaDto extends SalvarMacroPersonagemCampanhaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  revisaoEsperada: number;
}
