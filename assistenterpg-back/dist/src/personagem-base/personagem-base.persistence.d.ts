import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EngineResult } from './engine/personagem-base.engine.types';
type PrismaLike = PrismaService | Prisma.TransactionClient;
type PericiaStatePersist = {
    periciaId: number;
    grauTreinamento: number;
    bonusExtra: number;
};
type PersistenciaEstado = Pick<EngineResult, 'profsFinais' | 'grausFinais' | 'periciasMapCodigo' | 'grausTreinamento' | 'habilidadesParaPersistir' | 'poderesGenericosNormalizados' | 'passivasResolvidas' | 'passivasAtributosConfigLimpo' | 'dtoNormalizado' | 'resistenciasFinais'> & {
    tecnicasNaoInatasIds: number[];
};
declare const personagemCriadoInclude: {
    cla: true;
    origem: true;
    classe: true;
    trilha: true;
    caminho: true;
    resistencias: {
        include: {
            resistenciaTipo: true;
        };
    };
    inventarioItens: {
        include: {
            equipamento: true;
            modificacoes: {
                include: {
                    modificacao: true;
                };
            };
        };
    };
};
export type PersonagemCriadoEntity = Prisma.PersonagemBaseGetPayload<{
    include: typeof personagemCriadoInclude;
}>;
export declare class PersonagemBasePersistence {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criarComEstado(params: {
        donoId: number;
        dataBase: Record<string, unknown>;
        estado: {
            profsFinais: string[];
            grausFinais: Array<{
                tipoGrauCodigo: string;
                valor: number;
            }>;
            periciasMapCodigo: Map<string, PericiaStatePersist>;
            grausTreinamento?: Array<{
                nivel: number;
                melhorias: Array<{
                    periciaCodigo: string;
                    grauAnterior: number;
                    grauNovo: number;
                }>;
            }>;
            habilidadesParaPersistir: Array<{
                habilidadeId: number;
            }>;
            poderesGenericosNormalizados: Array<{
                habilidadeId: number;
                config: Prisma.JsonValue;
            }>;
            passivasResolvidas: PersistenciaEstado['passivasResolvidas'];
            passivasAtributosConfigLimpo?: PersistenciaEstado['passivasAtributosConfigLimpo'];
            dtoNormalizado: PersistenciaEstado['dtoNormalizado'];
            resistenciasFinais: Map<string, number>;
            tecnicasNaoInatasIds: number[];
        };
    }, prisma?: PrismaLike): Promise<PersonagemCriadoEntity>;
    atualizarRebuildComEstado(params: {
        id: number;
        dataUpdateBase: Record<string, unknown>;
        estado: {
            profsFinais: string[];
            grausFinais: Array<{
                tipoGrauCodigo: string;
                valor: number;
            }>;
            periciasMapCodigo: Map<string, PericiaStatePersist>;
            grausTreinamento?: Array<{
                nivel: number;
                melhorias: Array<{
                    periciaCodigo: string;
                    grauAnterior: number;
                    grauNovo: number;
                }>;
            }>;
            habilidadesParaPersistir: Array<{
                habilidadeId: number;
            }>;
            poderesGenericosNormalizados: Array<{
                habilidadeId: number;
                config: Prisma.JsonValue;
            }>;
            passivasResolvidas: {
                passivaIds: number[];
            };
            resistenciasFinais: Map<string, number>;
            dtoNormalizado: PersistenciaEstado['dtoNormalizado'];
            tecnicasNaoInatasIds: number[];
        };
    }, prisma?: PrismaLike): Promise<({
        classe: {
            id: number;
            nome: string;
            descricao: string | null;
            periciasLivresBase: number;
            fonte: import("@prisma/client").$Enums.TipoFonte;
            suplementoId: number | null;
        };
        cla: {
            id: number;
            nome: string;
            descricao: string | null;
            fonte: import("@prisma/client").$Enums.TipoFonte;
            suplementoId: number | null;
            grandeCla: boolean;
        };
        resistencias: ({
            resistenciaTipo: {
                id: number;
                nome: string;
                descricao: string | null;
                codigo: string;
            };
        } & {
            id: number;
            valor: number;
            personagemBaseId: number;
            resistenciaTipoId: number;
        })[];
        inventarioItens: ({
            modificacoes: ({
                modificacao: {
                    id: number;
                    criadoEm: Date;
                    atualizadoEm: Date;
                    nome: string;
                    descricao: string | null;
                    fonte: import("@prisma/client").$Enums.TipoFonte;
                    suplementoId: number | null;
                    codigo: string;
                    tipo: import("@prisma/client").$Enums.TipoModificacao;
                    incrementoEspacos: number;
                    restricoes: Prisma.JsonValue | null;
                    efeitosMecanicos: Prisma.JsonValue | null;
                };
            } & {
                id: number;
                itemId: number;
                modificacaoId: number;
            })[];
            equipamento: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                codigo: string;
                tipo: import("@prisma/client").$Enums.TipoEquipamento;
                penalidadeCarga: number;
                bonusDefesa: number;
                categoria: import("@prisma/client").$Enums.CategoriaEquipamento;
                espacos: number;
                proficienciaArma: import("@prisma/client").$Enums.ProficienciaArma | null;
                empunhaduras: Prisma.JsonValue | null;
                tipoArma: import("@prisma/client").$Enums.TipoArma | null;
                subtipoDistancia: import("@prisma/client").$Enums.SubtipoArmaDistancia | null;
                agil: boolean;
                criticoValor: number | null;
                criticoMultiplicador: number | null;
                alcance: import("@prisma/client").$Enums.AlcanceArma | null;
                tipoMunicaoCodigo: string | null;
                habilidadeEspecial: string | null;
                duracaoCenas: number | null;
                recuperavel: boolean;
                proficienciaProtecao: import("@prisma/client").$Enums.ProficienciaProtecao | null;
                tipoProtecao: import("@prisma/client").$Enums.TipoProtecao | null;
                tipoAcessorio: import("@prisma/client").$Enums.TipoAcessorio | null;
                periciaBonificada: string | null;
                bonusPericia: number;
                requereEmpunhar: boolean;
                maxVestimentas: number;
                tipoExplosivo: import("@prisma/client").$Enums.TipoExplosivo | null;
                tipoUso: import("@prisma/client").$Enums.TipoUsoEquipamento | null;
                tipoAmaldicoado: import("@prisma/client").$Enums.TipoAmaldicoado | null;
                efeito: string | null;
                complexidadeMaldicao: import("@prisma/client").$Enums.ComplexidadeMaldicao;
                efeitoMaldicao: string | null;
                requerFerramentasAmaldicoadas: boolean;
            };
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            personagemBaseId: number;
            equipamentoId: number;
            quantidade: number;
            equipado: boolean;
            nomeCustomizado: string | null;
            notas: string | null;
            espacosCalculados: number;
            categoriaCalculada: import("@prisma/client").$Enums.CategoriaEquipamento;
        })[];
    } & {
        id: number;
        donoId: number;
        nome: string;
        nivel: number;
        claId: number;
        origemId: number;
        classeId: number;
        trilhaId: number | null;
        caminhoId: number | null;
        agilidade: number;
        forca: number;
        intelecto: number;
        presenca: number;
        vigor: number;
        estudouEscolaTecnica: boolean;
        tecnicaInataId: number | null;
        passivasAtributosAtivos: Prisma.JsonValue | null;
        passivasAtributosConfig: Prisma.JsonValue | null;
        proficienciasExtrasCodigos: Prisma.JsonValue | null;
        idade: number | null;
        prestigioBase: number;
        prestigioClaBase: number | null;
        alinhamentoId: number | null;
        background: string | null;
        atributoChaveEa: import("@prisma/client").$Enums.AtributoBaseEA;
        espacosInventarioBase: number;
        espacosInventarioExtra: number;
        espacosOcupados: number;
        sobrecarregado: boolean;
        periciasClasseEscolhidasCodigos: Prisma.JsonValue | null;
        periciasOrigemEscolhidasCodigos: Prisma.JsonValue | null;
        periciasLivresCodigos: Prisma.JsonValue | null;
        pvMaximo: number;
        peMaximo: number;
        eaMaximo: number;
        sanMaximo: number;
        defesaBase: number;
        defesaEquipamento: number;
        defesaOutros: number;
        deslocamento: number;
        limitePeEaPorTurno: number;
        reacoesBasePorTurno: number;
        turnosMorrendo: number;
        turnosEnlouquecendo: number;
        bloqueio: number;
        esquiva: number;
    }) | null>;
    private prepararResistenciasParaCriacao;
    private prepararItensInventarioParaCriacao;
}
export {};
