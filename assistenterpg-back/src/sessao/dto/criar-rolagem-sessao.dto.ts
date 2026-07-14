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
    if (dto.tipo === 'FORMULA') {
      return (
        typeof dto.expressao === 'string' &&
        dto.personagemSessaoId === undefined &&
        dto.periciaCodigo === undefined &&
        dto.contexto?.dt === undefined &&
        (dto.contexto?.tipo === undefined || dto.contexto.tipo === 'OUTRO')
      );
    }
    if (dto.tipo === 'PERICIA_PERSONAGEM') {
      return (
        dto.expressao === undefined &&
        Number.isInteger(dto.personagemSessaoId) &&
        typeof dto.periciaCodigo === 'string' &&
        dto.contexto?.tipo === undefined
      );
    }
    return false;
  }

  defaultMessage(): string {
    return 'Payload incompativel com o tipo de rolagem informado';
  }
}

export class CriarRolagemSessaoDto {
  @IsIn(['FORMULA', 'PERICIA_PERSONAGEM'], {
    message: 'tipo deve ser FORMULA ou PERICIA_PERSONAGEM',
  })
  @Validate(RolagemSessaoPayloadCompativelConstraint)
  tipo: 'FORMULA' | 'PERICIA_PERSONAGEM';

  @ValidateIf((dto: CriarRolagemSessaoDto) => dto.tipo === 'FORMULA')
  @IsString({ message: 'expressao deve ser texto' })
  @IsNotEmpty({ message: 'expressao e obrigatoria' })
  @MaxLength(800, { message: 'expressao deve ter no maximo 800 caracteres' })
  expressao?: string;

  @ValidateIf((dto: CriarRolagemSessaoDto) => dto.tipo === 'PERICIA_PERSONAGEM')
  @Type(() => Number)
  @IsInt({ message: 'personagemSessaoId deve ser um numero inteiro' })
  @Min(1, { message: 'personagemSessaoId deve ser positivo' })
  personagemSessaoId?: number;

  @ValidateIf((dto: CriarRolagemSessaoDto) => dto.tipo === 'PERICIA_PERSONAGEM')
  @IsString({ message: 'periciaCodigo deve ser texto' })
  @IsNotEmpty({ message: 'periciaCodigo e obrigatorio' })
  @MaxLength(80, { message: 'periciaCodigo deve ter no maximo 80 caracteres' })
  periciaCodigo?: string;

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
