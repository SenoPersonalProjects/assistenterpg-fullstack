import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ContextoRolagemFormulaSessaoDto {
  @IsIn(['OUTRO'], { message: 'contexto.tipo deve ser OUTRO nesta versao' })
  tipo: 'OUTRO';
}

export class CriarRolagemFormulaSessaoDto {
  @IsIn(['FORMULA'], { message: 'tipo deve ser FORMULA' })
  tipo: 'FORMULA';

  @IsString({ message: 'expressao deve ser texto' })
  @IsNotEmpty({ message: 'expressao e obrigatoria' })
  @MaxLength(800, { message: 'expressao deve ter no maximo 800 caracteres' })
  expressao: string;

  @IsOptional()
  @IsIn(['PUBLICA', 'SECRETA_MESTRE'], {
    message: 'visibilidade deve ser PUBLICA ou SECRETA_MESTRE',
  })
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';

  @IsOptional()
  @IsObject({ message: 'contexto deve ser um objeto' })
  @ValidateNested()
  @Type(() => ContextoRolagemFormulaSessaoDto)
  contexto?: ContextoRolagemFormulaSessaoDto;

  @IsUUID('4', { message: 'clientRequestId deve ser um UUID v4' })
  clientRequestId: string;
}
