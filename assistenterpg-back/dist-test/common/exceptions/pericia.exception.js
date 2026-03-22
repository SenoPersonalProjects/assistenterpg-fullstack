"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PericiaNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
class PericiaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Perícia não encontrada', common_1.HttpStatus.NOT_FOUND, 'PERICIA_NOT_FOUND', {
            identificador,
        });
    }
}
exports.PericiaNaoEncontradaException = PericiaNaoEncontradaException;
//# sourceMappingURL=pericia.exception.js.map