import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FiltrarAnotacoesDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  busca?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  campanhaId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  sessaoId?: number;
}
