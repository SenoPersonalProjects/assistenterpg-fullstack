import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

const parseOptionalNumber = ({
  value,
}: {
  value: unknown;
}): number | null | undefined => {
  if (value === undefined || value === '') return undefined;
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? (value as number) : parsed;
};

export class CreateAnotacaoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120, { message: 'Titulo deve ter no maximo 120 caracteres' })
  titulo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000, { message: 'Conteudo deve ter no maximo 5000 caracteres' })
  conteudo: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(parseOptionalNumber)
  campanhaId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(parseOptionalNumber)
  sessaoId?: number | null;
}
