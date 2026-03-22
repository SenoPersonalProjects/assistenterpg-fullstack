import { ModificacoesService } from './modificacoes.service';
import { FiltrarModificacoesDto } from './dto/filtrar-modificacoes.dto';
import { CreateModificacaoDto } from './dto/create-modificacao.dto';
import { UpdateModificacaoDto } from './dto/update-modificacao.dto';
export declare class ModificacoesController {
    private readonly modificacoesService;
    constructor(modificacoesService: ModificacoesService);
    listar(filtros: FiltrarModificacoesDto): Promise<{
        dados: import("./dto/modificacao-detalhada.dto").ModificacaoDetalhadaDto[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    buscarPorId(id: number): Promise<import("./dto/modificacao-detalhada.dto").ModificacaoDetalhadaDto>;
    buscarCompatíveis(equipamentoId: number): Promise<import("./dto/modificacao-detalhada.dto").ModificacaoDetalhadaDto[]>;
    create(createDto: CreateModificacaoDto): Promise<import("./dto/modificacao-detalhada.dto").ModificacaoDetalhadaDto>;
    update(id: number, updateDto: UpdateModificacaoDto): Promise<import("./dto/modificacao-detalhada.dto").ModificacaoDetalhadaDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
