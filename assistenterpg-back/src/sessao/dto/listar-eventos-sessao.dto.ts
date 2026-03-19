import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListarEventosSessaoDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const numero = Number(value);
      return Number.isNaN(numero) ? value : numero;
    }
    return value;
  })
  @IsInt({ message: 'limit deve ser inteiro' })
  @Min(1, { message: 'limit deve ser maior que zero' })
  @Max(200, { message: 'limit deve ser menor ou igual a 200' })
  limit?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return value;
  })
  @IsBoolean({ message: 'incluirChat deve ser booleano' })
  incluirChat?: boolean;
}
