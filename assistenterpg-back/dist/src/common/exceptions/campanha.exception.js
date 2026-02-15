"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConviteNaoPertenceUsuarioException = exports.ConviteInvalidoOuUtilizadoException = exports.ConviteNaoEncontradoException = exports.UsuarioJaMembroCampanhaException = exports.UsuarioNaoEncontradoException = exports.CampanhaApenasDonoException = exports.CampanhaAcessoNegadoException = exports.CampanhaNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class CampanhaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Campanha não encontrada', common_1.HttpStatus.NOT_FOUND, 'CAMPANHA_NOT_FOUND', { identificador });
    }
}
exports.CampanhaNaoEncontradaException = CampanhaNaoEncontradaException;
class CampanhaAcessoNegadoException extends business_exception_1.BusinessException {
    constructor(campanhaId, usuarioId) {
        super('Você não tem acesso a esta campanha', 'CAMPANHA_ACESSO_NEGADO', { campanhaId, usuarioId });
    }
}
exports.CampanhaAcessoNegadoException = CampanhaAcessoNegadoException;
class CampanhaApenasDonoException extends business_exception_1.BusinessException {
    constructor(acao) {
        super(`Apenas o dono pode ${acao}`, 'CAMPANHA_APENAS_DONO', { acao });
    }
}
exports.CampanhaApenasDonoException = CampanhaApenasDonoException;
class UsuarioNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Usuário não encontrado', common_1.HttpStatus.NOT_FOUND, 'USUARIO_NOT_FOUND', { identificador });
    }
}
exports.UsuarioNaoEncontradoException = UsuarioNaoEncontradoException;
class UsuarioJaMembroCampanhaException extends business_exception_1.BusinessException {
    constructor(usuarioId, campanhaId) {
        super('Usuário já é membro desta campanha', 'USUARIO_JA_MEMBRO', { usuarioId, campanhaId });
    }
}
exports.UsuarioJaMembroCampanhaException = UsuarioJaMembroCampanhaException;
class ConviteNaoEncontradoException extends base_exception_1.BaseException {
    constructor(codigo) {
        super('Convite não encontrado', common_1.HttpStatus.NOT_FOUND, 'CONVITE_NOT_FOUND', { codigo });
    }
}
exports.ConviteNaoEncontradoException = ConviteNaoEncontradoException;
class ConviteInvalidoOuUtilizadoException extends business_exception_1.BusinessException {
    constructor(codigo, status) {
        super('Convite inválido ou já utilizado', 'CONVITE_INVALIDO', { codigo, status });
    }
}
exports.ConviteInvalidoOuUtilizadoException = ConviteInvalidoOuUtilizadoException;
class ConviteNaoPertenceUsuarioException extends business_exception_1.BusinessException {
    constructor(conviteEmail, usuarioEmail) {
        super('Este convite não pertence a este usuário', 'CONVITE_NAO_PERTENCE_USUARIO', { conviteEmail, usuarioEmail });
    }
}
exports.ConviteNaoPertenceUsuarioException = ConviteNaoPertenceUsuarioException;
//# sourceMappingURL=campanha.exception.js.map