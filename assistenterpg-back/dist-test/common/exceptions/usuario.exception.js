"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioApelidoNaoEncontradoException = exports.UsuarioEmailNaoEncontradoException = exports.UsuarioSenhaIncorretaException = exports.UsuarioEmailDuplicadoException = exports.UsuarioNaoEncontradoException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class UsuarioNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Usuário não encontrado', common_1.HttpStatus.NOT_FOUND, 'USUARIO_NOT_FOUND', {
            identificador,
        });
    }
}
exports.UsuarioNaoEncontradoException = UsuarioNaoEncontradoException;
class UsuarioEmailDuplicadoException extends business_exception_1.BusinessException {
    constructor(email) {
        super('Email já está em uso', 'USUARIO_EMAIL_DUPLICADO', { email });
    }
}
exports.UsuarioEmailDuplicadoException = UsuarioEmailDuplicadoException;
class UsuarioSenhaIncorretaException extends base_exception_1.BaseException {
    constructor(contexto = 'login') {
        const mensagens = {
            login: 'Credenciais inválidas',
            alteracao: 'Senha atual incorreta',
            exclusao: 'Senha incorreta',
        };
        super(mensagens[contexto], common_1.HttpStatus.UNAUTHORIZED, 'USUARIO_SENHA_INCORRETA', { contexto });
    }
}
exports.UsuarioSenhaIncorretaException = UsuarioSenhaIncorretaException;
class UsuarioEmailNaoEncontradoException extends base_exception_1.BaseException {
    constructor(email) {
        super('Usuário com esse email não encontrado', common_1.HttpStatus.NOT_FOUND, 'USUARIO_EMAIL_NOT_FOUND', { email });
    }
}
exports.UsuarioEmailNaoEncontradoException = UsuarioEmailNaoEncontradoException;
class UsuarioApelidoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(apelido) {
        super('Usuário com esse apelido não encontrado', common_1.HttpStatus.NOT_FOUND, 'USUARIO_APELIDO_NOT_FOUND', { apelido });
    }
}
exports.UsuarioApelidoNaoEncontradoException = UsuarioApelidoNaoEncontradoException;
//# sourceMappingURL=usuario.exception.js.map