"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewEquipamentoCustom = validateHomebrewEquipamentoCustom;
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function validateHomebrewEquipamentoCustom(dados) {
    if (dados.categoria) {
        const categoriasValidas = [
            'CATEGORIA_0',
            'CATEGORIA_1',
            'CATEGORIA_2',
            'CATEGORIA_3',
            'CATEGORIA_4',
            'ESPECIAL',
        ];
        if (!categoriasValidas.includes(dados.categoria)) {
            throw new validation_exception_1.ValidationException(`Categoria inválida: "${dados.categoria}"`, 'categoria', { categoriasValidas }, 'INVALID_CATEGORY');
        }
    }
    if (dados.espacos !== undefined) {
        if (dados.espacos < 0 || dados.espacos > 10) {
            throw new validation_exception_1.ValorForaDoIntervaloException('espacos', 0, 10, dados.espacos);
        }
    }
}
//# sourceMappingURL=validate-homebrew-equipamento.js.map