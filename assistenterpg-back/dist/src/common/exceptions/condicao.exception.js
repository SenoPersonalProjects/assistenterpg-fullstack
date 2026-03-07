"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CondicaoEmUsoException = exports.CondicaoNomeDuplicadoException = exports.CondicaoNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class CondicaoNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Condição não encontrada', common_1.HttpStatus.NOT_FOUND, 'CONDICAO_NOT_FOUND', { identificador });
    }
}
exports.CondicaoNaoEncontradaException = CondicaoNaoEncontradaException;
class CondicaoNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Condição com nome "${nome}" já existe`, 'CONDICAO_NOME_DUPLICADO', {
            nome,
        });
    }
}
exports.CondicaoNomeDuplicadoException = CondicaoNomeDuplicadoException;
class CondicaoEmUsoException extends business_exception_1.BusinessException {
    constructor(condicaoId, totalUsosSessoes) {
        super(`Condição está sendo usada em ${totalUsosSessoes} sessão(ões). Remova as referências primeiro.`, 'CONDICAO_EM_USO', { condicaoId, totalUsosSessoes });
    }
}
exports.CondicaoEmUsoException = CondicaoEmUsoException;
//# sourceMappingURL=condicao.exception.js.map