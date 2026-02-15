"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewTecnicaCustom = validateHomebrewTecnicaCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewTecnicaCustom(dados) {
    if (!dados.habilidades || dados.habilidades.length === 0) {
        throw new validation_exception_1.ValidationException('Técnica deve ter pelo menos 1 habilidade', 'habilidades', { minimoHabilidades: 1, recebido: 0 }, 'MIN_ABILITIES_REQUIRED');
    }
    const codigos = dados.habilidades.map((h) => h.codigo);
    const codigosUnicos = new Set(codigos);
    if (codigos.length !== codigosUnicos.size) {
        const duplicados = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);
        throw new validation_exception_1.ValoresUnicosException('habilidades.codigo', duplicados);
    }
    dados.habilidades.forEach((hab, index) => {
        if (hab.variacoes && hab.variacoes.length > 0) {
            const nomesVariacoes = hab.variacoes.map((v) => v.nome);
            const nomesUnicos = new Set(nomesVariacoes);
            if (nomesVariacoes.length !== nomesUnicos.size) {
                const duplicados = nomesVariacoes.filter((nome, i) => nomesVariacoes.indexOf(nome) !== i);
                throw new validation_exception_1.ValidationException(`Habilidade "${hab.nome || index}": Nomes de variações devem ser únicos`, `habilidades[${index}].variacoes`, { duplicados }, 'DUPLICATE_VARIATION_NAMES');
            }
        }
    });
}
//# sourceMappingURL=validate-homebrew-tecnica.js.map