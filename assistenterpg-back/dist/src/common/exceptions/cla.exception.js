"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaEmUsoException = exports.TecnicasHereditariasInvalidasException = exports.ClaNomeDuplicadoException = exports.ClaNaoEncontradoException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class ClaNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Clã não encontrado', common_1.HttpStatus.NOT_FOUND, 'CLA_NOT_FOUND', { identificador });
    }
}
exports.ClaNaoEncontradoException = ClaNaoEncontradoException;
class ClaNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Clã com nome "${nome}" já existe`, 'CLA_NOME_DUPLICADO', { nome });
    }
}
exports.ClaNomeDuplicadoException = ClaNomeDuplicadoException;
class TecnicasHereditariasInvalidasException extends business_exception_1.BusinessException {
    constructor(idsInvalidos) {
        super('Uma ou mais técnicas fornecidas não existem ou não são hereditárias', 'CLA_TECNICAS_INVALIDAS', { idsInvalidos });
    }
}
exports.TecnicasHereditariasInvalidasException = TecnicasHereditariasInvalidasException;
class ClaEmUsoException extends business_exception_1.BusinessException {
    constructor(totalUsos, usosBase, usosCampanha) {
        super(`Clã está sendo usado por ${totalUsos} personagem(ns). Remova as referências primeiro.`, 'CLA_EM_USO', { totalUsos, usosBase, usosCampanha });
    }
}
exports.ClaEmUsoException = ClaEmUsoException;
//# sourceMappingURL=cla.exception.js.map