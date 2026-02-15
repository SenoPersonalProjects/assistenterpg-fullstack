"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewCaminhoCustom = validateHomebrewCaminhoCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewCaminhoCustom(dados) {
    if (!dados.habilidades || dados.habilidades.length === 0) {
        throw new validation_exception_1.ValidationException('Caminho deve ter pelo menos 1 habilidade', 'habilidades', { minimoHabilidades: 1, recebido: 0 }, 'MIN_ABILITIES_REQUIRED');
    }
}
//# sourceMappingURL=validate-homebrew-caminho.js.map