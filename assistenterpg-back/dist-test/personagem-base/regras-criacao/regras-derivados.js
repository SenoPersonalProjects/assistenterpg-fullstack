"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularAtributosDerivados = calcularAtributosDerivados;
exports.calcularBloqueioEsquiva = calcularBloqueioEsquiva;
const client_1 = require("@prisma/client");
const personagem_exception_1 = require("src/common/exceptions/personagem.exception");
const VALORES_CLASSE = {
    Combatente: {
        pvInicial: 20,
        pvPorNivel: 4,
        peInicial: 3,
        pePorNivel: 3,
        eaInicial: 3,
        eaPorNivel: 3,
        sanInicial: 12,
        sanPorNivel: 3,
    },
    Sentinela: {
        pvInicial: 16,
        pvPorNivel: 2,
        peInicial: 3,
        pePorNivel: 3,
        eaInicial: 4,
        eaPorNivel: 4,
        sanInicial: 12,
        sanPorNivel: 4,
    },
    Especialista: {
        pvInicial: 16,
        pvPorNivel: 3,
        peInicial: 3,
        pePorNivel: 3,
        eaInicial: 4,
        eaPorNivel: 4,
        sanInicial: 16,
        sanPorNivel: 4,
    },
};
function isJsonObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function extrairEfeitosPassiva(efeitos) {
    if (!isJsonObject(efeitos))
        return {};
    return {
        deslocamento: typeof efeitos.deslocamento === 'number'
            ? efeitos.deslocamento
            : undefined,
        reacoes: typeof efeitos.reacoes === 'number' ? efeitos.reacoes : undefined,
        peExtra: typeof efeitos.peExtra === 'number' ? efeitos.peExtra : undefined,
        eaExtra: typeof efeitos.eaExtra === 'number' ? efeitos.eaExtra : undefined,
        limitePeEaExtra: typeof efeitos.limitePeEaExtra === 'number'
            ? efeitos.limitePeEaExtra
            : undefined,
        pvExtraLimitePeEa: efeitos.pvExtraLimitePeEa === true
            ? efeitos.pvExtraLimitePeEa
            : undefined,
        rodadasMorrendo: typeof efeitos.rodadasMorrendo === 'number'
            ? efeitos.rodadasMorrendo
            : undefined,
        rodadasEnlouquecendo: typeof efeitos.rodadasEnlouquecendo === 'number'
            ? efeitos.rodadasEnlouquecendo
            : undefined,
    };
}
async function calcularEfeitosPassivas(passivasIds, prisma) {
    if (!passivasIds || passivasIds.length === 0) {
        return {
            deslocamento: 0,
            reacoes: 0,
            peExtra: 0,
            eaExtra: 0,
            limitePeEaExtra: 0,
            pvExtraLimitePeEa: false,
            rodadasMorrendo: 0,
            rodadasEnlouquecendo: 0,
        };
    }
    const passivas = await prisma.passivaAtributo.findMany({
        where: { id: { in: passivasIds } },
    });
    const efeitos = {
        deslocamento: 0,
        reacoes: 0,
        peExtra: 0,
        eaExtra: 0,
        limitePeEaExtra: 0,
        pvExtraLimitePeEa: false,
        rodadasMorrendo: 0,
        rodadasEnlouquecendo: 0,
    };
    for (const passiva of passivas) {
        const e = extrairEfeitosPassiva(passiva.efeitos);
        if (typeof e.deslocamento === 'number')
            efeitos.deslocamento += e.deslocamento;
        if (typeof e.reacoes === 'number')
            efeitos.reacoes += e.reacoes;
        if (typeof e.peExtra === 'number')
            efeitos.peExtra += e.peExtra;
        if (typeof e.eaExtra === 'number')
            efeitos.eaExtra += e.eaExtra;
        if (typeof e.limitePeEaExtra === 'number')
            efeitos.limitePeEaExtra += e.limitePeEaExtra;
        if (e.pvExtraLimitePeEa === true)
            efeitos.pvExtraLimitePeEa = true;
        if (typeof e.rodadasMorrendo === 'number')
            efeitos.rodadasMorrendo += e.rodadasMorrendo;
        if (typeof e.rodadasEnlouquecendo === 'number')
            efeitos.rodadasEnlouquecendo += e.rodadasEnlouquecendo;
    }
    return efeitos;
}
async function calcularAtributosDerivados(params, prisma) {
    const { nivel, classeId, agilidade, intelecto, presenca, vigor, atributoChaveEa, passivasAtributoIds, } = params;
    const classe = await prisma.classe.findUnique({
        where: { id: classeId },
    });
    if (!classe) {
        throw new personagem_exception_1.ClasseNaoEncontradaException(classeId);
    }
    const valores = VALORES_CLASSE[classe.nome];
    if (!valores) {
        throw new personagem_exception_1.ValoresClasseNaoDefinidosException(classe.nome);
    }
    const efeitosPassivas = await calcularEfeitosPassivas(passivasAtributoIds ?? [], prisma);
    const atributoEa = atributoChaveEa === client_1.AtributoBaseEA.INT ? intelecto : presenca;
    const pvBase = valores.pvInicial + vigor + (nivel - 1) * (valores.pvPorNivel + vigor);
    const limitePeEa = nivel + efeitosPassivas.limitePeEaExtra;
    const pvMaximo = pvBase + (efeitosPassivas.pvExtraLimitePeEa ? limitePeEa : 0);
    const peMaximo = valores.peInicial +
        presenca +
        (nivel - 1) * (valores.pePorNivel + presenca) +
        efeitosPassivas.peExtra;
    const eaMaximo = valores.eaInicial +
        atributoEa +
        (nivel - 1) * (valores.eaPorNivel + atributoEa) +
        efeitosPassivas.eaExtra;
    const sanMaximo = valores.sanInicial + (nivel - 1) * valores.sanPorNivel;
    const defesa = 10 + agilidade;
    const deslocamento = 9 + efeitosPassivas.deslocamento;
    const limitePeEaPorTurno = limitePeEa;
    const reacoesBasePorTurno = 2 + efeitosPassivas.reacoes;
    const turnosMorrendo = 3 + efeitosPassivas.rodadasMorrendo;
    const turnosEnlouquecendo = 3 + efeitosPassivas.rodadasEnlouquecendo;
    const bloqueio = 0;
    const esquiva = defesa;
    return {
        pvMaximo,
        peMaximo,
        eaMaximo,
        sanMaximo,
        defesa,
        deslocamento,
        limitePeEaPorTurno,
        reacoesBasePorTurno,
        turnosMorrendo,
        turnosEnlouquecendo,
        bloqueio,
        esquiva,
    };
}
function calcularBloqueioEsquiva(params) {
    const { defesa, periciasMap } = params;
    const fortitude = periciasMap.get('FORTITUDE');
    const reflexos = periciasMap.get('REFLEXOS');
    const bonusFortitude = fortitude
        ? fortitude.grauTreinamento * 5 + fortitude.bonusExtra
        : 0;
    const bonusReflexos = reflexos
        ? reflexos.grauTreinamento * 5 + reflexos.bonusExtra
        : 0;
    const bloqueio = bonusFortitude;
    const esquiva = defesa + bonusReflexos;
    return { bloqueio, esquiva };
}
//# sourceMappingURL=regras-derivados.js.map