"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewPoderCustom = validateHomebrewPoderCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewPoderCustom(dados) {
    if (!dados.efeitos ||
        typeof dados.efeitos !== 'string' ||
        dados.efeitos.trim().length === 0) {
        throw new validation_exception_1.ValidationException('Poder deve ter o campo "efeitos" preenchido', 'efeitos', { comprimentoMinimo: 1, recebido: dados.efeitos?.length || 0 }, 'EMPTY_EFFECTS');
    }
}
//# sourceMappingURL=validate-homebrew-poder.js.map