import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { InventarioService } from '../inventario/inventario.service';
import { CreatePersonagemBaseDto } from './dto/create-personagem-base.dto';
import { UpdatePersonagemBaseDto } from './dto/update-personagem-base.dto';
import { ImportarPersonagemBaseDto } from './dto/importar-personagem-base.dto';
import { PersonagemBaseMapper, PersonagemDetalhadoMapeado } from './personagem-base.mapper';
import { PersonagemBasePersistence } from './personagem-base.persistence';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
type ResumoInventario = {
    espacosBase: number;
    espacosExtra: number;
    espacosTotal: number;
    espacosOcupados: number;
    espacosDisponiveis: number;
    sobrecarregado: boolean;
    quantidadeItens: number;
};
type PersonagemDetalhadoComInventario = PersonagemDetalhadoMapeado & {
    inventario?: ResumoInventario;
};
type ErroItemPreview = {
    equipamentoId: number;
    erro: string;
};
export declare class PersonagemBaseService {
    private readonly prisma;
    private readonly mapper;
    private readonly persistence;
    private readonly inventarioService;
    constructor(prisma: PrismaService, mapper: PersonagemBaseMapper, persistence: PersonagemBasePersistence, inventarioService: InventarioService);
    private limparUndefined;
    private jsonToStringArray;
    private validarAtributoChaveEa;
    private getPassivasIdsFromRelacao;
    private getPoderesFromRelacao;
    private limparUndefinedDeepJson;
    private isRecord;
    private getNestedRecord;
    private getNumberField;
    private getBooleanField;
    private extrairItensPreviewInventario;
    private removerItensInventarioDoDto;
    private sincronizarItensInventarioNoUpdate;
    private resolverIdComReferencia;
    private resolverPoderesGenericosImportacao;
    private resolverPassivasImportacao;
    private resolverItensInventarioImportacao;
    private montarDtoParaImportacao;
    private validarItensInventarioNoPreview;
    private filtrarTecnicaPorGraus;
    private listarTecnicasNaoInatasAtivasPorGraus;
    private buscarTecnicaInataAtivaPorGraus;
    private buscarHabilidadesPersonagem;
    private calcularModificadoresDerivadosPorHabilidades;
    private executarEngine;
    private montarDtoCompletoParaUpdate;
    private calcularResumoInventario;
    preview(donoId: number, dto: CreatePersonagemBaseDto): Promise<{
        proficienciasExtrasCodigos: string[];
        passivasNeedsChoice: boolean | undefined;
        passivasElegiveis: unknown;
        passivasAtributosAtivos: import("@prisma/client").$Enums.AtributoBase[];
        passivasAtributoIds: number[];
        passivasAtributosConfig: import("./dto/create-personagem-base.dto").PassivasAtributoConfigDto;
        poderesGenericos: {
            habilidadeId: number;
            config: Prisma.JsonValue;
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
            escalonamentoPorNivel: Prisma.JsonValue | null;
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
                    requisitos: Prisma.JsonValue | null;
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
                    dadosDano: Prisma.JsonValue | null;
                    escalonaPorGrau: boolean | null;
                    escalonamentoCustoEA: number | null;
                    escalonamentoCustoPE: number | null;
                    escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade | null;
                    escalonamentoEfeito: Prisma.JsonValue | null;
                    escalonamentoDano: Prisma.JsonValue | null;
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
                requisitos: Prisma.JsonValue | null;
                codigo: string;
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
                testesExigidos: Prisma.JsonValue | null;
                danoFlat: number | null;
                danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
                dadosDano: Prisma.JsonValue | null;
                escalonaPorGrau: boolean;
                grauTipoGrauCodigo: string | null;
                escalonamentoCustoEA: number;
                escalonamentoCustoPE: number;
                escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade;
                escalonamentoEfeito: Prisma.JsonValue | null;
                escalonamentoDano: Prisma.JsonValue | null;
            })[];
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            fonte: import("@prisma/client").$Enums.TipoFonte;
            suplementoId: number | null;
            requisitos: Prisma.JsonValue | null;
            codigo: string;
            tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
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
                    requisitos: Prisma.JsonValue | null;
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
                    dadosDano: Prisma.JsonValue | null;
                    escalonaPorGrau: boolean | null;
                    escalonamentoCustoEA: number | null;
                    escalonamentoCustoPE: number | null;
                    escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade | null;
                    escalonamentoEfeito: Prisma.JsonValue | null;
                    escalonamentoDano: Prisma.JsonValue | null;
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
                requisitos: Prisma.JsonValue | null;
                codigo: string;
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
                testesExigidos: Prisma.JsonValue | null;
                danoFlat: number | null;
                danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
                dadosDano: Prisma.JsonValue | null;
                escalonaPorGrau: boolean;
                grauTipoGrauCodigo: string | null;
                escalonamentoCustoEA: number;
                escalonamentoCustoPE: number;
                escalonamentoTipo: import("@prisma/client").$Enums.TipoEscalonamentoHabilidade;
                escalonamentoEfeito: Prisma.JsonValue | null;
                escalonamentoDano: Prisma.JsonValue | null;
            })[];
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            fonte: import("@prisma/client").$Enums.TipoFonte;
            suplementoId: number | null;
            requisitos: Prisma.JsonValue | null;
            codigo: string;
            tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
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
        errosItens: ErroItemPreview[] | undefined;
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
    criar(donoId: number, dto: CreatePersonagemBaseDto): Promise<{
        id: number;
        nome: string;
        nivel: number;
        cla: string;
        origem: string;
        classe: string;
        trilha: string | null;
        caminho: string | null;
    }>;
    listarDoUsuario(donoId: number, page?: number, limit?: number): Promise<any[] | PaginatedResult<any>>;
    buscarPorId(donoId: number, id: number, incluirInventario?: boolean): Promise<PersonagemDetalhadoComInventario>;
    exportar(donoId: number, id: number): Promise<{
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
    importar(donoId: number, dtoImportacao: ImportarPersonagemBaseDto): Promise<{
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
    atualizar(donoId: number, id: number, dto: UpdatePersonagemBaseDto): Promise<{
        id: number;
        nome: string;
        nivel: number;
        cla: string;
        classe: string;
    }>;
    remover(donoId: number, id: number): Promise<{
        sucesso: boolean;
    }>;
    consultarInfoGrausTreinamento(nivel: number, intelecto: number): {
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
    consultarPericiasElegiveis(periciasComGrauInicial: string[]): Promise<Array<{
        codigo: string;
        nome: string;
        atributoBase: string;
        grauAtual: number;
    }>>;
    listarTecnicasDisponveis(claId: number, origemId?: number): Promise<{
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
    listarPassivasDisponiveis(): Promise<Record<string, {
        id: number;
        codigo: string;
        nome: string;
        nivel: number;
        requisito: number | null;
        descricao: string | null;
        efeitos: Prisma.JsonValue | null;
    }[]>>;
}
export {};
