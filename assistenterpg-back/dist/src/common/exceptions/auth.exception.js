"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcessoNegadoException = exports.UsuarioNaoAutenticadoException = exports.UsuarioTokenNaoEncontradoException = exports.TokenInvalidoException = exports.CredenciaisInvalidasException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
class CredenciaisInvalidasException extends base_exception_1.BaseException {
    constructor() {
        super('Credenciais inválidas', common_1.HttpStatus.UNAUTHORIZED, 'CREDENCIAIS_INVALIDAS');
    }
}
exports.CredenciaisInvalidasException = CredenciaisInvalidasException;
class TokenInvalidoException extends base_exception_1.BaseException {
    constructor(motivo) {
        super('Token inválido ou expirado', common_1.HttpStatus.UNAUTHORIZED, 'TOKEN_INVALIDO', { motivo });
    }
}
exports.TokenInvalidoException = TokenInvalidoException;
class UsuarioTokenNaoEncontradoException extends base_exception_1.BaseException {
    constructor(usuarioId) {
        super('Usuário do token não encontrado', common_1.HttpStatus.UNAUTHORIZED, 'USUARIO_TOKEN_NAO_ENCONTRADO', { usuarioId });
    }
}
exports.UsuarioTokenNaoEncontradoException = UsuarioTokenNaoEncontradoException;
class UsuarioNaoAutenticadoException extends base_exception_1.BaseException {
    constructor() {
        super('Autenticação necessária', common_1.HttpStatus.UNAUTHORIZED, 'USUARIO_NAO_AUTENTICADO');
    }
}
exports.UsuarioNaoAutenticadoException = UsuarioNaoAutenticadoException;
class AcessoNegadoException extends base_exception_1.BaseException {
    constructor(recurso, roleNecessaria) {
        const mensagem = roleNecessaria
            ? `Acesso negado. Role necessária: ${roleNecessaria}`
            : 'Acesso negado';
        super(mensagem, common_1.HttpStatus.FORBIDDEN, 'ACESSO_NEGADO', { recurso, roleNecessaria });
    }
}
exports.AcessoNegadoException = AcessoNegadoException;
//# sourceMappingURL=auth.exception.js.map