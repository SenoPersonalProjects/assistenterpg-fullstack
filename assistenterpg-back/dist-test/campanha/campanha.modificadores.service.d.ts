import { PrismaService } from '../prisma/prisma.service';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaContextoService } from './campanha.contexto.service';
import { CampanhaMapper } from './campanha.mapper';
import { FiltrosListarModificadoresCampanha } from './engine/campanha.engine.types';
export declare class CampanhaModificadoresService {
    private readonly prisma;
    private readonly accessService;
    private readonly contextoService;
    private readonly mapper;
    constructor(prisma: PrismaService, accessService: CampanhaAccessService, contextoService: CampanhaContextoService, mapper: CampanhaMapper);
    listarModificadoresPersonagemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, incluirInativos?: boolean, filtros?: FiltrosListarModificadoresCampanha): Promise<{
        id: number;
        campanhaId: number;
        personagemCampanhaId: number;
        sessaoId: number | null;
        cenaId: number | null;
        campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
        valor: number;
        nome: string;
        descricao: string | null;
        ativo: boolean;
        criadoEm: Date;
        criadoPorId: number;
        criadoPor: {
            id: number;
            apelido: string;
        };
        desfeitoEm: Date | null;
        desfeitoPorId: number | null;
        desfeitoPor: {
            id: number;
            apelido: string;
        } | null;
        motivoDesfazer: string | null;
    }[]>;
    aplicarModificadorPersonagemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: AplicarModificadorPersonagemCampanhaDto): Promise<{
        modificador: {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campanhaId: number;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            valor: number;
            sessaoId: number | null;
            cenaId: number | null;
            personagemCampanhaId: number;
            ativo: boolean;
            criadoPorId: number;
            desfeitoPorId: number | null;
            desfeitoEm: Date | null;
            motivoDesfazer: string | null;
        };
        personagem: {
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
        };
    }>;
    desfazerModificadorPersonagemCampanha(campanhaId: number, personagemCampanhaId: number, modificadorId: number, usuarioId: number, motivo?: string): Promise<{
        modificador: {
            criadoPor: {
                id: number;
                apelido: string;
            };
            desfeitoPor: {
                id: number;
                apelido: string;
            } | null;
        } & {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campanhaId: number;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            valor: number;
            sessaoId: number | null;
            cenaId: number | null;
            personagemCampanhaId: number;
            ativo: boolean;
            criadoPorId: number;
            desfeitoPorId: number | null;
            desfeitoEm: Date | null;
            motivoDesfazer: string | null;
        };
        personagem: {
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
        };
    }>;
}
