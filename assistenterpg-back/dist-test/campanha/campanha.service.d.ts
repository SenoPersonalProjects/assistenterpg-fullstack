import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import { AdicionarItemInventarioCampanhaDto, AtualizarItemInventarioCampanhaDto, AplicarModificacaoInventarioCampanhaDto } from './dto/inventario-campanha.dto';
import { FiltrosListarModificadoresCampanha, PapelCampanha } from './engine/campanha.engine.types';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaPersonagensService } from './campanha.personagens.service';
import { CampanhaModificadoresService } from './campanha.modificadores.service';
import { CampanhaConvitesService } from './campanha.convites.service';
import { CampanhaInventarioService } from './campanha.inventario.service';
export declare class CampanhaService {
    private readonly prisma;
    private readonly accessService;
    private readonly personagensService;
    private readonly modificadoresService;
    private readonly convitesService;
    private readonly inventarioService;
    constructor(prisma: PrismaService, accessService: CampanhaAccessService, personagensService: CampanhaPersonagensService, modificadoresService: CampanhaModificadoresService, convitesService: CampanhaConvitesService, inventarioService: CampanhaInventarioService);
    criarCampanha(donoId: number, dto: {
        nome: string;
        descricao?: string;
    }): Promise<{
        _count: {
            membros: number;
            personagens: number;
            sessoes: number;
        };
        dono: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        donoId: number;
        nome: string;
        descricao: string | null;
        status: string;
    }>;
    listarMinhasCampanhas(usuarioId: number, page?: number, limit?: number): Promise<any[] | PaginatedResult<any>>;
    buscarPorIdParaUsuario(id: number, usuarioId: number): Promise<{
        _count: {
            personagens: number;
            sessoes: number;
        };
        membros: ({
            usuario: {
                id: number;
                apelido: string;
            };
        } & {
            id: number;
            usuarioId: number;
            campanhaId: number;
            papel: string;
            entrouEm: Date;
        })[];
        dono: {
            id: number;
            apelido: string;
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        donoId: number;
        nome: string;
        descricao: string | null;
        status: string;
    }>;
    excluirCampanha(campanhaId: number, usuarioId: number): Promise<{
        message: string;
        id: number;
    }>;
    listarMembros(campanhaId: number, usuarioId: number): Promise<({
        usuario: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    })[]>;
    adicionarMembro(campanhaId: number, solicitanteId: number, dados: {
        usuarioId: number;
        papel: PapelCampanha;
    }): Promise<{
        usuario: {
            id: number;
            email: string;
            apelido: string;
        };
    } & {
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    }>;
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
    buscarInventarioPersonagemCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number): Promise<{
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
    adicionarItemInventarioCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: AdicionarItemInventarioCampanhaDto): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
    atualizarItemInventarioCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number, dto: AtualizarItemInventarioCampanhaDto): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
    removerItemInventarioCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number): Promise<{
        sucesso: boolean;
    }>;
    aplicarModificacaoInventarioCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number, dto: AplicarModificacaoInventarioCampanhaDto): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
    removerModificacaoInventarioCampanha(campanhaId: number, personagemCampanhaId: number, usuarioId: number, itemId: number, modificacaoId: number): Promise<import("../inventario/dto/inventario-completo.dto").ItemInventarioDto>;
    criarConvitePorEmail(campanhaId: number, donoId: number, email: string, papel: PapelCampanha): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        papel: string;
        respondidoEm: Date | null;
    }>;
    listarConvitesPendentesPorUsuario(usuarioId: number): Promise<({
        campanha: {
            id: number;
            nome: string;
            dono: {
                apelido: string;
            };
        };
    } & {
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        papel: string;
        respondidoEm: Date | null;
    })[]>;
    aceitarConvite(codigo: string, usuarioId: number): Promise<{
        id: number;
        usuarioId: number;
        campanhaId: number;
        papel: string;
        entrouEm: Date;
    }>;
    recusarConvite(codigo: string, usuarioId: number): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        codigo: string;
        campanhaId: number;
        papel: string;
        respondidoEm: Date | null;
    }>;
}
