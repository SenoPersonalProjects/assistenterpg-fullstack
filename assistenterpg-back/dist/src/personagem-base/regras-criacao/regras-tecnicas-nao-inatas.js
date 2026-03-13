"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extrairRequisitosGraus = extrairRequisitosGraus;
exports.montarMapaGraus = montarMapaGraus;
exports.atendeRequisitosGraus = atendeRequisitosGraus;
exports.atendeRequisitoBaseTecnicaNaoInata = atendeRequisitoBaseTecnicaNaoInata;
const REQUISITO_BASE_POR_TECNICA_NAO_INATA = {
    NAOINATA_TECNICA_AMALDICOADA: 'TECNICA_AMALDICOADA',
    NAOINATA_TECNICA_REVERSA: 'TECNICA_REVERSA',
    NAOINATA_TECNICA_BARREIRA: 'TECNICA_BARREIRA',
    NAOINATA_TECNICA_ANTI_BARREIRA: 'TECNICA_ANTI_BARREIRA',
    NAOINATA_TECNICA_SHIKIGAMI: 'TECNICA_SHIKIGAMI',
    NAOINATA_TECNICA_CORPOS_AMALDICOADOS: 'TECNICA_CADAVERES',
};
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function normalizarCodigo(valor) {
    if (!valor)
        return '';
    return valor.trim().toUpperCase();
}
function toNumberOrNull(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}
function normalizarRequisitoGrau(value) {
    if (!isRecord(value))
        return null;
    const tipoGrauCodigo = typeof value.tipoGrauCodigo === 'string'
        ? value.tipoGrauCodigo.trim()
        : '';
    const valorMinimoRaw = value.valorMinimo !== undefined ? value.valorMinimo : value.valor;
    const valorMinimo = toNumberOrNull(valorMinimoRaw);
    if (!tipoGrauCodigo || valorMinimo === null)
        return null;
    return {
        tipoGrauCodigo,
        valorMinimo: Math.max(0, Math.trunc(valorMinimo)),
    };
}
function extrairRequisitosGraus(requisitos) {
    if (!isRecord(requisitos))
        return [];
    const requisitosGraus = [];
    const graus = requisitos.graus;
    if (Array.isArray(graus)) {
        for (const grau of graus) {
            const requisito = normalizarRequisitoGrau(grau);
            if (requisito)
                requisitosGraus.push(requisito);
        }
    }
    const requisitoUnitario = normalizarRequisitoGrau(requisitos);
    if (requisitoUnitario) {
        requisitosGraus.push(requisitoUnitario);
    }
    return requisitosGraus;
}
function montarMapaGraus(graus) {
    const map = new Map();
    for (const grau of graus) {
        const codigo = grau.tipoGrauCodigo?.trim();
        if (!codigo)
            continue;
        const valor = Math.max(0, Math.trunc(grau.valor ?? 0));
        map.set(codigo, valor);
    }
    return map;
}
function atendeRequisitosGraus(requisitos, grausMap) {
    const requisitosGraus = extrairRequisitosGraus(requisitos);
    if (requisitosGraus.length === 0)
        return true;
    return requisitosGraus.every((req) => {
        const grauAtual = grausMap.get(req.tipoGrauCodigo) ?? 0;
        return grauAtual >= req.valorMinimo;
    });
}
function atendeRequisitoBaseTecnicaNaoInata(tecnicaCodigo, grausMap) {
    const codigoNormalizado = normalizarCodigo(tecnicaCodigo);
    const tipoGrauCodigo = REQUISITO_BASE_POR_TECNICA_NAO_INATA[codigoNormalizado];
    if (!tipoGrauCodigo)
        return true;
    return (grausMap.get(tipoGrauCodigo) ?? 0) >= 1;
}
//# sourceMappingURL=regras-tecnicas-nao-inatas.js.map