"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipamentoEmUsoException = exports.EquipamentoCodigoDuplicadoException = exports.EquipamentoNaoEncontradoException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class EquipamentoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Equipamento não encontrado', common_1.HttpStatus.NOT_FOUND, 'EQUIPAMENTO_NOT_FOUND', { identificador });
    }
}
exports.EquipamentoNaoEncontradoException = EquipamentoNaoEncontradoException;
class EquipamentoCodigoDuplicadoException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Já existe um equipamento com o código ${codigo}`, 'EQUIPAMENTO_CODIGO_DUPLICADO', { codigo });
    }
}
exports.EquipamentoCodigoDuplicadoException = EquipamentoCodigoDuplicadoException;
class EquipamentoEmUsoException extends business_exception_1.BusinessException {
    constructor(equipamentoId, totalUsos, usosInventarioBase, usosInventarioCampanha) {
        super(`Não é possível deletar este equipamento pois ele está sendo usado em ${totalUsos} inventário(s)`, 'EQUIPAMENTO_EM_USO', { equipamentoId, totalUsos, usosInventarioBase, usosInventarioCampanha });
    }
}
exports.EquipamentoEmUsoException = EquipamentoEmUsoException;
//# sourceMappingURL=equipamento.exception.js.map