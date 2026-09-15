import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TamanhoNpcAmeaca,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListarNpcsAmeacasDto extends PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  grupoId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsEnum(TipoFichaNpcAmeaca)
  fichaTipo?: TipoFichaNpcAmeaca;

  @IsOptional()
  @IsEnum(TipoNpcAmeaca)
  tipo?: TipoNpcAmeaca;

  @IsOptional()
  @IsEnum(TamanhoNpcAmeaca)
  tamanho?: TamanhoNpcAmeaca;
}
