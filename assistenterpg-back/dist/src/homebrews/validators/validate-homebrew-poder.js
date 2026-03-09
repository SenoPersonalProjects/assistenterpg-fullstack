"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewPoderCustom = validateHomebrewPoderCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validateHomebrewPoderCustom(dados) {
    const efeitos = isRecord(dados) ? dados.efeitos : undefined;
    if (typeof efeitos !== 'string' || efeitos.trim().length === 0) {
        throw new validation_exception_1.ValidationException('Poder deve ter o campo "efeitos" preenchido', 'efeitos', {
            comprimentoMinimo: 1,
            recebido: typeof efeitos === 'string' ? efeitos.length : 0,
        }, 'EMPTY_EFFECTS');
    }
}
//# sourceMappingURL=validate-homebrew-poder.js.map