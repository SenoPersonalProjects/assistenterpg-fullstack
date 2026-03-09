import { CategoriaEquipamento, Prisma, TipoEquipamento, TipoModificacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GrauTreinamentoDto } from './dto/create-personagem-base.dto';
type PrismaLike = PrismaService | Prisma.TransactionClient;
export declare const personagemBaseDetalhadoInclude: {
    cla: true;
    origem: true;
    classe: true;
    trilha: true;
    caminho: true;
    tecnicaInata: true;
    alinhamento: true;
    proficiencias: {
        include: {
            proficiencia: true;
        };
    };
    grausAprimoramento: {
        include: {
            tipoGrau: true;
        };
    };
    pericias: {
        include: {
            pericia: true;
        };
    };
    grausTreinamento: true;
    habilidadesBase: {
        include: {
            habilidade: true;
        };
    };
    passivas: {
        include: {
            passiva: true;
        };
    };
    poderesGenericos: {
        include: {
            habilidade: true;
        };
    };
    resistencias: {
        include: {
            resistenciaTipo: true;
        };
    };
};
export type PersonagemBaseResumoEntity = Prisma.PersonagemBaseGetPayload<{
    include: {
        cla: true;
        classe: true;
    };
}>;
export type PersonagemBaseDetalhadoEntity = Prisma.PersonagemBaseGetPayload<{
    include: typeof personagemBaseDetalhadoInclude;
}>;
type GrauAprimoramentoAjustado = {
    tipoGrauCodigo: string;
    tipoGrauNome: string;
    valorTotal: number;
    valorLivre: number;
    bonus: number;
};
type InventarioModificacaoMapeada = {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tipo: TipoModificacao;
    incrementoEspacos: number;
    apenasAmaldicoadas: boolean;
    requerComplexidade: string | null;
    efeitosMecanicos: Prisma.JsonValue | null;
};
type InventarioItemMapeado = {
    id: number;
    equipamentoId: number;
    quantidade: number;
    equipado: boolean;
    espacosCalculados: number;
    categoriaCalculada: string;
    nomeCustomizado: string | null;
    notas: string | null;
    equipamento: {
        id: number;
        codigo: string;
        nome: string;
        descricao: string | null;
        tipo: TipoEquipamento;
        categoria: CategoriaEquipamento;
        espacos: number;
        complexidadeMaldicao: string;
    };
    modificacoes: InventarioModificacaoMapeada[];
};
type ResistenciasMapeadas = Array<{
    codigo: string;
    nome: string;
    descricao: string | null;
    valor: number;
}>;
export type PersonagemDetalhadoMapeado = {
    id: number;
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
    idade: number | null;
    prestigioBase: number | null;
    prestigioClaBase: number | null;
    alinhamentoId: number | null;
    background: string | null;
    atributoChaveEa: PersonagemBaseDetalhadoEntity['atributoChaveEa'];
    proficienciasExtrasCodigos: string[];
    periciasClasseEscolhidasCodigos: string[];
    periciasOrigemEscolhidasCodigos: string[];
    periciasLivresCodigos: string[];
    cla: PersonagemBaseDetalhadoEntity['cla'];
    origem: PersonagemBaseDetalhadoEntity['origem'];
    classe: PersonagemBaseDetalhadoEntity['classe'];
    trilha: PersonagemBaseDetalhadoEntity['trilha'];
    caminho: PersonagemBaseDetalhadoEntity['caminho'];
    alinhamento: PersonagemBaseDetalhadoEntity['alinhamento'];
    tecnicaInata: {
        id: number;
        codigo: string;
        nome: string;
        descricao: string | null;
        tipo: string;
        hereditaria: boolean;
        linkExterno: string | null;
    } | null;
    proficiencias: Array<{
        id: number;
        codigo: string;
        nome: string;
        tipo: string;
        categoria: string | null;
        subtipo: string | null;
    }>;
    grausAprimoramento: GrauAprimoramentoAjustado[];
    pericias: Array<{
        id: number;
        codigo: string;
        nome: string;
        atributoBase: string;
        somenteTreinada: boolean;
        penalizaPorCarga: boolean;
        precisaKit: boolean;
        grauTreinamento: number;
        bonusExtra: number;
        bonusTotal: number;
    }>;
    grausTreinamento: GrauTreinamentoDto[];
    habilidades: Array<{
        id: number;
        nome: string;
        tipo: string;
        descricao: string | null;
    }>;
    poderesGenericos: Array<{
        id: number;
        habilidadeId: number;
        nome: string;
        config: Prisma.JsonValue;
    }>;
    poderesGenericosSelecionadosIds: number[];
    passivasAtributosAtivos: string[];
    passivasAtributosConfig: Prisma.JsonValue | null;
    passivasAtributoIds: number[];
    passivas: Array<{
        id: number;
        codigo: string;
        nome: string;
        atributo: string;
        nivel: number;
        descricao: string | null;
        efeitos: Prisma.JsonValue | null;
    }>;
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
    resistencias: ResistenciasMapeadas;
    espacosInventarioBase: number;
    espacosInventarioExtra: number;
    espacosOcupados: number;
    sobrecarregado: boolean;
    itensInventario: InventarioItemMapeado[];
};
export declare class PersonagemBaseMapper {
    private isJsonObject;
    private hasTipoGrauChoice;
    private getTipoGrauCodigoConfig;
    private jsonToStringArray;
    mapResumo(personagem: PersonagemBaseResumoEntity): {
        id: number;
        nome: string;
        nivel: number;
        cla: string;
        classe: string;
    };
    mapDetalhado(personagem: PersonagemBaseDetalhadoEntity, prisma: PrismaLike): Promise<PersonagemDetalhadoMapeado>;
    private mapItensInventario;
    private calcularBonusGrausDeHabilidades;
}
export {};
