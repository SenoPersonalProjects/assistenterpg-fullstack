"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoGrauEmUsoException = exports.TipoGrauCodigoDuplicadoException = exports.TipoGrauNaoEncontradoException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class TipoGrauNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Tipo de grau não encontrado', common_1.HttpStatus.NOT_FOUND, 'TIPO_GRAU_NOT_FOUND', { identificador });
    }
}
exports.TipoGrauNaoEncontradoException = TipoGrauNaoEncontradoException;
class TipoGrauCodigoDuplicadoException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Tipo de grau com código "${codigo}" já existe`, 'TIPO_GRAU_CODIGO_DUPLICADO', { codigo });
    }
}
exports.TipoGrauCodigoDuplicadoException = TipoGrauCodigoDuplicadoException;
class TipoGrauEmUsoException extends business_exception_1.BusinessException {
    constructor(tipoGrauId, totalUsos, detalhesUso) {
        super(`Tipo de grau está sendo usado em ${totalUsos} referência(s). Remova as referências primeiro.`, 'TIPO_GRAU_EM_USO', { tipoGrauId, totalUsos, detalhesUso });
    }
}
exports.TipoGrauEmUsoException = TipoGrauEmUsoException;
//# sourceMappingURL=tipo-grau.exception.js.map