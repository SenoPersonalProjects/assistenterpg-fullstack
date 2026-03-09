import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListarChatSessaoDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const numero = Number(value);
    return Number.isNaN(numero) ? value : numero;
  })
  @IsInt({ message: 'afterId deve ser inteiro' })
  @Min(1, { message: 'afterId deve ser maior que zero' })
  afterId?: number;
}
