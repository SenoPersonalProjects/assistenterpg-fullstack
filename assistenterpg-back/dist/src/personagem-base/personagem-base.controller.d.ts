import { PersonagemBaseService } from './personagem-base.service';
import { CreatePersonagemBaseDto } from './dto/create-personagem-base.dto';
import { UpdatePersonagemBaseDto } from './dto/update-personagem-base.dto';
import { ImportarPersonagemBaseDto } from './dto/importar-personagem-base.dto';
import { ConsultarInfoGrausTreinamentoDto, ConsultarPericiasElegiveisDto } from './dto/consultar-graus-treinamento.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
export declare class PersonagemBaseController {
    private readonly personagemBaseService;
    constructor(personagemBaseService: PersonagemBaseService);
    criar(req: {
        user: {
            id: number;
        };
    }, dto: CreatePersonagemBaseDto): Promise<{
        id: number;
        nome: string;
        nivel: number;
        cla: string;
        origem: string;
        classe: string;
        trilha: string | null;
        caminho: string | null;
    }>;
    preview(req: {
        user: {
            id: number;
        };
    }, dto: CreatePersonagemBaseDto): Promise<{
        proficienciasExtrasCodigos: string[];
        passivasNeedsChoice: boolean | undefined;
        passivasElegiveis: unknown;
        passivasAtributosAtivos: import("@prisma/client").$Enums.AtributoBase[];
        passivasAtributoIds: number[];
        passivasAtributosConfig: import("./dto/create-personagem-base.dto").PassivasAtributoConfigDto;
        poderesGenericos: {
            habilidadeId: number;
            config: import("@prisma/client/runtime/library").JsonValue;
        }[];
        pericias: {
            codigo: string;
            nome: string;
            atributoBase: import("@prisma/client").$Enums.AtributoBase;
            grauTreinamento: number;
            bonusExtra: number;
            bonusTotal: number;
        }[];
        grausAprimoramento: {
            tipoGrauCodigo: string;
            tipoGrauNome: string;
            valor: number;
        }[];
        proficiencias: {
            codigo: string;
            nome: string;
            tipo: string;
            categoria: string;
            subtipo: string | null;
        }[];
        habilidadesAtivas: string[];
        bonusHabilidades: {
            habilidadeNome: string;
            tipoGrauCodigo: string;
            valor: number;
            escalonamentoPorNivel: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        atributosDerivados: {
            pvMaximo: number;
            peMaximo: number;
            eaMaximo: number;
            sanMaximo: number;
            defesaBase: number;
            defesaEquipamento: number;
            defesaTotal: number;
            deslocamento: number;
            limitePeEaPorTurno: number;
            reacoesBasePorTurno: number;
            turnosMorrendo: number;
            turnosEnlouquecendo: number;
            bloqueio: number;
            esquiva: number;
        };
        tecnicasNaoInatas: ({
            habilidades: ({
                variacoes: {
                    id: number;
                    criadoEm: Date;
                    atualizadoEm: Date;
                    nome: string;
                    descricao: string;
                    requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                    ordem: number;
                    criticoValor: number | null;
                    criticoMultiplicador: number | null;
                    alcance: string | null;
                    execucao: import("@prisma/client").$Enums.TipoExecucao | null;
                    area: import("@prisma/client").$Enums.AreaEfeito | null;
                    alvo: string | null;
                    duracao: string | null;
                    resistencia: string | null;
                    dtResistencia: string | null;
                    custoPE: number | null;
                    custoEA: number | null;
                    custoSustentacaoEA: number | null;
                    custoSustentacaoPE: number | null;
                    danoFlat: number | null;
                    danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
                    dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
                    escalonaPorGrau: boolean | null;
                    escalonamentoCustoEA: number | null;
                    escalonamentoCustoPE: number | null;
                    escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade | null;
                    escalonamentoEfeito: import("@prisma/client/runtime/library").JsonValue | null;
                    escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
                    habilidadeTecnicaId: number;
                    substituiCustos: boolean;
                    efeitoAdicional: string | null;
                }[];
            } & {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string;
                codigo: string;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                ordem: number;
                criticoValor: number | null;
                criticoMultiplicador: number | null;
                alcance: string | null;
                efeito: string;
                tecnicaId: number;
                execucao: import("@prisma/client").$Enums.TipoExecucao;
                area: import("@prisma/client").$Enums.AreaEfeito | null;
                alvo: string | null;
                duracao: string | null;
                resistencia: string | null;
                dtResistencia: string | null;
                custoPE: number;
                custoEA: number;
                custoSustentacaoEA: number | null;
                custoSustentacaoPE: number | null;
                testesExigidos: import("@prisma/client/runtime/library").JsonValue | null;
                danoFlat: number | null;
                danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
                dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
                escalonaPorGrau: boolean;
                grauTipoGrauCodigo: string | null;
                escalonamentoCustoEA: number;
                escalonamentoCustoPE: number;
                escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade;
                escalonamentoEfeito: import("@prisma/client/runtime/library").JsonValue | null;
                escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
            codigo: string;
            fonte: import("@prisma/client").$Enums.TipoFonte;
            suplementoId: number | null;
            requisitos: import("@prisma/client/runtime/library").JsonValue | null;
            hereditaria: boolean;
            linkExterno: string | null;
        })[];
        tecnicaInata: ({
            habilidades: ({
                variacoes: {
                    id: number;
                    criadoEm: Date;
                    atualizadoEm: Date;
                    nome: string;
                    descricao: string;
                    requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                    ordem: number;
                    criticoValor: number | null;
                    criticoMultiplicador: number | null;
                    alcance: string | null;
                    execucao: import("@prisma/client").$Enums.TipoExecucao | null;
                    area: import("@prisma/client").$Enums.AreaEfeito | null;
                    alvo: string | null;
                    duracao: string | null;
                    resistencia: string | null;
                    dtResistencia: string | null;
                    custoPE: number | null;
                    custoEA: number | null;
                    custoSustentacaoEA: number | null;
                    custoSustentacaoPE: number | null;
                    danoFlat: number | null;
                    danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
                    dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
                    escalonaPorGrau: boolean | null;
                    escalonamentoCustoEA: number | null;
                    escalonamentoCustoPE: number | null;
                    escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade | null;
                    escalonamentoEfeito: import("@prisma/client/runtime/library").JsonValue | null;
                    escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
                    habilidadeTecnicaId: number;
                    substituiCustos: boolean;
                    efeitoAdicional: string | null;
                }[];
            } & {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string;
                codigo: string;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                ordem: number;
                criticoValor: number | null;
                criticoMultiplicador: number | null;
                alcance: string | null;
                efeito: string;
                tecnicaId: number;
                execucao: import("@prisma/client").$Enums.TipoExecucao;
                area: import("@prisma/client").$Enums.AreaEfeito | null;
                alvo: string | null;
                duracao: string | null;
                resistencia: string | null;
                dtResistencia: string | null;
                custoPE: number;
                custoEA: number;
                custoSustentacaoEA: number | null;
                custoSustentacaoPE: number | null;
                testesExigidos: import("@prisma/client/runtime/library").JsonValue | null;
                danoFlat: number | null;
                danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
                dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
                escalonaPorGrau: boolean;
                grauTipoGrauCodigo: string | null;
                escalonamentoCustoEA: number;
                escalonamentoCustoPE: number;
                escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade;
                escalonamentoEfeito: import("@prisma/client/runtime/library").JsonValue | null;
                escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
            codigo: string;
            fonte: import("@prisma/client").$Enums.TipoFonte;
            suplementoId: number | null;
            requisitos: import("@prisma/client/runtime/library").JsonValue | null;
            hereditaria: boolean;
            linkExterno: string | null;
        }) | null;
        grausLivresInfo: {
            base: number;
            deHabilidades: number;
            deIntelecto: number;
            total: number;
            gastos: number;
        };
        periciasLivresInfo: {
            base: number;
            deIntelecto: number;
            total: number;
        };
        espacosInventario: {
            base: number;
            extra: number;
            total: number;
        };
        resistencias: {
            codigo: string;
            nome: string;
            descricao: string | null;
            valor: number;
        }[];
        itensInventario: unknown[];
        errosItens: {
            equipamentoId: number;
            erro: string;
        }[] | undefined;
        nome: string;
        nivel: number;
        claId: number;
        origemId: number;
        classeId: number;
        trilhaId?: number | null;
        caminhoId?: number | null;
        agilidade: number;
        forca: number;
        intelecto: number;
        presenca: number;
        vigor: number;
        estudouEscolaTecnica: boolean;
        idade?: number | null;
        prestigioBase?: number;
        prestigioClaBase?: number | null;
        alinhamentoId?: number | null;
        background?: string | null;
        atributoChaveEa: import("./dto/create-personagem-base.dto").AtributoBaseEACodigo;
        tecnicaInataId?: number | null;
        proficienciasCodigos: string[];
        grausTreinamento?: import("./dto/create-personagem-base.dto").GrauTreinamentoDto[];
        periciasClasseEscolhidasCodigos: string[];
        periciasOrigemEscolhidasCodigos: string[];
        periciasLivresCodigos: string[];
        periciasLivresExtras?: number;
    }>;
    consultarInfoGrausTreinamento(query: ConsultarInfoGrausTreinamentoDto): {
        niveisDisponiveis: Array<{
            nivel: number;
            maxMelhorias: number;
        }>;
        limitesGrau: {
            graduado: number;
            veterano: number;
            expert: number;
        };
    };
    consultarPericiasElegiveis(body: ConsultarPericiasElegiveisDto): Promise<{
        codigo: string;
        nome: string;
        atributoBase: string;
        grauAtual: number;
    }[]>;
    listarPassivasDisponiveis(): Promise<Record<string, {
        id: number;
        codigo: string;
        nome: string;
        nivel: number;
        requisito: number | null;
        descricao: string | null;
        efeitos: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>>;
    listarTecnicasDisponiveis(claId: number, origemId?: number): Promise<{
        hereditarias: {
            id: number;
            nome: string;
            descricao: string;
            codigo: string;
            hereditaria: boolean;
            linkExterno: string | null;
        }[];
        naoHereditarias: {
            id: number;
            nome: string;
            descricao: string;
            codigo: string;
            hereditaria: boolean;
            linkExterno: string | null;
        }[];
        todas: {
            id: number;
            nome: string;
            descricao: string;
            codigo: string;
            hereditaria: boolean;
            linkExterno: string | null;
        }[];
    }>;
    listarMeus(req: {
        user: {
            id: number;
        };
    }, paginacao: PaginationQueryDto): Promise<any[] | import("src/common/dto/pagination-query.dto").PaginatedResult<any>>;
    exportar(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        schema: string;
        schemaVersion: number;
        exportadoEm: string;
        personagem: CreatePersonagemBaseDto;
        referencias: {
            personagemIdOriginal: number;
            cla: {
                id: number;
                nome: string;
            } | null;
            origem: {
                id: number;
                nome: string;
            } | null;
            classe: {
                id: number;
                nome: string;
            } | null;
            trilha: {
                id: number;
                nome: string;
            } | null;
            caminho: {
                id: number;
                nome: string;
            } | null;
            alinhamento: {
                id: number;
                nome: string;
            } | null;
            tecnicaInata: {
                id: number;
                codigo: string;
                nome: string;
            } | null;
            poderesGenericos: {
                index: number;
                habilidadeId: number;
                habilidadeNome: string;
            }[];
            passivas: {
                index: number;
                passivaId: number;
                codigo: string;
                nome: string;
            }[];
            itensInventario: {
                index: number;
                equipamentoId: number;
                equipamentoCodigo: string;
                equipamentoNome: string;
                modificacoes: {
                    index: number;
                    modificacaoId: number;
                    codigo: string;
                    nome: string;
                }[];
            }[];
        };
    }>;
    importar(req: {
        user: {
            id: number;
        };
    }, dto: ImportarPersonagemBaseDto): Promise<{
        importado: boolean;
        schema: string;
        schemaVersion: number;
        importadoEm: string;
        id: number;
        nome: string;
        nivel: number;
        cla: string;
        origem: string;
        classe: string;
        trilha: string | null;
        caminho: string | null;
    }>;
    buscarPorId(req: {
        user: {
            id: number;
        };
    }, id: number, incluirInventario?: string): Promise<import("./personagem-base.mapper").PersonagemDetalhadoMapeado & {
        inventario?: {
            espacosBase: number;
            espacosExtra: number;
            espacosTotal: number;
            espacosOcupados: number;
            espacosDisponiveis: number;
            sobrecarregado: boolean;
            quantidadeItens: number;
        };
    }>;
    atualizar(req: {
        user: {
            id: number;
        };
    }, id: number, dto: UpdatePersonagemBaseDto): Promise<{
        id: number;
        nome: string;
        nivel: number;
        cla: string;
        classe: string;
    }>;
    remover(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        sucesso: boolean;
    }>;
}
