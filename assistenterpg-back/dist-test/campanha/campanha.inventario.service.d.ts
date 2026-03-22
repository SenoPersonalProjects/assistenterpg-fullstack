import { PrismaService } from '../prisma/prisma.service';
import { CampanhaAccessService } from './campanha.access.service';
import { InventarioEngine } from '../inventario/engine/inventario.engine';
import { InventarioMapper } from '../inventario/inventario.mapper';
import type { AdicionarItemInventarioCampanhaDto, AtualizarItemInventarioCampanhaDto, AplicarModificacaoInventarioCampanhaDto } from './dto/inventario-campanha.dto';
export declare class CampanhaInventarioService {
    private readonly prisma;
    private readonly accessService;
    private readonly engine;
    private readonly mapper;
    constructor(prisma: PrismaService, accessService: CampanhaAccessService, engine: InventarioEngine, mapper: InventarioMapper);
    private tratarErroPrisma;
    private validarPermissao;
    private buscarLimitesGrauXama;
    private carregarItensInventarioCampanha;
    private calcularEspacosPersonagemCampanha;
    private obterPericiasPersonagemBase;
    private atualizarEstadoInventarioCampanha;
    recalcularEstadoInventarioCampanha(personagemCampanhaId: number): Promise<void>;
    private validarSistemaVestir;
    private validarLimite2xCapacidade;
    buscarInventarioCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number): Promise<{
        personagemCampanhaId: number;
        espacos: import("../inventario/engine/inventario.types").ResultadoEspacos;
        itens: import("../inventario/dto/inventario-completo.dto").ItemInventarioDto[];
        statsEquipados: import("../inventario/dto/inventario-completo.dto").StatsEquipadosDto;
        limitesCategoria: {
            grauAtual: import("@prisma/client").$Enums.GrauFeiticeiro;
            limitesPorCategoria: Record<string, number>;
            itensPorCategoria: Record<string, number>;
            excedentes: string[];
        };
    }>;
    adicionarItemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: AdicionarItemInventarioCampanhaDto): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
    atualizarItemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number, dto: AtualizarItemInventarioCampanhaDto): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
    removerItemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number): Promise<{
        sucesso: boolean;
    }>;
    aplicarModificacaoCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number, dto: AplicarModificacaoInventarioCampanhaDto): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
    removerModificacaoCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number, modificacaoId: number): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
}
