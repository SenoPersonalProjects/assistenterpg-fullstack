import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TamanhoNpcAmeaca, TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListarNpcsAmeacasDto extends PaginationQueryDto {
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
