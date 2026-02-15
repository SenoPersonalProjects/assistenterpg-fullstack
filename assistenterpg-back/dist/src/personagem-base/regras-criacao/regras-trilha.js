"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarRequisitosTrilha = validarRequisitosTrilha;
exports.validarTrilhaECaminho = validarTrilhaECaminho;
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
function validarRequisitosTrilha(requisitos, periciasPersonagem) {
    if (!requisitos?.pericias) {
        return { valido: true };
    }
    for (const req of requisitos.pericias) {
        const pericia = periciasPersonagem.find((p) => p.codigo === req.codigo);
        if (req.treinada && (!pericia || pericia.grauTreinamento < 1)) {
            return {
                valido: false,
                mensagemErro: `A trilha requer a perícia "${req.codigo}" treinada.`,
            };
        }
    }
    return { valido: true };
}
async function validarTrilhaECaminho(classeId, trilhaId, caminhoId, periciasPersonagem, prisma) {
    if (trilhaId) {
        const trilha = await prisma.trilha.findUnique({
            where: { id: trilhaId },
            select: { classeId: true, requisitos: true },
        });
        if (!trilha)
            throw new personagem_exception_1.TrilhaNaoEncontradaException(trilhaId);
        if (trilha.classeId !== classeId) {
            throw new personagem_exception_1.TrilhaIncompativelException();
        }
        if (periciasPersonagem && trilha.requisitos) {
            const validacao = validarRequisitosTrilha(trilha.requisitos, periciasPersonagem);
            if (!validacao.valido) {
                throw new personagem_exception_1.TrilhaRequisitoNaoAtendidoException(validacao.mensagemErro);
            }
        }
    }
    if (caminhoId) {
        if (!trilhaId) {
            throw new personagem_exception_1.CaminhoSemTrilhaException();
        }
        const caminho = await prisma.caminho.findUnique({
            where: { id: caminhoId },
            select: { trilhaId: true },
        });
        if (!caminho)
            throw new personagem_exception_1.CaminhoNaoEncontradoException(caminhoId);
        if (caminho.trilhaId !== trilhaId) {
            throw new personagem_exception_1.CaminhoIncompativelException();
        }
    }
}
//# sourceMappingURL=regras-trilha.js.map