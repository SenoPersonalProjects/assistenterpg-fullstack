"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularGrausLivresMax = calcularGrausLivresMax;
exports.calcularGrausLivresExtras = calcularGrausLivresExtras;
exports.calcularBonusGrausDePoderesGenericos = calcularBonusGrausDePoderesGenericos;
exports.aplicarRegrasDeGraus = aplicarRegrasDeGraus;
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
function calcularGrausLivresMax(nivel) {
    const marcos = [2, 8, 14, 18];
    return marcos.filter((m) => nivel >= m).length;
}
function calcularGrausLivresExtras(habilidades, nivelPersonagem, passivasAtributosConfig) {
    const deHabilidades = calcularGrausLivresDeHabilidades(habilidades, nivelPersonagem);
    const deIntelecto = passivasAtributosConfig?.INT_II?.tipoGrauCodigoAprimoramento ? 1 : 0;
    return {
        deHabilidades,
        deIntelecto,
        totalExtras: deHabilidades + deIntelecto,
    };
}
function calcularBonusGrausDePoderesGenericos(poderes, habilidades) {
    const bonusMap = new Map();
    const habPorId = new Map(habilidades.map((h) => [h.habilidadeId, h.habilidade]));
    for (const inst of poderes) {
        const hab = habPorId.get(inst.habilidadeId);
        if (!hab)
            continue;
        const mec = hab.mecanicasEspeciais;
        if (mec?.escolha?.tipo !== 'TIPO_GRAU')
            continue;
        const codigo = inst.config?.tipoGrauCodigo;
        if (typeof codigo !== 'string')
            continue;
        const atual = bonusMap.get(codigo) ?? 0;
        bonusMap.set(codigo, atual + 1);
    }
    return bonusMap;
}
async function aplicarRegrasDeGraus(params, grausLivres) {
    const { nivel, habilidades, poderes, passivasAtributosConfig } = params;
    const mapa = new Map();
    for (const g of grausLivres ?? []) {
        mapa.set(g.tipoGrauCodigo, (mapa.get(g.tipoGrauCodigo) ?? 0) + g.valor);
    }
    const bonusHabilidades = calcularBonusDeHabilidades(habilidades, nivel);
    const bonusPoderes = calcularBonusGrausDePoderesGenericos(poderes ?? [], habilidades);
    const extras = calcularGrausLivresExtras(habilidades, nivel, passivasAtributosConfig);
    for (const [codigo, valor] of mapa.entries()) {
        if (!Number.isInteger(valor)) {
            throw new personagem_exception_1.GrauAprimoramentoNaoInteiroException(codigo, valor);
        }
        if (valor < 0 || valor > 5) {
            throw new personagem_exception_1.GrauAprimoramentoForaDoLimiteException(codigo, valor);
        }
    }
    for (const [codigo, bonus] of bonusHabilidades.entries()) {
        const atual = mapa.get(codigo) ?? 0;
        const novo = atual + bonus;
        if (novo > 5) {
            throw new personagem_exception_1.GrauAprimoramentoExcedeMaximoComBonusException(codigo, novo, bonus);
        }
        mapa.set(codigo, novo);
    }
    for (const [codigo, bonus] of bonusPoderes.entries()) {
        const atual = mapa.get(codigo) ?? 0;
        const novo = atual + bonus;
        if (novo > 5) {
            throw new personagem_exception_1.GrauAprimoramentoExcedeMaximoComPoderesException(codigo, novo, bonus);
        }
        mapa.set(codigo, novo);
    }
    return Array.from(mapa.entries())
        .filter(([, valor]) => valor > 0)
        .map(([tipoGrauCodigo, valor]) => ({ tipoGrauCodigo, valor }));
}
function calcularBonusDeHabilidades(habilidades, nivelPersonagem) {
    const bonusMapa = new Map();
    for (const hab of habilidades) {
        for (const efeito of hab.habilidade.efeitosGrau) {
            const { tipoGrauCodigo, valor, escalonamentoPorNivel } = efeito;
            let bonusTotal = valor;
            if (escalonamentoPorNivel?.niveis) {
                const niveisAtingidos = escalonamentoPorNivel.niveis.filter((n) => nivelPersonagem >= n).length;
                bonusTotal = niveisAtingidos * valor;
            }
            const atual = bonusMapa.get(tipoGrauCodigo) ?? 0;
            bonusMapa.set(tipoGrauCodigo, atual + bonusTotal);
        }
    }
    return bonusMapa;
}
function calcularGrausLivresDeHabilidades(habilidades, nivelPersonagem) {
    let total = 0;
    for (const hab of habilidades) {
        const mecanicas = hab.habilidade.mecanicasEspeciais;
        if (mecanicas?.graus_livres) {
            const { quantidade, escalonamentoPorNivel } = mecanicas.graus_livres;
            if (escalonamentoPorNivel?.niveis) {
                const niveisAtingidos = escalonamentoPorNivel.niveis.filter((n) => nivelPersonagem >= n).length;
                total += niveisAtingidos * quantidade;
            }
            else {
                total += quantidade;
            }
        }
    }
    return total;
}
//# sourceMappingURL=regras-graus-aprimoramento.js.map