import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListarEventosSessaoDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const numero = Number(value);
    return Number.isNaN(numero) ? value : numero;
  })
  @IsInt({ message: 'limit deve ser inteiro' })
  @Min(1, { message: 'limit deve ser maior que zero' })
  @Max(200, { message: 'limit deve ser menor ou igual a 200' })
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'incluirChat deve ser booleano' })
  incluirChat?: boolean;
}
