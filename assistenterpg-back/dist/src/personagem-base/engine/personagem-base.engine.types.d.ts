import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AtributoBase } from '@prisma/client';
import { CreatePersonagemBaseDto, GrauTreinamentoDto, PassivasAtributoConfigDto } from '../dto/create-personagem-base.dto';
export type PrismaLike = PrismaService | Prisma.TransactionClient;
export type PericiaState = {
    grauTreinamento: number;
    periciaId: number;
    bonusExtra: number;
};
export type PericiaComCodigo = {
    codigo: string;
    grauTreinamento: number;
};
export type GrauFinal = {
    tipoGrauCodigo: string;
    valor: number;
};
export type PassivasResolvidas = {
    ativos: AtributoBase[];
    passivaIds: number[];
    passivaCodigos: string[];
    needsChoice?: boolean;
    elegiveis?: any;
};
export type HabilidadeComEfeitos = Array<{
    habilidadeId: number;
    habilidade: {
        nome: string;
        tipo?: string;
        mecanicasEspeciais?: any;
        efeitosGrau: Array<{
            tipoGrauCodigo: string;
            valor: number;
            escalonamentoPorNivel: any;
        }>;
    };
}>;
export type ModDerivados = {
    pvPorNivelExtra: number;
    peBaseExtra: number;
    limitePeEaExtra: number;
    defesaExtra: number;
    espacosInventarioExtra: number;
};
export type EngineParams = {
    donoId?: number;
    dto: CreatePersonagemBaseDto;
    strictPassivas: boolean;
    personagemBaseId?: number;
};
export type ItemInventarioCalculado = {
    equipamentoId: number;
    equipamento: {
        id: number;
        codigo: string;
        nome: string;
        tipo: string;
        espacos: number;
        descricao?: string | null;
    };
    quantidade: number;
    equipado: boolean;
    modificacoesIds: number[];
    modificacoes: Array<{
        id: number;
        codigo: string;
        nome: string;
        incrementoEspacos: number;
    }>;
    espacosPorUnidade: number;
    espacosTotal: number;
    nomeCustomizado?: string | null;
    notas?: string | null;
};
export type EngineResult = {
    dtoNormalizado: CreatePersonagemBaseDto;
    passivasResolvidas: PassivasResolvidas;
    passivasAtributosConfigLimpo?: PassivasAtributoConfigDto | null;
    poderesGenericosNormalizados: Array<{
        habilidadeId: number;
        config: any;
    }>;
    periciasMapCodigo: Map<string, PericiaState>;
    periciasComCodigo: PericiaComCodigo[];
    habilidades: HabilidadeComEfeitos;
    habilidadesParaPersistir: Array<{
        habilidadeId: number;
    }>;
    profsFinais: string[];
    grausFinais: GrauFinal[];
    grausTreinamento?: GrauTreinamentoDto[] | undefined;
    derivadosFinais: {
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
    espacosInventario: {
        base: number;
        extra: number;
        total: number;
    };
    resistenciasFinais: Map<string, number>;
    resistenciasDetalhadas: {
        deEquipamentos: Map<string, number>;
        deHabilidades: Map<string, number>;
    };
    itensInventarioCalculados?: ItemInventarioCalculado[];
    bonusHabilidades: Array<{
        habilidadeNome: string;
        tipoGrauCodigo: string;
        valor: number;
        escalonamentoPorNivel: any;
    }>;
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
};
