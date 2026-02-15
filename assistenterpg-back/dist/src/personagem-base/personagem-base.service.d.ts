import { PrismaService } from '../prisma/prisma.service';
import { InventarioService } from '../inventario/inventario.service';
import { CreatePersonagemBaseDto, GrauTreinamentoDto } from './dto/create-personagem-base.dto';
import { UpdatePersonagemBaseDto } from './dto/update-personagem-base.dto';
import { PersonagemBaseMapper } from './personagem-base.mapper';
import { PersonagemBasePersistence } from './personagem-base.persistence';
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
    private buscarHabilidadesPersonagem;
    private calcularModificadoresDerivadosPorHabilidades;
    private executarEngine;
    private montarDtoCompletoParaUpdate;
    private calcularResumoInventario;
    preview(donoId: number, dto: CreatePersonagemBaseDto): Promise<{
        proficienciasExtrasCodigos: any;
        passivasNeedsChoice: any;
        passivasElegiveis: any;
        passivasAtributosAtivos: import("@prisma/client").$Enums.AtributoBase[];
        passivasAtributoIds: number[];
        passivasAtributosConfig: any;
        poderesGenericos: {
            habilidadeId: number;
            config: any;
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
            escalonamentoPorNivel: any;
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
        itensInventario: any[];
        errosItens: any[] | undefined;
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
        grausTreinamento?: GrauTreinamentoDto[];
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
    listarDoUsuario(donoId: number): Promise<{
        id: any;
        nome: any;
        nivel: any;
        cla: any;
        classe: any;
    }[]>;
    buscarPorId(donoId: number, id: number, incluirInventario?: boolean): Promise<any>;
    atualizar(donoId: number, id: number, dto: UpdatePersonagemBaseDto): Promise<{
        id: any;
        nome: any;
        nivel: any;
        cla: any;
        classe: any;
    }>;
    remover(donoId: number, id: number): Promise<{
        sucesso: boolean;
    }>;
    consultarInfoGrausTreinamento(nivel: number, intelecto: number): Promise<{
        niveisDisponiveis: Array<{
            nivel: number;
            maxMelhorias: number;
        }>;
        limitesGrau: {
            graduado: number;
            veterano: number;
            expert: number;
        };
    }>;
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
    listarPassivasDisponiveis(): Promise<Record<string, any>>;
}
