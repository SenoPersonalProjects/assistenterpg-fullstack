"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomebrewSemPermissaoException = exports.HomebrewDadosInvalidosException = exports.HomebrewJaPublicadoException = exports.HomebrewNaoEncontradoException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
const validation_exception_1 = require("./validation.exception");
class HomebrewNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Homebrew não encontrado', common_1.HttpStatus.NOT_FOUND, 'HOMEBREW_NOT_FOUND', { identificador });
    }
}
exports.HomebrewNaoEncontradoException = HomebrewNaoEncontradoException;
class HomebrewJaPublicadoException extends business_exception_1.BusinessException {
    constructor(homebrewId) {
        super('Homebrew já está publicado', 'HOMEBREW_JA_PUBLICADO', { homebrewId });
    }
}
exports.HomebrewJaPublicadoException = HomebrewJaPublicadoException;
class HomebrewDadosInvalidosException extends validation_exception_1.ValidationException {
    constructor(erros) {
        super('Dados do homebrew são inválidos', 'dados', { erros }, 'HOMEBREW_DADOS_INVALIDOS');
    }
}
exports.HomebrewDadosInvalidosException = HomebrewDadosInvalidosException;
class HomebrewSemPermissaoException extends base_exception_1.BaseException {
    constructor(acao, recurso = 'este homebrew', homebrewId) {
        super(`Você não tem permissão para ${acao} ${recurso}`, common_1.HttpStatus.FORBIDDEN, 'HOMEBREW_SEM_PERMISSAO', { acao, recurso, homebrewId });
    }
}
exports.HomebrewSemPermissaoException = HomebrewSemPermissaoException;
//# sourceMappingURL=homebrew.exception.js.map