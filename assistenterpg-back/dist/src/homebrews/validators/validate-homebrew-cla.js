"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewClaCustom = validateHomebrewClaCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewClaCustom(dados) {
    if (dados.tecnicaInataId !== undefined && dados.tecnicaInataId !== null) {
        if (typeof dados.tecnicaInataId !== 'number' || dados.tecnicaInataId <= 0) {
            throw new validation_exception_1.FormatoInvalidoException('tecnicaInataId', 'número positivo');
        }
    }
}
//# sourceMappingURL=validate-homebrew-cla.js.map