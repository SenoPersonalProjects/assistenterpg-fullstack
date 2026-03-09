import { PrismaService } from '../prisma/prisma.service';
import { FiltrarModificacoesDto } from './dto/filtrar-modificacoes.dto';
import { ModificacaoDetalhadaDto } from './dto/modificacao-detalhada.dto';
import { CreateModificacaoDto } from './dto/create-modificacao.dto';
import { UpdateModificacaoDto } from './dto/update-modificacao.dto';
import { Prisma } from '@prisma/client';
import { ResultadoValidacaoRestricoes } from './types/restricoes.types';
declare const equipamentoRestricoesSelect: {
    id: true;
    tipo: true;
    categoria: true;
    complexidadeMaldicao: true;
    proficienciaProtecao: true;
    tipoProtecao: true;
    tipoArma: true;
    proficienciaArma: true;
    alcance: true;
};
type EquipamentoRestricoesEntity = Prisma.EquipamentoCatalogoGetPayload<{
    select: typeof equipamentoRestricoesSelect;
}>;
type ModificacaoBaseEntity = Prisma.ModificacaoEquipamentoGetPayload<Prisma.ModificacaoEquipamentoDefaultArgs>;
type ModificacaoComRestricoesEntity = Pick<ModificacaoBaseEntity, 'codigo' | 'nome' | 'restricoes'>;
export declare class ModificacoesService {
    private prisma;
    constructor(prisma: PrismaService);
    private tratarErroPrisma;
    private normalizarJsonParaPersistir;
    private validarFonteSuplemento;
    private parseRestricoes;
    private categoriaParaNumero;
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
    validarRestricoes(equipamento: EquipamentoRestricoesEntity, modificacao: ModificacaoComRestricoesEntity): ResultadoValidacaoRestricoes;
    validarConflitosModificacoes(modificacaoNova: ModificacaoComRestricoesEntity, modificacoesExistentes: ModificacaoComRestricoesEntity[]): ResultadoValidacaoRestricoes;
    private mapDetalhado;
}
export {};
