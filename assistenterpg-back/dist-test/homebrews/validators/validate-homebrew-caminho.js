"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewCaminhoCustom = validateHomebrewCaminhoCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validateHomebrewCaminhoCustom(dados) {
    const habilidades = isRecord(dados) ? dados.habilidades : undefined;
    if (!Array.isArray(habilidades) || habilidades.length === 0) {
        throw new validation_exception_1.ValidationException('Caminho deve ter pelo menos 1 habilidade', 'habilidades', { minimoHabilidades: 1, recebido: 0 }, 'MIN_ABILITIES_REQUIRED');
    }
}
//# sourceMappingURL=validate-homebrew-caminho.js.map