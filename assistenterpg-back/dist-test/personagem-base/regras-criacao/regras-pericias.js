"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.montarPericiasPersonagem = montarPericiasPersonagem;
const personagem_exception_1 = require("src/common/exceptions/personagem.exception");
function aplicarFontePericia(mapa, codigo, fonte) {
    const entry = mapa.get(codigo);
    if (!entry) {
        throw new personagem_exception_1.PericiaNaoEncontradaException(codigo);
    }
    if (entry.grauTreinamento === 0) {
        entry.grauTreinamento = 1;
    }
    else {
        const fonteFixa = fonte === 'ORIGEM_FIXA' ||
            fonte === 'CLASSE_FIXA' ||
            fonte === 'ESCOLA_TECNICA';
        if (fonteFixa)
            entry.bonusExtra += 2;
    }
}
function validarEProcessarPericiasOrigem(origemPericias, periciasOrigemEscolhidasCodigos, mapa) {
    const periciasOrigemEscolhidas = periciasOrigemEscolhidasCodigos ?? [];
    for (const op of origemPericias) {
        if (op.tipo === 'FIXA') {
            aplicarFontePericia(mapa, op.pericia.codigo, 'ORIGEM_FIXA');
        }
    }
    const periciasEscolhaOrigemPorGrupo = new Map();
    for (const op of origemPericias) {
        if (op.tipo === 'ESCOLHA') {
            if (op.grupoEscolha == null) {
                throw new personagem_exception_1.OrigemPericiaSemGrupoException(op.id);
            }
            const lista = periciasEscolhaOrigemPorGrupo.get(op.grupoEscolha) || [];
            lista.push(op.pericia.codigo);
            periciasEscolhaOrigemPorGrupo.set(op.grupoEscolha, lista);
        }
    }
    const escolhidasSet = new Set(periciasOrigemEscolhidas);
    for (const [grupo, codigosPossiveis] of periciasEscolhaOrigemPorGrupo) {
        const intersecao = codigosPossiveis.filter((c) => escolhidasSet.has(c));
        if (intersecao.length !== 1) {
            throw new personagem_exception_1.OrigemPericiaGrupoInvalidoException(grupo, codigosPossiveis);
        }
    }
    const todosCodigosEscolhaOrigem = new Set(Array.from(periciasEscolhaOrigemPorGrupo.values()).flat());
    for (const c of escolhidasSet) {
        if (!todosCodigosEscolhaOrigem.has(c)) {
            throw new personagem_exception_1.OrigemPericiaEscolhaInvalidaException(c);
        }
    }
    for (const codigo of escolhidasSet) {
        aplicarFontePericia(mapa, codigo, 'ORIGEM_ESCOLHA');
    }
}
function validarEProcessarPericiasClasse(classePericias, periciasClasseEscolhidasCodigos, mapa) {
    const periciasClasseEscolhidas = periciasClasseEscolhidasCodigos ?? [];
    for (const cp of classePericias) {
        if (cp.tipo === 'FIXA') {
            aplicarFontePericia(mapa, cp.pericia.codigo, 'CLASSE_FIXA');
        }
    }
    const periciasEscolhaClassePorGrupo = new Map();
    for (const cp of classePericias) {
        if (cp.tipo === 'ESCOLHA') {
            if (cp.grupoEscolha == null) {
                throw new personagem_exception_1.ClassePericiaSemGrupoException(cp.id);
            }
            const lista = periciasEscolhaClassePorGrupo.get(cp.grupoEscolha) || [];
            lista.push(cp.pericia.codigo);
            periciasEscolhaClassePorGrupo.set(cp.grupoEscolha, lista);
        }
    }
    const escolhidasSet = new Set(periciasClasseEscolhidas);
    for (const [grupo, codigosPossiveis] of periciasEscolhaClassePorGrupo) {
        const intersecao = codigosPossiveis.filter((c) => escolhidasSet.has(c));
        if (intersecao.length !== 1) {
            throw new personagem_exception_1.ClassePericiaGrupoInvalidoException(grupo, codigosPossiveis);
        }
    }
    const todosCodigosEscolhaClasse = new Set(Array.from(periciasEscolhaClassePorGrupo.values()).flat());
    for (const c of escolhidasSet) {
        if (!todosCodigosEscolhaClasse.has(c)) {
            throw new personagem_exception_1.ClassePericiaEscolhaInvalidaException(c);
        }
    }
    for (const codigo of escolhidasSet) {
        aplicarFontePericia(mapa, codigo, 'CLASSE_ESCOLHA');
    }
}
function aplicarPericiasEscolaTecnica(estudouEscolaTecnica, mapa) {
    if (!estudouEscolaTecnica)
        return;
    const jujutsuEntry = mapa.get('JUJUTSU');
    if (!jujutsuEntry) {
        throw new personagem_exception_1.PericiaJujutsuNaoEncontradaException();
    }
    aplicarFontePericia(mapa, 'JUJUTSU', 'ESCOLA_TECNICA');
}
async function montarPericiasPersonagem(dto, prisma) {
    const { classeId, origemId, periciasClasseEscolhidasCodigos, periciasOrigemEscolhidasCodigos, periciasLivresCodigos, estudouEscolaTecnica, } = dto;
    const periciasClasseEscolhidas = periciasClasseEscolhidasCodigos ?? [];
    const periciasOrigemEscolhidas = periciasOrigemEscolhidasCodigos ?? [];
    const periciasLivres = periciasLivresCodigos ?? [];
    const [todasPericias, classePericias, origemPericias] = await Promise.all([
        prisma.pericia.findMany(),
        prisma.classePericia.findMany({
            where: { classeId },
            include: { pericia: true },
        }),
        prisma.origemPericia.findMany({
            where: { origemId },
            include: { pericia: true },
        }),
    ]);
    const mapa = new Map();
    for (const p of todasPericias) {
        mapa.set(p.codigo, {
            periciaId: p.id,
            grauTreinamento: 0,
            bonusExtra: 0,
        });
    }
    validarEProcessarPericiasOrigem(origemPericias, periciasOrigemEscolhidas, mapa);
    validarEProcessarPericiasClasse(classePericias, periciasClasseEscolhidas, mapa);
    aplicarPericiasEscolaTecnica(estudouEscolaTecnica, mapa);
    const livresUnicos = Array.from(new Set(periciasLivres));
    for (const codigo of livresUnicos) {
        aplicarFontePericia(mapa, codigo, 'LIVRE');
    }
    return Array.from(mapa.values());
}
//# sourceMappingURL=regras-pericias.js.map