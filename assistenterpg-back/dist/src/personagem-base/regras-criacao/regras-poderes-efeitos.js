"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aplicarEfeitosPoderesEmPericias = aplicarEfeitosPoderesEmPericias;
exports.aplicarEfeitosPoderesEmGraus = aplicarEfeitosPoderesEmGraus;
exports.extrairProficienciasDeHabilidades = extrairProficienciasDeHabilidades;
exports.aplicarEfeitosPoderesEmProficiencias = aplicarEfeitosPoderesEmProficiencias;
exports.extrairResistenciasDeHabilidades = extrairResistenciasDeHabilidades;
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
function getMaxNivelTreinoPermitidoPorNivelPersonagem(nivel) {
    if (nivel >= 16)
        return 4;
    if (nivel >= 9)
        return 3;
    if (nivel >= 3)
        return 2;
    return 1;
}
function isJsonObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function getEscolhaPericias(mec) {
    if (!isJsonObject(mec))
        return null;
    const escolha = mec.escolha;
    if (!isJsonObject(escolha))
        return null;
    if (escolha.tipo !== 'PERICIAS')
        return null;
    return escolha;
}
async function aplicarEfeitosPoderesEmPericias(params, prisma) {
    const { nivel, poderes, periciasMap } = params;
    if (!poderes || poderes.length === 0)
        return;
    const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));
    const poderesDb = (await prisma.habilidade.findMany({
        where: { id: { in: idsUnicos }, tipo: 'PODER_GENERICO' },
        select: { id: true, nome: true, mecanicasEspeciais: true },
    }));
    if (poderesDb.length !== idsUnicos.length) {
        throw new personagem_exception_1.PoderesGenericosNaoEncontradosException();
    }
    const poderPorId = new Map(poderesDb.map((p) => [p.id, p]));
    const maxPermitido = getMaxNivelTreinoPermitidoPorNivelPersonagem(nivel);
    for (const inst of poderes) {
        const poderDb = poderPorId.get(inst.habilidadeId);
        if (!poderDb)
            continue;
        const escolhaMec = getEscolhaPericias(poderDb.mecanicasEspeciais);
        if (!escolhaMec)
            continue;
        const qtd = typeof escolhaMec.quantidade === 'number' ? escolhaMec.quantidade : 2;
        const codigos = inst.config?.periciasCodigos ?? [];
        if (!Array.isArray(codigos) || codigos.some((c) => typeof c !== 'string')) {
            throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderDb.nome, 'periciasCodigos', 'deve ser array de strings');
        }
        const unicos = Array.from(new Set(codigos));
        if (unicos.length !== codigos.length) {
            throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderDb.nome, 'periciasCodigos', 'não permite perícias repetidas na mesma escolha');
        }
        if (codigos.length !== qtd) {
            throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderDb.nome, 'periciasCodigos', `exige escolher exatamente ${qtd} perícias`, { quantidadeEsperada: qtd, quantidadeRecebida: codigos.length });
        }
        for (const codigo of codigos) {
            const pericia = periciasMap.get(codigo);
            if (!pericia) {
                throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderDb.nome, 'periciasCodigos', `perícia "${codigo}" não existe no sistema`);
            }
            const proximo = pericia.grauTreinamento + 1;
            if (proximo > maxPermitido) {
                throw new personagem_exception_1.PoderGenericoPericiaNivelException(poderDb.nome, codigo, nivel);
            }
            if (proximo > 4) {
                throw new personagem_exception_1.PoderGenericoPericiaMaximaException(poderDb.nome, codigo);
            }
            pericia.grauTreinamento = proximo;
        }
    }
}
async function aplicarEfeitosPoderesEmGraus(params, prisma) {
    const { poderes, grausLivres } = params;
    if (!poderes || poderes.length === 0)
        return grausLivres;
    const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));
    const poderesDb = await prisma.habilidade.findMany({
        where: { id: { in: idsUnicos }, tipo: 'PODER_GENERICO' },
        select: { id: true, nome: true, mecanicasEspeciais: true },
    });
    const poderPorId = new Map(poderesDb.map((p) => [p.id, p]));
    for (const inst of poderes) {
        const poderDb = poderPorId.get(inst.habilidadeId);
        if (!poderDb)
            continue;
        const mec = poderDb.mecanicasEspeciais;
        const escolha = mec?.escolha;
        if (!escolha || escolha.tipo !== 'TIPO_GRAU')
            continue;
        const codigo = inst.config?.tipoGrauCodigo;
        if (typeof codigo !== 'string' || !codigo.trim()) {
            throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderDb.nome, 'tipoGrauCodigo', 'exige config.tipoGrauCodigo (string) na instância');
        }
    }
    return grausLivres;
}
async function extrairProficienciasDeHabilidades(habilidades, prisma) {
    const profsCodigos = new Set();
    for (const hab of habilidades) {
        const mecanicas = hab.habilidade.mecanicasEspeciais;
        if (!mecanicas || typeof mecanicas !== 'object')
            continue;
        const profsArray = mecanicas.proficiencias;
        if (!Array.isArray(profsArray))
            continue;
        for (const codigo of profsArray) {
            if (typeof codigo === 'string' && codigo.trim()) {
                profsCodigos.add(codigo);
            }
        }
    }
    if (profsCodigos.size > 0) {
        const profsExistentes = await prisma.proficiencia.findMany({
            where: { codigo: { in: Array.from(profsCodigos) } },
            select: { codigo: true },
        });
        const codigosValidos = new Set(profsExistentes.map((p) => p.codigo));
        for (const codigo of profsCodigos) {
            if (!codigosValidos.has(codigo)) {
                throw new personagem_exception_1.ProficienciaNaoEncontradaException(codigo);
            }
        }
    }
    return Array.from(profsCodigos);
}
async function aplicarEfeitosPoderesEmProficiencias(params, prisma) {
    const { poderes } = params;
    if (!poderes || poderes.length === 0)
        return [];
    const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));
    const poderesDb = await prisma.habilidade.findMany({
        where: { id: { in: idsUnicos }, tipo: 'PODER_GENERICO' },
        select: { id: true, nome: true, mecanicasEspeciais: true },
    });
    if (poderesDb.length !== idsUnicos.length) {
        throw new personagem_exception_1.PoderesGenericosNaoEncontradosException();
    }
    const habilidadesComRelacao = poderesDb.map((p) => ({
        habilidade: p,
    }));
    const profsDePoderes = await extrairProficienciasDeHabilidades(habilidadesComRelacao, prisma);
    return profsDePoderes;
}
function extrairResistenciasDeHabilidades(habilidades) {
    const resistencias = new Map();
    for (const hab of habilidades) {
        const mecanicas = hab.habilidade.mecanicasEspeciais;
        if (!mecanicas || typeof mecanicas !== 'object')
            continue;
        const resistenciasObj = mecanicas.resistencias;
        if (!resistenciasObj || typeof resistenciasObj !== 'object')
            continue;
        if (Array.isArray(resistenciasObj))
            continue;
        for (const [codigo, valor] of Object.entries(resistenciasObj)) {
            if (typeof valor === 'number' && valor > 0) {
                const atual = resistencias.get(codigo) || 0;
                resistencias.set(codigo, atual + valor);
            }
        }
    }
    return resistencias;
}
//# sourceMappingURL=regras-poderes-efeitos.js.map