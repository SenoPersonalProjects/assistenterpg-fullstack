"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewTrilhaCustom = validateHomebrewTrilhaCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewTrilhaCustom(dados) {
    if (dados.nivelRequisito !== undefined && dados.nivelRequisito < 1) {
        throw new validation_exception_1.ValorForaDoIntervaloException('nivelRequisito', 1, 20, dados.nivelRequisito);
    }
    if (!dados.habilidades || dados.habilidades.length === 0) {
        throw new validation_exception_1.ValidationException('Trilha deve ter pelo menos 1 habilidade', 'habilidades', { minimoHabilidades: 1, recebido: 0 }, 'MIN_ABILITIES_REQUIRED');
    }
    const niveis = dados.habilidades.map((h) => h.nivel);
    const niveisOrdenados = [...niveis].sort((a, b) => a - b);
    for (let i = 1; i < niveisOrdenados.length; i++) {
        if (niveisOrdenados[i] === niveisOrdenados[i - 1]) {
            throw new validation_exception_1.ValidationException(`Habilidades devem ter níveis únicos`, 'habilidades.nivel', {
                nivelDuplicado: niveisOrdenados[i],
                posicoesAfetadas: niveis
                    .map((n, idx) => ({ nivel: n, index: idx }))
                    .filter((item) => item.nivel === niveisOrdenados[i])
                    .map((item) => item.index),
            }, 'DUPLICATE_ABILITY_LEVELS');
        }
    }
}
//# sourceMappingURL=validate-homebrew-trilha.js.map