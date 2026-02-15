import { PersonagemBaseService } from './personagem-base.service';
import { CreatePersonagemBaseDto } from './dto/create-personagem-base.dto';
import { UpdatePersonagemBaseDto } from './dto/update-personagem-base.dto';
import { ConsultarInfoGrausTreinamentoDto, ConsultarPericiasElegiveisDto } from './dto/consultar-graus-treinamento.dto';
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
        grausTreinamento?: import("./dto/create-personagem-base.dto").GrauTreinamentoDto[];
        periciasClasseEscolhidasCodigos: string[];
        periciasOrigemEscolhidasCodigos: string[];
        periciasLivresCodigos: string[];
        periciasLivresExtras?: number;
    }>;
    consultarInfoGrausTreinamento(query: ConsultarInfoGrausTreinamentoDto): Promise<{
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
    consultarPericiasElegiveis(body: ConsultarPericiasElegiveisDto): Promise<{
        codigo: string;
        nome: string;
        atributoBase: string;
        grauAtual: number;
    }[]>;
    listarPassivasDisponiveis(): Promise<Record<string, any>>;
    listarTecnicasDisponiveis(claId: number, origemId?: string): Promise<{
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
    }): Promise<{
        id: any;
        nome: any;
        nivel: any;
        cla: any;
        classe: any;
    }[]>;
    buscarPorId(req: {
        user: {
            id: number;
        };
    }, id: number, incluirInventario?: string): Promise<any>;
    atualizar(req: {
        user: {
            id: number;
        };
    }, id: number, dto: UpdatePersonagemBaseDto): Promise<{
        id: any;
        nome: any;
        nivel: any;
        cla: any;
        classe: any;
    }>;
    remover(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        sucesso: boolean;
    }>;
}
