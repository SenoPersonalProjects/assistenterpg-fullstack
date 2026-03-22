import { Prisma } from '@prisma/client';
export declare const PERSONAGEM_CAMPANHA_DETALHE_SELECT: {
    id: true;
    campanhaId: true;
    personagemBaseId: true;
    donoId: true;
    nome: true;
    nivel: true;
    pvMax: true;
    pvAtual: true;
    peMax: true;
    peAtual: true;
    eaMax: true;
    eaAtual: true;
    sanMax: true;
    sanAtual: true;
    limitePeEaPorTurno: true;
    prestigioGeral: true;
    prestigioCla: true;
    defesaBase: true;
    defesaEquipamento: true;
    defesaOutros: true;
    esquiva: true;
    bloqueio: true;
    deslocamento: true;
    turnosMorrendo: true;
    turnosEnlouquecendo: true;
    personagemBase: {
        select: {
            id: true;
            nome: true;
        };
    };
    dono: {
        select: {
            id: true;
            apelido: true;
        };
    };
    modificadores: {
        where: {
            ativo: true;
        };
        orderBy: {
            criadoEm: "desc";
        };
        select: {
            id: true;
            campo: true;
            valor: true;
            nome: true;
            descricao: true;
            criadoEm: true;
            criadoPorId: true;
        };
    };
};
export type PersonagemCampanhaDetalhePayload = Prisma.PersonagemCampanhaGetPayload<{
    select: typeof PERSONAGEM_CAMPANHA_DETALHE_SELECT;
}>;
export declare class CampanhaMapper {
    mapearPersonagemCampanhaResposta(personagem: PersonagemCampanhaDetalhePayload): {
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
}
