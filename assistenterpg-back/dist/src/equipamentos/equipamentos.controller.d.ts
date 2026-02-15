import { EquipamentosService } from './equipamentos.service';
import { FiltrarEquipamentosDto } from './dto/filtrar-equipamentos.dto';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { AtualizarEquipamentoDto } from './dto/atualizar-equipamento.dto';
export declare class EquipamentosController {
    private readonly equipamentosService;
    constructor(equipamentosService: EquipamentosService);
    listar(filtros: FiltrarEquipamentosDto): Promise<{
        dados: import("./dto/equipamento-resumo.dto").EquipamentoResumoDto[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    buscarPorId(id: number): Promise<import("./dto/equipamento-detalhado.dto").EquipamentoDetalhadoDto>;
    buscarPorCodigo(codigo: string): Promise<import("./dto/equipamento-detalhado.dto").EquipamentoDetalhadoDto>;
    criar(data: CriarEquipamentoDto): Promise<import("./dto/equipamento-detalhado.dto").EquipamentoDetalhadoDto>;
    atualizar(id: number, data: AtualizarEquipamentoDto): Promise<import("./dto/equipamento-detalhado.dto").EquipamentoDetalhadoDto>;
    deletar(id: number): Promise<void>;
}
