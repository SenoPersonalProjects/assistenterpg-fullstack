"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewClaCustom = validateHomebrewClaCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validateHomebrewClaCustom(dados) {
    if (!isRecord(dados))
        return;
    const tecnicaInataId = dados.tecnicaInataId;
    if (tecnicaInataId !== undefined && tecnicaInataId !== null) {
        if (typeof tecnicaInataId !== 'number' || tecnicaInataId <= 0) {
            throw new validation_exception_1.FormatoInvalidoException('tecnicaInataId', 'número positivo');
        }
    }
}
//# sourceMappingURL=validate-homebrew-cla.js.map