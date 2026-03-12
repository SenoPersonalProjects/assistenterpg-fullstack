import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { FiltrarTecnicasDto } from './filtrar-tecnicas.dto';

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

export class ExportarTecnicasJsonDto extends FiltrarTecnicasDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  id?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  incluirIds?: boolean;
}
