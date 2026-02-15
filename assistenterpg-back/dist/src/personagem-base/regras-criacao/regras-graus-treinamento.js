"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarGrausTreinamento = validarGrausTreinamento;
exports.aplicarGrausTreinamento = aplicarGrausTreinamento;
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
async function validarGrausTreinamento(nivel, intelecto, grausTreinamento, periciasMap, prisma) {
    if (!grausTreinamento || grausTreinamento.length === 0)
        return;
    const niveisValidos = [3, 7, 11, 16];
    const niveisDisponiveis = niveisValidos.filter((n) => nivel >= n);
    for (const gt of grausTreinamento) {
        if (!niveisDisponiveis.includes(gt.nivel)) {
            throw new personagem_exception_1.GrauTreinamentoNivelInvalidoException(gt.nivel, niveisDisponiveis);
        }
        const maxMelhorias = 2 + intelecto;
        if (gt.melhorias.length > maxMelhorias) {
            throw new personagem_exception_1.GrauTreinamentoExcedeMelhoriasException(gt.nivel, gt.melhorias.length, maxMelhorias, intelecto);
        }
        const codigosUnicos = Array.from(new Set(gt.melhorias.map((m) => m.periciaCodigo)));
        const pericias = await prisma.pericia.findMany({
            where: { codigo: { in: codigosUnicos } },
        });
        const mapaCodigos = new Map(pericias.map((p) => [p.codigo, p.id]));
        for (const melhoria of gt.melhorias) {
            if (!mapaCodigos.has(melhoria.periciaCodigo)) {
                throw new personagem_exception_1.GrauTreinamentoPericiaInexistenteException(melhoria.periciaCodigo);
            }
            const pericia = periciasMap.get(melhoria.periciaCodigo);
            if (!pericia) {
                throw new personagem_exception_1.GrauTreinamentoPericiaDestreinadaException(melhoria.periciaCodigo);
            }
            if (pericia.grauTreinamento === 0) {
                throw new personagem_exception_1.GrauTreinamentoPericiaDestreinadaException(melhoria.periciaCodigo);
            }
            if (melhoria.grauNovo !== melhoria.grauAnterior + 5) {
                throw new personagem_exception_1.GrauTreinamentoProgressaoInvalidaException(melhoria.periciaCodigo, melhoria.grauAnterior, melhoria.grauNovo);
            }
            if (melhoria.grauNovo === 10 && nivel < 3) {
                throw new personagem_exception_1.GrauTreinamentoNivelMinimoException('Graduado', 10, 3);
            }
            if (melhoria.grauNovo === 15 && nivel < 9) {
                throw new personagem_exception_1.GrauTreinamentoNivelMinimoException('Veterano', 15, 9);
            }
            if (melhoria.grauNovo === 20 && nivel < 16) {
                throw new personagem_exception_1.GrauTreinamentoNivelMinimoException('Expert', 20, 16);
            }
        }
    }
}
function aplicarGrausTreinamento(grausTreinamento, periciasMap) {
    if (!grausTreinamento)
        return;
    const melhoriasPorPericia = new Map();
    for (const gt of grausTreinamento) {
        for (const melhoria of gt.melhorias) {
            const atual = melhoriasPorPericia.get(melhoria.periciaCodigo) || 0;
            melhoriasPorPericia.set(melhoria.periciaCodigo, atual + 1);
        }
    }
    for (const [codigo, niveis] of melhoriasPorPericia) {
        const pericia = periciasMap.get(codigo);
        if (pericia) {
            pericia.grauTreinamento += niveis;
        }
    }
}
//# sourceMappingURL=regras-graus-treinamento.js.map