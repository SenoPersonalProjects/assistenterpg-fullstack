import { PrismaService } from '../prisma/prisma.service';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaInventarioService } from './campanha.inventario.service';
import { CampanhaMapper } from './campanha.mapper';
import { CampanhaPersistence } from './campanha.persistence';
export declare class CampanhaPersonagensService {
    private readonly prisma;
    private readonly accessService;
    private readonly inventarioService;
    private readonly mapper;
    private readonly persistence;
    constructor(prisma: PrismaService, accessService: CampanhaAccessService, inventarioService: CampanhaInventarioService, mapper: CampanhaMapper, persistence: CampanhaPersistence);
    listarPersonagensCampanha(campanhaId: number, usuarioId: number): Promise<{
        id: number;
        campanhaId: number;
        personagemBaseId: number;
        donoId: number;
        nome: string;
        nivel: number;
        recursos: {
            pvAtual: number;
            pvMax: number;
            peAtual: number;
            peMax: number;
            eaAtual: number;
            eaMax: number;
            sanAtual: number;
            sanMax: number;
        };
        defesa: {
            base: number;
            equipamento: number;
            outros: number;
            total: number;
        };
        atributos: {
            limitePeEaPorTurno: number;
            prestigioGeral: number;
            prestigioCla: number | null;
            deslocamento: number;
            esquiva: number;
            bloqueio: number;
            turnosMorrendo: number;
            turnosEnlouquecendo: number;
        };
        personagemBase: {
            id: number;
            nome: string;
        };
        dono: {
            id: number;
            apelido: string;
        };
        modificadoresAtivos: {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            valor: number;
            criadoPorId: number;
        }[];
    }[]>;
    listarPersonagensBaseDisponiveisParaAssociacao(campanhaId: number, usuarioId: number): Promise<{
        id: number;
        nome: string;
        nivel: number;
        donoId: number;
        dono: {
            id: number;
            apelido: string;
        };
    }[]>;
    vincularPersonagemBase(campanhaId: number, solicitanteId: number, personagemBaseId: number): Promise<{
        id: number;
        campanhaId: number;
        personagemBaseId: number;
        donoId: number;
        nome: string;
        nivel: number;
        recursos: {
            pvAtual: number;
            pvMax: number;
            peAtual: number;
            peMax: number;
            eaAtual: number;
            eaMax: number;
            sanAtual: number;
            sanMax: number;
        };
        defesa: {
            base: number;
            equipamento: number;
            outros: number;
            total: number;
        };
        atributos: {
            limitePeEaPorTurno: number;
            prestigioGeral: number;
            prestigioCla: number | null;
            deslocamento: number;
            esquiva: number;
            bloqueio: number;
            turnosMorrendo: number;
            turnosEnlouquecendo: number;
        };
        personagemBase: {
            id: number;
            nome: string;
        };
        dono: {
            id: number;
            apelido: string;
        };
        modificadoresAtivos: {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            valor: number;
            criadoPorId: number;
        }[];
    }>;
    desassociarPersonagemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number): Promise<{
        id: number;
        campanhaId: number;
        personagemBaseId: number;
        message: string;
    }>;
    atualizarRecursosPersonagemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: AtualizarRecursosPersonagemCampanhaDto): Promise<{
        id: number;
        campanhaId: number;
        personagemBaseId: number;
        donoId: number;
        nome: string;
        nivel: number;
        recursos: {
            pvAtual: number;
            pvMax: number;
            peAtual: number;
            peMax: number;
            eaAtual: number;
            eaMax: number;
            sanAtual: number;
            sanMax: number;
        };
        defesa: {
            base: number;
            equipamento: number;
            outros: number;
            total: number;
        };
        atributos: {
            limitePeEaPorTurno: number;
            prestigioGeral: number;
            prestigioCla: number | null;
            deslocamento: number;
            esquiva: number;
            bloqueio: number;
            turnosMorrendo: number;
            turnosEnlouquecendo: number;
        };
        personagemBase: {
            id: number;
            nome: string;
        };
        dono: {
            id: number;
            apelido: string;
        };
        modificadoresAtivos: {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            valor: number;
            criadoPorId: number;
        }[];
    }>;
    listarHistoricoPersonagemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number): Promise<({
        criadoPor: {
            id: number;
            apelido: string;
        } | null;
    } & {
        id: number;
        criadoEm: Date;
        descricao: string | null;
        tipo: string;
        campanhaId: number;
        personagemCampanhaId: number;
        criadoPorId: number | null;
        dados: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
