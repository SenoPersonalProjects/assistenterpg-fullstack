"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularTotalAtributosEsperado = calcularTotalAtributosEsperado;
exports.validarAtributos = validarAtributos;
exports.listarAtributosElegiveisPassivas = listarAtributosElegiveisPassivas;
exports.resolverPassivasAtributos = resolverPassivasAtributos;
exports.validarPassivasAtributos = validarPassivasAtributos;
exports.calcularEfeitosPassivas = calcularEfeitosPassivas;
exports.aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias = aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias;
exports.aplicarIntelectoEmGraus = aplicarIntelectoEmGraus;
const client_1 = require("@prisma/client");
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
function calcularTotalAtributosEsperado(nivel) {
    const base = 9;
    const marcos = [4, 7, 10, 13, 16, 19];
    const bonus = marcos.filter((m) => nivel >= m).length;
    return base + bonus;
}
function validarAtributos(params) {
    const { nivel, agilidade, forca, intelecto, presenca, vigor } = params;
    const attrs = { agilidade, forca, intelecto, presenca, vigor };
    for (const [nome, v] of Object.entries(attrs)) {
        if (!Number.isInteger(v)) {
            throw new personagem_exception_1.AtributoNaoInteiroException(nome, v);
        }
        if (v < 0 || v > 7) {
            throw new personagem_exception_1.AtributoForaDoLimiteException(nome, v);
        }
    }
    const soma = agilidade + forca + intelecto + presenca + vigor;
    const esperado = calcularTotalAtributosEsperado(nivel);
    if (soma !== esperado) {
        throw new personagem_exception_1.SomatorioAtributosInvalidoException(nivel, soma, esperado);
    }
}
function getValorAtributoBase(atributos, base) {
    switch (base) {
        case client_1.AtributoBase.AGI:
            return atributos.agilidade;
        case client_1.AtributoBase.FOR:
            return atributos.forca;
        case client_1.AtributoBase.INT:
            return atributos.intelecto;
        case client_1.AtributoBase.PRE:
            return atributos.presenca;
        case client_1.AtributoBase.VIG:
            return atributos.vigor;
        default:
            return 0;
    }
}
function mapBaseToPassiva(base) {
    switch (base) {
        case client_1.AtributoBase.AGI:
            return client_1.AtributoPassiva.AGILIDADE;
        case client_1.AtributoBase.FOR:
            return client_1.AtributoPassiva.FORCA;
        case client_1.AtributoBase.INT:
            return client_1.AtributoPassiva.INTELECTO;
        case client_1.AtributoBase.PRE:
            return client_1.AtributoPassiva.PRESENCA;
        case client_1.AtributoBase.VIG:
            return client_1.AtributoPassiva.VIGOR;
        default:
            return client_1.AtributoPassiva.AGILIDADE;
    }
}
function listarAtributosElegiveisPassivas(atributos) {
    const ordem = [
        client_1.AtributoBase.AGI,
        client_1.AtributoBase.FOR,
        client_1.AtributoBase.INT,
        client_1.AtributoBase.PRE,
        client_1.AtributoBase.VIG,
    ];
    return ordem.filter((a) => getValorAtributoBase(atributos, a) >= 3);
}
function normalizarListaAtributosBase(valor) {
    if (!Array.isArray(valor))
        return [];
    const set = new Set();
    for (const v of valor) {
        if (typeof v !== 'string')
            continue;
        if (Object.values(client_1.AtributoBase).includes(v)) {
            set.add(v);
        }
    }
    return Array.from(set);
}
function niveisPorValorAtributo(valor) {
    if (valor >= 6)
        return [1, 2];
    if (valor >= 3)
        return [1];
    return [];
}
async function resolverPassivasAtributos(params) {
    const { atributos, prisma, strict = false } = params;
    const elegiveis = listarAtributosElegiveisPassivas(atributos);
    const escolhidos = normalizarListaAtributosBase(params.passivasAtributosAtivos);
    if (escolhidos.length > 2) {
        throw new personagem_exception_1.PassivasExcedemLimiteException(escolhidos.length, elegiveis);
    }
    if (escolhidos.length > 0 && escolhidos.some((a) => !elegiveis.includes(a))) {
        throw new personagem_exception_1.PassivasNaoElegiveisException(escolhidos, elegiveis);
    }
    const needsChoice = elegiveis.length > 2 && escolhidos.length !== 2;
    if (needsChoice) {
        if (strict) {
            throw new personagem_exception_1.PassivasEscolhaNecessariaException(elegiveis);
        }
        return {
            elegiveis,
            ativos: [],
            passivaIds: [],
            passivaCodigos: [],
            needsChoice: true,
        };
    }
    const ativos = elegiveis.length <= 2 ? elegiveis : escolhidos;
    const filtros = [];
    for (const a of ativos) {
        const valor = getValorAtributoBase(atributos, a);
        const niveis = niveisPorValorAtributo(valor);
        const atributoPassiva = mapBaseToPassiva(a);
        for (const nivel of niveis) {
            filtros.push({ atributo: atributoPassiva, nivel });
        }
    }
    if (filtros.length === 0) {
        return { elegiveis, ativos, passivaIds: [], passivaCodigos: [], needsChoice: false };
    }
    const passivas = await prisma.passivaAtributo.findMany({
        where: {
            OR: filtros.map((f) => ({
                atributo: f.atributo,
                nivel: f.nivel,
            })),
        },
    });
    if (passivas.length !== filtros.length) {
        throw new personagem_exception_1.CatalogoPassivasInconsisteException();
    }
    const passivaIds = passivas.map((p) => p.id);
    const passivaCodigos = passivas.map((p) => p.codigo);
    return { elegiveis, ativos, passivaIds, passivaCodigos, needsChoice: false };
}
async function validarPassivasAtributos({ passivasIds, atributos, prisma, }) {
    if (!passivasIds || passivasIds.length === 0)
        return;
    const passivas = await prisma.passivaAtributo.findMany({
        where: { id: { in: passivasIds } },
    });
    if (passivas.length !== passivasIds.length) {
        throw new personagem_exception_1.PassivaInexistenteException();
    }
    const atributosMap = {
        AGILIDADE: atributos.agilidade,
        FORCA: atributos.forca,
        INTELECTO: atributos.intelecto,
        PRESENCA: atributos.presenca,
        VIGOR: atributos.vigor,
    };
    for (const passiva of passivas) {
        const valorAtributo = atributosMap[passiva.atributo];
        if (valorAtributo < passiva.requisito) {
            throw new personagem_exception_1.PassivaRequisitoNaoAtendidoException(passiva.nome, passiva.atributo, passiva.requisito, valorAtributo);
        }
    }
    const porAtributo = passivas.reduce((acc, p) => {
        if (!acc[p.atributo])
            acc[p.atributo] = [];
        acc[p.atributo].push(p);
        return acc;
    }, {});
    const atributosComPassivas = Object.keys(porAtributo);
    if (atributosComPassivas.length > 2) {
        throw new personagem_exception_1.PassivasLimiteAtributoExcedidoException(atributosComPassivas.length, atributosComPassivas);
    }
    for (const [atributo, passivasDoAtributo] of Object.entries(porAtributo)) {
        if (passivasDoAtributo.length > 2) {
            throw new personagem_exception_1.PassivasDuplicadasException(atributo, passivasDoAtributo.length);
        }
        const niveis = new Set(passivasDoAtributo.map((p) => p.nivel));
        if (niveis.size !== passivasDoAtributo.length) {
            throw new personagem_exception_1.PassivasDuplicadasException(atributo, passivasDoAtributo.length);
        }
    }
}
function calcularEfeitosPassivas(passivas) {
    const efeitos = {
        deslocamentoExtra: 0,
        reacoesExtra: 0,
        peExtra: 0,
        eaExtra: 0,
        limitePeEaExtra: 0,
        pvExtraLimitePeEa: false,
        rodadasMorrendoExtra: 0,
        rodadasEnlouquecendoExtra: 0,
        passosDanoCorpoACorpo: 0,
        dadosDanoCorpoACorpo: 0,
        periciasExtras: 0,
        proficienciasExtras: 0,
        grauTreinamentoExtra: 0,
        grauAprimoramentoExtra: 0,
    };
    for (const passiva of passivas) {
        const efeitosPassiva = passiva.efeitos;
        if (efeitosPassiva.deslocamento) {
            efeitos.deslocamentoExtra = Math.max(efeitos.deslocamentoExtra, efeitosPassiva.deslocamento);
        }
        if (efeitosPassiva.reacoes) {
            efeitos.reacoesExtra += efeitosPassiva.reacoes;
        }
        if (efeitosPassiva.passosDanoCorpoACorpo) {
            efeitos.passosDanoCorpoACorpo = Math.max(efeitos.passosDanoCorpoACorpo, efeitosPassiva.passosDanoCorpoACorpo);
        }
        if (efeitosPassiva.dadosDanoCorpoACorpo) {
            efeitos.dadosDanoCorpoACorpo += efeitosPassiva.dadosDanoCorpoACorpo;
        }
        if (efeitosPassiva.periciasExtras) {
            efeitos.periciasExtras = Math.max(efeitos.periciasExtras, efeitosPassiva.periciasExtras);
        }
        if (efeitosPassiva.proficienciasExtras) {
            efeitos.proficienciasExtras = Math.max(efeitos.proficienciasExtras, efeitosPassiva.proficienciasExtras);
        }
        if (efeitosPassiva.grauTreinamentoExtra) {
            efeitos.grauTreinamentoExtra += efeitosPassiva.grauTreinamentoExtra;
        }
        if (efeitosPassiva.grauAprimoramentoExtra) {
            efeitos.grauAprimoramentoExtra += efeitosPassiva.grauAprimoramentoExtra;
        }
        if (efeitosPassiva.rodadasEnlouquecendo) {
            efeitos.rodadasEnlouquecendoExtra += efeitosPassiva.rodadasEnlouquecendo;
        }
        if (efeitosPassiva.peExtra) {
            efeitos.peExtra += efeitosPassiva.peExtra;
        }
        if (efeitosPassiva.eaExtra) {
            efeitos.eaExtra += efeitosPassiva.eaExtra;
        }
        if (efeitosPassiva.limitePeEaExtra) {
            efeitos.limitePeEaExtra += efeitosPassiva.limitePeEaExtra;
        }
        if (efeitosPassiva.rodadasMorrendo) {
            efeitos.rodadasMorrendoExtra += efeitosPassiva.rodadasMorrendo;
        }
        if (efeitosPassiva.pvExtraLimitePeEa === true) {
            efeitos.pvExtraLimitePeEa = true;
        }
    }
    return efeitos;
}
function aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias(params) {
    const { passivasAtivasCodigos, passivasConfig, periciasMap, profsExtrasPayload } = params;
    const cfg = passivasConfig ?? {};
    const profsExtras = new Set(profsExtrasPayload);
    let periciasLivresExtras = 0;
    const temIntI = passivasAtivasCodigos.includes('INT_I');
    const temIntII = passivasAtivasCodigos.includes('INT_II');
    const aplicarIntelectoUnitario = (codigoPassiva) => {
        const conf = cfg[codigoPassiva];
        if (!conf)
            return;
        const periciasCodigos = conf.periciasCodigos ?? [];
        const profsCodigos = conf.proficienciasCodigos ?? [];
        const maxTotal = codigoPassiva === 'INT_I' ? 1 : 2;
        const totalEscolhas = periciasCodigos.length + profsCodigos.length;
        if (totalEscolhas > maxTotal) {
            throw new personagem_exception_1.PassivasIntelectoConfigInvalidaException(codigoPassiva, maxTotal);
        }
        const periciasLivresDestaPassiva = maxTotal - totalEscolhas;
        periciasLivresExtras += periciasLivresDestaPassiva;
        for (const codigo of periciasCodigos) {
            const entry = periciasMap.get(codigo);
            if (!entry) {
                throw new personagem_exception_1.PassivaIntelectoPericiaInexistenteException(codigoPassiva, codigo);
            }
        }
        for (const codigo of profsCodigos) {
            profsExtras.add(codigo);
        }
        if (conf.periciaCodigoTreino) {
            const entry = periciasMap.get(conf.periciaCodigoTreino);
            if (!entry) {
                throw new personagem_exception_1.PassivaIntelectoPericiaInexistenteException(codigoPassiva, conf.periciaCodigoTreino);
            }
            entry.grauTreinamento += 1;
            periciasMap.set(conf.periciaCodigoTreino, entry);
        }
        else {
            throw new personagem_exception_1.PassivaIntelectoTreinoNecessarioException(codigoPassiva);
        }
    };
    if (temIntI)
        aplicarIntelectoUnitario('INT_I');
    if (temIntII)
        aplicarIntelectoUnitario('INT_II');
    return {
        profsExtrasFinal: Array.from(profsExtras),
        periciasLivresExtras,
    };
}
function aplicarIntelectoEmGraus(params) {
    const { passivasAtivasCodigos, passivasConfig, graus } = params;
    if (!passivasAtivasCodigos.includes('INT_II'))
        return graus;
    const cfg = passivasConfig ?? {};
    const conf = cfg.INT_II;
    if (!conf?.tipoGrauCodigoAprimoramento)
        return graus;
    const alvo = conf.tipoGrauCodigoAprimoramento;
    const idx = graus.findIndex((g) => g.tipoGrauCodigo === alvo);
    if (idx >= 0) {
        const atual = graus[idx].valor;
        const novo = atual + 1;
        if (novo > 5) {
            throw new personagem_exception_1.PassivaIntelectoGrauExcedeMaximoException(alvo, novo, 5);
        }
        const copy = [...graus];
        copy[idx] = { ...copy[idx], valor: novo };
        return copy;
    }
    return [...graus, { tipoGrauCodigo: alvo, valor: 1 }];
}
//# sourceMappingURL=regras-atributos.js.map