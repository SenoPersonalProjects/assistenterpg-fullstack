"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularSlotsPoderesGenericos = calcularSlotsPoderesGenericos;
exports.buscarPoderesGenericosDisponiveis = buscarPoderesGenericosDisponiveis;
exports.validarPoderesGenericos = validarPoderesGenericos;
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
function isRequisitosPoder(value) {
    if (!value)
        return false;
    if (typeof value !== 'object')
        return false;
    const v = value;
    return ('nivelMinimo' in v ||
        'pericias' in v ||
        'atributos' in v ||
        'graus' in v ||
        'poderesPreRequisitos' in v);
}
function isMecanicasEspeciaisPoder(value) {
    if (!value)
        return false;
    if (typeof value !== 'object')
        return false;
    const v = value;
    return 'repetivel' in v || 'escolha' in v;
}
function calcularSlotsPoderesGenericos(nivel) {
    const niveisQueDaoPoder = [3, 6, 9, 12, 15, 18];
    return niveisQueDaoPoder.filter((n) => nivel >= n).length;
}
async function buscarPoderesGenericosDisponiveis(prisma) {
    const poderes = await prisma.habilidade.findMany({
        where: { tipo: 'PODER_GENERICO' },
        select: {
            id: true,
            nome: true,
            descricao: true,
            requisitos: true,
            mecanicasEspeciais: true,
        },
        orderBy: { nome: 'asc' },
    });
    return poderes;
}
async function validarPoderesGenericos(params, prisma) {
    const { nivel, poderes, pericias, atributos, graus } = params;
    if (!poderes || poderes.length === 0)
        return;
    const slotsDisponiveis = calcularSlotsPoderesGenericos(nivel);
    if (poderes.length > slotsDisponiveis) {
        throw new personagem_exception_1.PoderesGenericosExcedemSlotsException(nivel, slotsDisponiveis, poderes.length);
    }
    const idsUnicos = Array.from(new Set(poderes.map((p) => p.habilidadeId)));
    const poderesDb = await prisma.habilidade.findMany({
        where: {
            id: { in: idsUnicos },
            tipo: 'PODER_GENERICO',
        },
        select: {
            id: true,
            nome: true,
            requisitos: true,
            mecanicasEspeciais: true,
        },
    });
    if (poderesDb.length !== idsUnicos.length) {
        throw new personagem_exception_1.PoderesGenericosNaoEncontradosException();
    }
    const poderPorId = new Map(poderesDb.map((p) => [p.id, p]));
    const contagem = new Map();
    for (const inst of poderes) {
        contagem.set(inst.habilidadeId, (contagem.get(inst.habilidadeId) ?? 0) + 1);
    }
    for (const [habilidadeId, qtd] of contagem.entries()) {
        if (qtd <= 1)
            continue;
        const poderDb = poderPorId.get(habilidadeId);
        const mecRaw = poderDb?.mecanicasEspeciais;
        const mec = isMecanicasEspeciaisPoder(mecRaw) ? mecRaw : null;
        const repetivel = !!mec?.repetivel;
        if (!repetivel) {
            throw new personagem_exception_1.PoderGenericoNaoRepetivelException(poderDb?.nome ?? String(habilidadeId));
        }
    }
    const periciasMap = new Map(pericias.map((p) => [p.codigo, p.grauTreinamento]));
    const grausMap = new Map(graus.map((g) => [g.tipoGrauCodigo, g.valor]));
    const nomesPoderesSelecionados = new Set(poderesDb.map((p) => p.nome));
    for (const poder of poderesDb) {
        const rawReq = poder.requisitos;
        if (isRequisitosPoder(rawReq)) {
            const requisitos = rawReq;
            if (requisitos.nivelMinimo && nivel < requisitos.nivelMinimo) {
                throw new personagem_exception_1.PoderGenericoRequisitoNivelException(poder.nome, requisitos.nivelMinimo);
            }
            if (requisitos.pericias && Array.isArray(requisitos.pericias)) {
                validarPericias(poder.nome, requisitos.pericias, periciasMap);
            }
            if (requisitos.atributos) {
                validarAtributos(poder.nome, requisitos.atributos, atributos);
            }
            if (requisitos.graus && Array.isArray(requisitos.graus)) {
                validarGraus(poder.nome, requisitos.graus, grausMap);
            }
            if (requisitos.poderesPreRequisitos && Array.isArray(requisitos.poderesPreRequisitos)) {
                validarPoderesPreRequisitos(poder.nome, requisitos.poderesPreRequisitos, nomesPoderesSelecionados);
            }
        }
    }
    for (const inst of poderes) {
        const poderDb = poderPorId.get(inst.habilidadeId);
        if (!poderDb)
            continue;
        const mecRaw = poderDb.mecanicasEspeciais;
        if (!isMecanicasEspeciaisPoder(mecRaw))
            continue;
        const mec = mecRaw;
        const escolha = mec.escolha;
        if (!escolha)
            continue;
        if (inst.config == null) {
            throw new personagem_exception_1.PoderGenericoRequerEscolhaException(poderDb.nome);
        }
        if (escolha.tipo === 'PERICIAS') {
            const qtd = typeof escolha.quantidade === 'number' ? escolha.quantidade : 2;
            await validarConfigPericias(poderDb.nome, inst.config, qtd, prisma);
            continue;
        }
    }
}
async function validarConfigPericias(poderNome, config, quantidade, prisma) {
    const codigos = config?.periciasCodigos;
    if (!Array.isArray(codigos) || codigos.some((c) => typeof c !== 'string')) {
        throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderNome, 'periciasCodigos', 'deve ser array de strings');
    }
    const unicos = Array.from(new Set(codigos));
    if (unicos.length !== codigos.length) {
        throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderNome, 'periciasCodigos', 'não permite perícias repetidas na mesma escolha');
    }
    if (codigos.length !== quantidade) {
        throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderNome, 'periciasCodigos', `exige escolher exatamente ${quantidade} perícias`, { quantidadeEsperada: quantidade, quantidadeRecebida: codigos.length });
    }
    const periciasDb = await prisma.pericia.findMany({
        where: { codigo: { in: codigos } },
        select: { codigo: true },
    });
    const setDb = new Set(periciasDb.map((p) => p.codigo));
    for (const codigo of codigos) {
        if (!setDb.has(codigo)) {
            throw new personagem_exception_1.PoderGenericoConfigInvalidaException(poderNome, 'periciasCodigos', `perícia "${codigo}" não existe`, { codigoInvalido: codigo });
        }
    }
}
function validarPericias(poderNome, periciasReq, periciasMap) {
    const temAlternativa = periciasReq.some((req) => req.alternativa);
    if (temAlternativa) {
        const atendeuAlguma = periciasReq.some((req) => {
            const grauAtual = periciasMap.get(req.codigo) ?? 0;
            return grauAtual >= req.grauMinimo;
        });
        if (!atendeuAlguma) {
            const opcoes = periciasReq.map((req) => req.codigo).join(' ou ');
            throw new personagem_exception_1.PoderGenericoRequisitoPericiaException(poderNome, opcoes);
        }
    }
    else {
        for (const req of periciasReq) {
            const grauAtual = periciasMap.get(req.codigo) ?? 0;
            if (grauAtual < req.grauMinimo) {
                throw new personagem_exception_1.PoderGenericoRequisitoPericiaException(poderNome, `${req.codigo} (grau ${req.grauMinimo}+)`);
            }
        }
    }
}
function validarAtributos(poderNome, atributosReq, atributos) {
    const alternativa = atributosReq.alternativa;
    const entries = Object.entries(atributosReq).filter(([k]) => k !== 'alternativa');
    if (alternativa) {
        const atendeuAlgum = entries.some(([atrib, valorMin]) => {
            const valorAtual = atributos[atrib] ?? 0;
            return valorAtual >= valorMin;
        });
        if (!atendeuAlgum) {
            const opcoes = entries.map(([k, v]) => `${String(k).toUpperCase()} ${v}+`).join(' ou ');
            throw new personagem_exception_1.PoderGenericoRequisitoAtributoException(poderNome, opcoes);
        }
    }
    else {
        for (const [atrib, valorMin] of entries) {
            const valorAtual = atributos[atrib] ?? 0;
            if (valorAtual < valorMin) {
                throw new personagem_exception_1.PoderGenericoRequisitoAtributoException(poderNome, `${String(atrib).toUpperCase()} ${valorMin}+`);
            }
        }
    }
}
function validarGraus(poderNome, grausReq, grausMap) {
    for (const req of grausReq) {
        const grauAtual = grausMap.get(req.tipoGrauCodigo) ?? 0;
        if (grauAtual < req.valorMinimo) {
            throw new personagem_exception_1.PoderGenericoRequisitoGrauException(poderNome, req.tipoGrauCodigo, req.valorMinimo);
        }
    }
}
function validarPoderesPreRequisitos(poderNome, poderesReq, poderesSelecionados) {
    for (const nomeReq of poderesReq) {
        if (!poderesSelecionados.has(nomeReq)) {
            throw new personagem_exception_1.PoderGenericoRequisitoPoderException(poderNome, nomeReq);
        }
    }
}
//# sourceMappingURL=regras-poderes.js.map