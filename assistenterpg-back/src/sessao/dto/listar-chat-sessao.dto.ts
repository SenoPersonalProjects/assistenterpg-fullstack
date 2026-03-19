import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListarChatSessaoDto {
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
  @IsInt({ message: 'afterId deve ser inteiro' })
  @Min(1, { message: 'afterId deve ser maior que zero' })
  afterId?: number;
}
