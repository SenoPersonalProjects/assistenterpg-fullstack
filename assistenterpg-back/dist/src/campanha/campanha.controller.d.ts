import { CampanhaService } from './campanha.service';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { AddMembroDto } from './dto/add-membro.dto';
import { CreateConviteDto } from './dto/create-convite.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { VincularPersonagemCampanhaDto } from './dto/vincular-personagem-campanha.dto';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { DesfazerModificadorPersonagemCampanhaDto } from './dto/desfazer-modificador-personagem-campanha.dto';
export declare class CampanhaController {
    private readonly campanhaService;
    constructor(campanhaService: CampanhaService);
    criar(req: {
        user: {
            id: number;
        };
    }, dto: CreateCampanhaDto): Promise<{
        _count: {
            membros: number;
            personagens: number;
            sessoes: number;
        };
        dono: {
            id: number;
            apelido: string;
            email: string;
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
    listarMinhas(req: {
        user: {
            id: number;
        };
    }, paginacao: PaginationQueryDto): Promise<any[] | import("src/common/dto/pagination-query.dto").PaginatedResult<any>>;
    detalhar(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
            campanhaId: number;
            usuarioId: number;
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
    excluir(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
        message: string;
        id: number;
    }>;
    listarMembros(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<({
        usuario: {
            id: number;
            apelido: string;
            email: string;
        };
    } & {
        id: number;
        campanhaId: number;
        usuarioId: number;
        papel: string;
        entrouEm: Date;
    })[]>;
    adicionarMembro(id: number, req: {
        user: {
            id: number;
        };
    }, dto: AddMembroDto): Promise<{
        usuario: {
            id: number;
            apelido: string;
            email: string;
        };
    } & {
        id: number;
        campanhaId: number;
        usuarioId: number;
        papel: string;
        entrouEm: Date;
    }>;
    listarPersonagensCampanha(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
            valor: number;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            criadoPorId: number;
        }[];
    }[]>;
    listarPersonagensBaseDisponiveis(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        nome: string;
        nivel: number;
        donoId: number;
        dono: {
            id: number;
            apelido: string;
        };
    }[]>;
    vincularPersonagemCampanha(id: number, req: {
        user: {
            id: number;
        };
    }, dto: VincularPersonagemCampanhaDto): Promise<{
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
            valor: number;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            criadoPorId: number;
        }[];
    }>;
    atualizarRecursosPersonagemCampanha(id: number, personagemCampanhaId: number, req: {
        user: {
            id: number;
        };
    }, dto: AtualizarRecursosPersonagemCampanhaDto): Promise<{
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
            valor: number;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
            criadoPorId: number;
        }[];
    }>;
    listarModificadoresPersonagemCampanha(id: number, personagemCampanhaId: number, req: {
        user: {
            id: number;
        };
    }, incluirInativos?: string): Promise<{
        id: number;
        campanhaId: number;
        personagemCampanhaId: number;
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
    aplicarModificadorPersonagemCampanha(id: number, personagemCampanhaId: number, req: {
        user: {
            id: number;
        };
    }, dto: AplicarModificadorPersonagemCampanhaDto): Promise<{
        modificador: {
            id: number;
            criadoEm: Date;
            nome: string;
            descricao: string | null;
            campanhaId: number;
            personagemCampanhaId: number;
            valor: number;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
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
                valor: number;
                campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
                criadoPorId: number;
            }[];
        };
    }>;
    desfazerModificadorPersonagemCampanha(id: number, personagemCampanhaId: number, modificadorId: number, req: {
        user: {
            id: number;
        };
    }, dto: DesfazerModificadorPersonagemCampanhaDto): Promise<{
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
            personagemCampanhaId: number;
            valor: number;
            campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
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
                valor: number;
                campo: import("@prisma/client").$Enums.CampoModificadorPersonagemCampanha;
                criadoPorId: number;
            }[];
        };
    }>;
    listarHistoricoPersonagemCampanha(id: number, personagemCampanhaId: number, req: {
        user: {
            id: number;
        };
    }): Promise<({
        criadoPor: {
            id: number;
            apelido: string;
        } | null;
    } & {
        id: number;
        criadoEm: Date;
        descricao: string | null;
        campanhaId: number;
        personagemCampanhaId: number;
        dados: import("@prisma/client/runtime/library").JsonValue | null;
        tipo: string;
        criadoPorId: number | null;
    })[]>;
    criarConvite(id: number, req: {
        user: {
            id: number;
        };
    }, dto: CreateConviteDto): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        campanhaId: number;
        papel: string;
        codigo: string;
        respondidoEm: Date | null;
    }>;
    listarConvitesPendentes(req: {
        user: {
            id: number;
        };
    }): Promise<({
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
        campanhaId: number;
        papel: string;
        codigo: string;
        respondidoEm: Date | null;
    })[]>;
    aceitarConvite(codigo: string, req: {
        user: {
            id: number;
        };
    }): Promise<any>;
    recusarConvite(codigo: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        email: string;
        criadoEm: Date;
        status: string;
        campanhaId: number;
        papel: string;
        codigo: string;
        respondidoEm: Date | null;
    }>;
}
