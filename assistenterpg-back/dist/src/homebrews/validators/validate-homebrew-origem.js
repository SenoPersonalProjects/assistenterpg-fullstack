"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewOrigemCustom = validateHomebrewOrigemCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validateHomebrewOrigemCustom(dados) {
    const periciasRaw = isRecord(dados) ? dados.pericias : undefined;
    if (!Array.isArray(periciasRaw) || periciasRaw.length === 0) {
        throw new validation_exception_1.ValidationException('Origem deve ter pelo menos 1 perícia', 'pericias', { minimoPericias: 1, recebido: 0 }, 'MIN_SKILLS_REQUIRED');
    }
    const periciasUnicas = new Set(periciasRaw);
    if (periciasRaw.length !== periciasUnicas.size) {
        const duplicadas = periciasRaw.filter((pericia, index) => periciasRaw.indexOf(pericia) !== index);
        throw new validation_exception_1.ValoresUnicosException('pericias', duplicadas);
    }
}
//# sourceMappingURL=validate-homebrew-origem.js.map