import { PrismaService } from '../prisma/prisma.service';
import { FiltrarEquipamentosDto } from './dto/filtrar-equipamentos.dto';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { AtualizarEquipamentoDto } from './dto/atualizar-equipamento.dto';
import { EquipamentoDetalhadoDto } from './dto/equipamento-detalhado.dto';
import { EquipamentoResumoDto } from './dto/equipamento-resumo.dto';
export declare class EquipamentosService {
    private prisma;
    constructor(prisma: PrismaService);
    private validarFonteSuplemento;
    listar(filtros: FiltrarEquipamentosDto): Promise<{
        dados: EquipamentoResumoDto[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    buscarPorId(id: number): Promise<EquipamentoDetalhadoDto>;
    buscarPorCodigo(codigo: string): Promise<EquipamentoDetalhadoDto>;
    criar(data: CriarEquipamentoDto): Promise<EquipamentoDetalhadoDto>;
    atualizar(id: number, data: AtualizarEquipamentoDto): Promise<EquipamentoDetalhadoDto>;
    deletar(id: number): Promise<void>;
    private mapResumo;
    private mapDetalhado;
}
