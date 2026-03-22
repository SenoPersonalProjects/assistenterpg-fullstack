"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewTrilhaCustom = validateHomebrewTrilhaCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewTrilhaCustom(dados) {
    if (dados.nivelRequisito !== undefined && dados.nivelRequisito < 1) {
        throw new validation_exception_1.ValorForaDoIntervaloException('nivelRequisito', 1, 20, dados.nivelRequisito);
    }
    const habilidades = dados.habilidades;
    if (!habilidades || habilidades.length === 0) {
        throw new validation_exception_1.ValidationException('Trilha deve ter pelo menos 1 habilidade', 'habilidades', { minimoHabilidades: 1, recebido: 0 }, 'MIN_ABILITIES_REQUIRED');
    }
    const niveis = habilidades.map((habilidade) => habilidade.nivel);
    const niveisOrdenados = [...niveis].sort((a, b) => a - b);
    for (let i = 1; i < niveisOrdenados.length; i++) {
        if (niveisOrdenados[i] === niveisOrdenados[i - 1]) {
            const nivelDuplicado = niveisOrdenados[i];
            throw new validation_exception_1.ValidationException('Habilidades devem ter n�veis �nicos', 'habilidades.nivel', {
                nivelDuplicado,
                posicoesAfetadas: niveis
                    .map((nivel, index) => ({ nivel, index }))
                    .filter((item) => item.nivel === nivelDuplicado)
                    .map((item) => item.index),
            }, 'DUPLICATE_ABILITY_LEVELS');
        }
    }
}
//# sourceMappingURL=validate-homebrew-trilha.js.map