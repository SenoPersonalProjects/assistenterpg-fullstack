import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { InventarioEngine } from './engine/inventario.engine';
import { InventarioMapper } from './inventario.mapper';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { AtualizarItemDto } from './dto/atualizar-item.dto';
import { AplicarModificacaoDto } from './dto/aplicar-modificacao.dto';
import { RemoverModificacaoDto } from './dto/remover-modificacao.dto';
import { PreviewItemDto } from './dto/preview-item.dto';
import { PreviewItensInventarioDto } from './dto/preview-itens-inventario.dto';
import { PreviewAdicionarItemResponse, ResumoInventarioCompleto } from './engine/inventario.types';
export declare class InventarioService {
    private readonly prisma;
    private readonly engine;
    private readonly mapper;
    constructor(prisma: PrismaService, engine: InventarioEngine, mapper: InventarioMapper);
    private validarPropriedade;
    private buscarLimitesGrauXama;
    private carregarItensInventario;
    private calcularEspacosPersonagem;
    private atualizarEstadoInventario;
    private prepararResistenciasParaCriacao;
    private validarSistemaVestir;
    private validarLimite2xCapacidade;
    buscarInventario(donoId: number, personagemBaseId: number): Promise<ResumoInventarioCompleto>;
    previewAdicionarItem(donoId: number, dto: PreviewItemDto): Promise<PreviewAdicionarItemResponse>;
    previewItensInventario(dto: PreviewItensInventarioDto): Promise<any>;
    adicionarItem(donoId: number, dto: AdicionarItemDto, options?: {
        tx?: Prisma.TransactionClient;
        skipOwnershipCheck?: boolean;
    }): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
    atualizarItem(donoId: number, itemId: number, dto: AtualizarItemDto): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
    removerItem(donoId: number, itemId: number): Promise<{
        sucesso: boolean;
        mensagem: string;
    }>;
    aplicarModificacao(donoId: number, itemId: number, dto: AplicarModificacaoDto): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
    removerModificacao(donoId: number, itemId: number, dto: RemoverModificacaoDto): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
}
