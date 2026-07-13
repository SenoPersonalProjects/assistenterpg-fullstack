import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ControleTurnoSessaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rodadaEsperada: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  indiceTurnoEsperado?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  ladoAtualIdEsperado?: number;
}
