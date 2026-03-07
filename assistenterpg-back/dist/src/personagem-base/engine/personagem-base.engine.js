"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularEstadoFinalPersonagemBase = calcularEstadoFinalPersonagemBase;
const client_1 = require("@prisma/client");
const regras_graus_aprimoramento_1 = require("../regras-criacao/regras-graus-aprimoramento");
const regras_atributos_1 = require("../regras-criacao/regras-atributos");
const regras_origem_cla_1 = require("../regras-criacao/regras-origem-cla");
const regras_trilha_1 = require("../regras-criacao/regras-trilha");
const regras_pericias_1 = require("../regras-criacao/regras-pericias");
const regras_graus_treinamento_1 = require("../regras-criacao/regras-graus-treinamento");
const regras_poderes_1 = require("../regras-criacao/regras-poderes");
const regras_poderes_efeitos_1 = require("../regras-criacao/regras-poderes-efeitos");
const regras_derivados_1 = require("../regras-criacao/regras-derivados");
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
function limparUndefined(obj) {
    const out = { ...obj };
    for (const k of Object.keys(out)) {
        if (out[k] === undefined)
            delete out[k];
    }
    return out;
}
function validarAtributoChaveEa(valor) {
    const valoresValidos = Object.values(client_1.AtributoBaseEA);
    if (typeof valor !== 'string' || !valoresValidos.includes(valor)) {
        throw new personagem_exception_1.AtributoChaveEaInvalidoException(valor, valoresValidos);
    }
}
function normalizePoderesGenericos(poderes) {
    return (poderes ?? []).map((inst) => ({
        ...inst,
        config: inst?.config ?? {},
    }));
}
function limparUndefinedDeepJson(value) {
    if (value === undefined)
        return undefined;
    return JSON.parse(JSON.stringify(value));
}
function calcularModificadoresDerivadosPorHabilidadesLocal(habilidades, nivel) {
    const mods = {
        pvPorNivelExtra: 0,
        peBaseExtra: 0,
        limitePeEaExtra: 0,
        defesaExtra: 0,
        espacosInventarioExtra: 0,
    };
    for (const h of habilidades) {
        const m = h.habilidade.mecanicasEspeciais;
        if (m?.pvPorNivel && typeof m.pvPorNivel === 'number') {
            mods.pvPorNivelExtra += m.pvPorNivel;
        }
        if (m?.recursos) {
            if (typeof m.recursos.peBase === 'number') {
                mods.peBaseExtra += m.recursos.peBase;
            }
            if (typeof m.recursos.pePorNivelImpar === 'number') {
                const niveisImpares = Math.ceil(nivel / 2);
                mods.peBaseExtra += m.recursos.pePorNivelImpar * niveisImpares;
            }
            if (typeof m.recursos.limitePePorTurnoBonus === 'number') {
                mods.limitePeEaExtra += m.recursos.limitePePorTurnoBonus;
            }
        }
        if (m?.defesa?.bonus && typeof m.defesa.bonus === 'number') {
            mods.defesaExtra += m.defesa.bonus;
        }
        if (m?.inventario?.espacosExtra &&
            typeof m.inventario.espacosExtra === 'number') {
            mods.espacosInventarioExtra += m.inventario.espacosExtra;
        }
    }
    return mods;
}
async function calcularEstadoFinalPersonagemBase(params) {
    const { dto: dtoIn, strictPassivas, prisma, personagemBaseId, itensInventarioCalculados, } = params;
    const poderesGenericosNormalizados = normalizePoderesGenericos(dtoIn.poderesGenericos);
    const passivasAtributosConfigLimpo = limparUndefinedDeepJson(dtoIn.passivasAtributosConfig);
    const dtoNormalizado = {
        ...dtoIn,
        poderesGenericos: poderesGenericosNormalizados,
        passivasAtributosConfig: passivasAtributosConfigLimpo,
    };
    validarAtributoChaveEa(dtoNormalizado.atributoChaveEa);
    (0, regras_atributos_1.validarAtributos)({
        nivel: dtoNormalizado.nivel,
        agilidade: dtoNormalizado.agilidade,
        forca: dtoNormalizado.forca,
        intelecto: dtoNormalizado.intelecto,
        presenca: dtoNormalizado.presenca,
        vigor: dtoNormalizado.vigor,
    });
    await (0, regras_origem_cla_1.validarOrigemClaTecnica)(dtoNormalizado.claId, dtoNormalizado.origemId, dtoNormalizado.tecnicaInataId, prisma);
    const periciasCalculadas = await (0, regras_pericias_1.montarPericiasPersonagem)(dtoNormalizado, prisma);
    const todasPericias = await prisma.pericia.findMany();
    const mapaPericiasPorId = new Map(todasPericias.map((p) => [p.id, p]));
    const mapaPericiasPorCodigo = new Map(todasPericias.map((p) => [p.codigo, p]));
    const periciasMapCodigo = new Map();
    for (const p of periciasCalculadas) {
        const pericia = mapaPericiasPorId.get(p.periciaId);
        if (!pericia)
            continue;
        periciasMapCodigo.set(pericia.codigo, {
            grauTreinamento: p.grauTreinamento,
            periciaId: p.periciaId,
            bonusExtra: p.bonusExtra,
        });
    }
    await (0, regras_poderes_efeitos_1.aplicarEfeitosPoderesEmPericias)({
        nivel: dtoNormalizado.nivel,
        poderes: poderesGenericosNormalizados,
        periciasMap: periciasMapCodigo,
    }, prisma);
    const passivasResolvidas = await (0, regras_atributos_1.resolverPassivasAtributos)({
        atributos: {
            agilidade: dtoNormalizado.agilidade,
            forca: dtoNormalizado.forca,
            intelecto: dtoNormalizado.intelecto,
            presenca: dtoNormalizado.presenca,
            vigor: dtoNormalizado.vigor,
        },
        passivasAtributosAtivos: dtoNormalizado.passivasAtributosAtivos,
        strict: strictPassivas,
        prisma: prisma,
    });
    const passivasCodigosAtivos = passivasResolvidas.passivaCodigos ?? [];
    const profsPayloadCodigos = dtoNormalizado.proficienciasCodigos ?? [];
    const { profsExtrasFinal: profsExtrasDeIntelecto, periciasLivresExtras } = (0, regras_atributos_1.aplicarEfeitosPassivasIntelectoEmPericiasEProficiencias)({
        passivasAtivasCodigos: passivasCodigosAtivos,
        passivasConfig: dtoNormalizado.passivasAtributosConfig,
        periciasMap: periciasMapCodigo,
        profsExtrasPayload: profsPayloadCodigos,
    });
    const classe = await prisma.classe.findUnique({
        where: { id: dtoNormalizado.classeId },
    });
    const periciasLivres = dtoNormalizado.periciasLivresCodigos ?? [];
    const maxLivresBase = (classe?.periciasLivresBase ?? 0) + dtoNormalizado.intelecto;
    const maxLivresTotal = maxLivresBase + periciasLivresExtras;
    if (periciasLivres.length > maxLivresTotal) {
        throw new personagem_exception_1.PericiasLivresExcedemLimiteException(periciasLivres.length, maxLivresTotal, {
            maxBase: maxLivresBase,
            deIntelecto: periciasLivresExtras,
        });
    }
    await (0, regras_graus_treinamento_1.validarGrausTreinamento)(dtoNormalizado.nivel, dtoNormalizado.intelecto, dtoNormalizado.grausTreinamento, periciasMapCodigo, prisma);
    (0, regras_graus_treinamento_1.aplicarGrausTreinamento)(dtoNormalizado.grausTreinamento, periciasMapCodigo);
    const periciasComCodigo = Array.from(periciasMapCodigo.entries()).map(([codigo, p]) => ({
        codigo,
        grauTreinamento: p.grauTreinamento,
    }));
    await (0, regras_trilha_1.validarTrilhaECaminho)(dtoNormalizado.classeId, dtoNormalizado.trilhaId, dtoNormalizado.caminhoId, periciasComCodigo, prisma);
    const habilidades = await params.buscarHabilidadesPersonagem({
        nivel: dtoNormalizado.nivel,
        origemId: dtoNormalizado.origemId,
        classeId: dtoNormalizado.classeId,
        trilhaId: dtoNormalizado.trilhaId,
        caminhoId: dtoNormalizado.caminhoId,
        tecnicaInataId: dtoNormalizado.tecnicaInataId,
        estudouEscolaTecnica: dtoNormalizado.estudouEscolaTecnica,
        poderesGenericos: poderesGenericosNormalizados,
    }, prisma);
    const habilidadesParaPersistir = habilidades
        .filter((h) => h.habilidade?.tipo !== 'PODER_GENERICO')
        .map((h) => ({ habilidadeId: h.habilidadeId }));
    const profsDeHabilidades = await (0, regras_poderes_efeitos_1.extrairProficienciasDeHabilidades)(habilidades, prisma);
    const grausUsuario = dtoNormalizado.grausAprimoramento ?? [];
    const pontosUsuario = grausUsuario.reduce((acc, g) => acc + (g.valor || 0), 0);
    const baseLivres = (0, regras_graus_aprimoramento_1.calcularGrausLivresMax)(dtoNormalizado.nivel);
    const extrasLivres = (0, regras_graus_aprimoramento_1.calcularGrausLivresExtras)(habilidades, dtoNormalizado.nivel, dtoNormalizado.passivasAtributosConfig);
    const maxTotalLivres = baseLivres + extrasLivres.totalExtras;
    if (pontosUsuario > maxTotalLivres) {
        throw new personagem_exception_1.GrausAprimoramentoExcedemTotalException(dtoNormalizado.nivel, pontosUsuario, maxTotalLivres, {
            base: baseLivres,
            extras: extrasLivres.totalExtras,
        });
    }
    const grausComPoderes = await (0, regras_poderes_efeitos_1.aplicarEfeitosPoderesEmGraus)({ poderes: poderesGenericosNormalizados, grausLivres: grausUsuario }, prisma);
    const grausComIntelecto = (0, regras_atributos_1.aplicarIntelectoEmGraus)({
        passivasAtivasCodigos: passivasCodigosAtivos,
        passivasConfig: dtoNormalizado.passivasAtributosConfig,
        graus: grausComPoderes ?? [],
    });
    if ((poderesGenericosNormalizados?.length ?? 0) > 0) {
        await (0, regras_poderes_1.validarPoderesGenericos)({
            nivel: dtoNormalizado.nivel,
            poderes: poderesGenericosNormalizados,
            pericias: periciasComCodigo,
            atributos: {
                agilidade: dtoNormalizado.agilidade,
                forca: dtoNormalizado.forca,
                intelecto: dtoNormalizado.intelecto,
                presenca: dtoNormalizado.presenca,
                vigor: dtoNormalizado.vigor,
            },
            graus: grausComIntelecto ?? [],
        }, prisma);
    }
    const grausFinais = await (0, regras_graus_aprimoramento_1.aplicarRegrasDeGraus)({
        nivel: dtoNormalizado.nivel,
        habilidades,
        poderes: poderesGenericosNormalizados,
        passivasAtributosConfig: dtoNormalizado.passivasAtributosConfig,
    }, grausComIntelecto);
    const profsClasse = await prisma.classeProficiencia.findMany({
        where: { classeId: dtoNormalizado.classeId },
        include: { proficiencia: true },
    });
    const profsClasseCodigos = profsClasse.map((cp) => cp.proficiencia.codigo);
    const profsFinais = Array.from(new Set([
        ...profsClasseCodigos,
        ...profsDeHabilidades,
        ...profsExtrasDeIntelecto,
    ]));
    const derivadosBase = await (0, regras_derivados_1.calcularAtributosDerivados)({
        nivel: dtoNormalizado.nivel,
        classeId: dtoNormalizado.classeId,
        agilidade: dtoNormalizado.agilidade,
        forca: dtoNormalizado.forca,
        intelecto: dtoNormalizado.intelecto,
        presenca: dtoNormalizado.presenca,
        vigor: dtoNormalizado.vigor,
        atributoChaveEa: dtoNormalizado.atributoChaveEa,
        passivasAtributoIds: passivasResolvidas.passivaIds,
    }, prisma);
    const calcMods = params.calcularModsDerivadosPorHabilidades ??
        calcularModificadoresDerivadosPorHabilidadesLocal;
    const mods = calcMods(habilidades, dtoNormalizado.nivel);
    const resistenciasDeHabilidades = (0, regras_poderes_efeitos_1.extrairResistenciasDeHabilidades)(habilidades);
    let defesaEquipamento = 0;
    const resistenciasDeEquipamentos = new Map();
    if (personagemBaseId) {
        const personagemComResistencias = await prisma.personagemBase.findUnique({
            where: { id: personagemBaseId },
            select: {
                defesaEquipamento: true,
                resistencias: {
                    include: {
                        resistenciaTipo: true,
                    },
                },
            },
        });
        if (personagemComResistencias) {
            defesaEquipamento = personagemComResistencias.defesaEquipamento || 0;
            personagemComResistencias.resistencias.forEach((r) => {
                resistenciasDeEquipamentos.set(r.resistenciaTipo.codigo, r.valor);
            });
        }
    }
    const resistenciasFinais = new Map();
    for (const [codigo, valor] of resistenciasDeHabilidades.entries()) {
        resistenciasFinais.set(codigo, (resistenciasFinais.get(codigo) || 0) + valor);
    }
    for (const [codigo, valor] of resistenciasDeEquipamentos.entries()) {
        resistenciasFinais.set(codigo, (resistenciasFinais.get(codigo) || 0) + valor);
    }
    const defesaBase = derivadosBase.defesa + mods.defesaExtra;
    const derivadosFinais = {
        ...derivadosBase,
        pvMaximo: derivadosBase.pvMaximo + mods.pvPorNivelExtra * dtoNormalizado.nivel,
        peMaximo: derivadosBase.peMaximo + mods.peBaseExtra,
        limitePeEaPorTurno: derivadosBase.limitePeEaPorTurno + mods.limitePeEaExtra,
        defesaBase,
        defesaEquipamento,
        defesaTotal: defesaBase + defesaEquipamento,
    };
    const { bloqueio, esquiva } = (0, regras_derivados_1.calcularBloqueioEsquiva)({
        defesa: derivadosFinais.defesaTotal,
        periciasMap: periciasMapCodigo,
    });
    derivadosFinais.bloqueio = bloqueio;
    derivadosFinais.esquiva = esquiva;
    const espacosInventarioBase = dtoNormalizado.forca * 5;
    const espacosInventarioExtra = mods.espacosInventarioExtra;
    const espacosInventarioTotal = espacosInventarioBase + espacosInventarioExtra;
    const bonusHabilidades = habilidades.flatMap((h) => (h.habilidade.efeitosGrau ?? []).map((efeito) => ({
        habilidadeNome: h.habilidade.nome,
        tipoGrauCodigo: efeito.tipoGrauCodigo,
        valor: efeito.valor,
        escalonamentoPorNivel: efeito.escalonamentoPorNivel,
    })));
    const cfg = dtoNormalizado.passivasAtributosConfig ?? {};
    const cfgInt2 = cfg.INTII ?? cfg.INT_II ?? cfg.INTII_ ?? undefined;
    if (cfgInt2?.tipoGrauCodigoAprimoramento) {
        bonusHabilidades.push({
            habilidadeNome: 'Intelecto II',
            tipoGrauCodigo: cfgInt2.tipoGrauCodigoAprimoramento,
            valor: 1,
            escalonamentoPorNivel: null,
        });
    }
    return {
        dtoNormalizado: limparUndefined(dtoNormalizado),
        passivasResolvidas,
        passivasAtributosConfigLimpo: passivasAtributosConfigLimpo ?? null,
        poderesGenericosNormalizados,
        periciasMapCodigo,
        periciasComCodigo,
        habilidades,
        habilidadesParaPersistir,
        profsFinais,
        grausFinais,
        grausTreinamento: dtoNormalizado.grausTreinamento,
        derivadosFinais,
        espacosInventario: {
            base: espacosInventarioBase,
            extra: espacosInventarioExtra,
            total: espacosInventarioTotal,
        },
        resistenciasFinais,
        resistenciasDetalhadas: {
            deEquipamentos: resistenciasDeEquipamentos,
            deHabilidades: resistenciasDeHabilidades,
        },
        itensInventarioCalculados,
        bonusHabilidades,
        grausLivresInfo: {
            base: baseLivres,
            deHabilidades: extrasLivres.deHabilidades,
            deIntelecto: extrasLivres.deIntelecto,
            total: maxTotalLivres,
            gastos: pontosUsuario,
        },
        periciasLivresInfo: {
            base: maxLivresBase,
            deIntelecto: periciasLivresExtras,
            total: maxLivresTotal,
        },
    };
}
//# sourceMappingURL=personagem-base.engine.js.map