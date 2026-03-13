import { TamanhoNpcAmeaca, TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
export declare class ListarNpcsAmeacasDto extends PaginationQueryDto {
    nome?: string;
    fichaTipo?: TipoFichaNpcAmeaca;
    tipo?: TipoNpcAmeaca;
    tamanho?: TamanhoNpcAmeaca;
}
