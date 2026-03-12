import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

const parseBooleanQueryValue = ({
  value,
  obj,
  key,
}: {
  value: unknown;
  obj?: Record<string, unknown>;
  key?: string;
}): unknown => {
  const rawValue =
    obj && typeof key === 'string' && key.length > 0 ? obj[key] : value;

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return undefined;
  }

  if (typeof rawValue === 'boolean') {
    return rawValue;
  }

  if (typeof rawValue === 'string') {
    const normalized = rawValue.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return rawValue;
};

export class ImportarTecnicasJsonDto {
  @IsOptional()
  @IsString()
  schema?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  schemaVersion?: number;

  @IsOptional()
  @IsString()
  modo?: 'UPSERT';

  @IsArray()
  tecnicas!: unknown[];

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  substituirHabilidadesAusentes?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  substituirVariacoesAusentes?: boolean;
}
