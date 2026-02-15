"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValoresUnicosException = exports.ValorForaDoIntervaloException = exports.FormatoInvalidoException = exports.CampoObrigatorioException = exports.ValidationException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
class ValidationException extends base_exception_1.BaseException {
    constructor(message, field, details, code = 'VALIDATION_ERROR') {
        super(message, common_1.HttpStatus.BAD_REQUEST, code, details, field);
    }
}
exports.ValidationException = ValidationException;
class CampoObrigatorioException extends ValidationException {
    constructor(field) {
        super(`O campo "${field}" é obrigatório`, field, undefined, 'FIELD_REQUIRED');
    }
}
exports.CampoObrigatorioException = CampoObrigatorioException;
class FormatoInvalidoException extends ValidationException {
    constructor(field, formatoEsperado) {
        super(`O campo "${field}" está em formato inválido`, field, { formatoEsperado }, 'INVALID_FORMAT');
    }
}
exports.FormatoInvalidoException = FormatoInvalidoException;
class ValorForaDoIntervaloException extends ValidationException {
    constructor(field, min, max, valorRecebido) {
        super(`O campo "${field}" deve estar entre ${min} e ${max}`, field, { min, max, valorRecebido }, 'OUT_OF_RANGE');
    }
}
exports.ValorForaDoIntervaloException = ValorForaDoIntervaloException;
class ValoresUnicosException extends ValidationException {
    constructor(field, valorDuplicado) {
        super(`O campo "${field}" contém valores duplicados`, field, { valorDuplicado }, 'DUPLICATE_VALUES');
    }
}
exports.ValoresUnicosException = ValoresUnicosException;
//# sourceMappingURL=validation.exception.js.map