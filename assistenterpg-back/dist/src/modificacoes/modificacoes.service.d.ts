import { PrismaService } from '../prisma/prisma.service';
import { FiltrarModificacoesDto } from './dto/filtrar-modificacoes.dto';
import { ModificacaoDetalhadaDto } from './dto/modificacao-detalhada.dto';
import { CreateModificacaoDto } from './dto/create-modificacao.dto';
import { UpdateModificacaoDto } from './dto/update-modificacao.dto';
import { ResultadoValidacaoRestricoes } from './types/restricoes.types';
export declare class ModificacoesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateModificacaoDto): Promise<ModificacaoDetalhadaDto>;
    update(id: number, updateDto: UpdateModificacaoDto): Promise<ModificacaoDetalhadaDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
    listar(filtros: FiltrarModificacoesDto): Promise<{
        dados: ModificacaoDetalhadaDto[];
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    buscarPorId(id: number): Promise<ModificacaoDetalhadaDto>;
    buscarCompatíveisComEquipamento(equipamentoId: number): Promise<ModificacaoDetalhadaDto[]>;
    validarRestricoes(equipamento: any, modificacao: any): Promise<ResultadoValidacaoRestricoes>;
    validarConflitosModificacoes(modificacaoNova: any, modificacoesExistentes: any[]): Promise<ResultadoValidacaoRestricoes>;
    private mapDetalhado;
}
