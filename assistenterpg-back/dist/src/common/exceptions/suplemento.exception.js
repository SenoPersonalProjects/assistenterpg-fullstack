"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuplementoNaoAtivoException = exports.SuplementoJaAtivoException = exports.SuplementoNaoPublicadoException = exports.SuplementoComConteudoVinculadoException = exports.SuplementoCodigoDuplicadoException = exports.SuplementoNaoEncontradoException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class SuplementoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Suplemento não encontrado', common_1.HttpStatus.NOT_FOUND, 'SUPLEMENTO_NOT_FOUND', { identificador });
    }
}
exports.SuplementoNaoEncontradoException = SuplementoNaoEncontradoException;
class SuplementoCodigoDuplicadoException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Suplemento com código "${codigo}" já existe`, 'SUPLEMENTO_CODIGO_DUPLICADO', { codigo });
    }
}
exports.SuplementoCodigoDuplicadoException = SuplementoCodigoDuplicadoException;
class SuplementoComConteudoVinculadoException extends business_exception_1.BusinessException {
    constructor(suplementoId, totalConteudo, detalhesConteudo) {
        super(`Suplemento possui ${totalConteudo} conteúdo(s) vinculado(s) e não pode ser deletado`, 'SUPLEMENTO_COM_CONTEUDO_VINCULADO', { suplementoId, totalConteudo, detalhesConteudo });
    }
}
exports.SuplementoComConteudoVinculadoException = SuplementoComConteudoVinculadoException;
class SuplementoNaoPublicadoException extends business_exception_1.BusinessException {
    constructor(suplementoId, statusAtual) {
        super('Apenas suplementos publicados podem ser ativados', 'SUPLEMENTO_NAO_PUBLICADO', { suplementoId, statusAtual });
    }
}
exports.SuplementoNaoPublicadoException = SuplementoNaoPublicadoException;
class SuplementoJaAtivoException extends business_exception_1.BusinessException {
    constructor(usuarioId, suplementoId) {
        super('Suplemento já está ativo para este usuário', 'SUPLEMENTO_JA_ATIVO', { usuarioId, suplementoId });
    }
}
exports.SuplementoJaAtivoException = SuplementoJaAtivoException;
class SuplementoNaoAtivoException extends base_exception_1.BaseException {
    constructor(usuarioId, suplementoId) {
        super('Suplemento não está ativo para este usuário', common_1.HttpStatus.NOT_FOUND, 'SUPLEMENTO_NAO_ATIVO', { usuarioId, suplementoId });
    }
}
exports.SuplementoNaoAtivoException = SuplementoNaoAtivoException;
//# sourceMappingURL=suplemento.exception.js.map