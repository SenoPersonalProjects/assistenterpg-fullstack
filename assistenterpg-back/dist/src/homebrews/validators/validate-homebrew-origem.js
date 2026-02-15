"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewOrigemCustom = validateHomebrewOrigemCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewOrigemCustom(dados) {
    if (!dados.pericias || dados.pericias.length === 0) {
        throw new validation_exception_1.ValidationException('Origem deve ter pelo menos 1 perícia', 'pericias', { minimoPericias: 1, recebido: 0 }, 'MIN_SKILLS_REQUIRED');
    }
    const periciasUnicas = new Set(dados.pericias);
    if (dados.pericias.length !== periciasUnicas.size) {
        const duplicadas = dados.pericias.filter((pericia, index) => dados.pericias.indexOf(pericia) !== index);
        throw new validation_exception_1.ValoresUnicosException('pericias', duplicadas);
    }
}
//# sourceMappingURL=validate-homebrew-origem.js.map