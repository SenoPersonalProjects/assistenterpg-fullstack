"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrigemEmUsoException = exports.OrigemHabilidadesInvalidasException = exports.OrigemPericiasInvalidasException = exports.OrigemNomeDuplicadoException = exports.OrigemNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class OrigemNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Origem não encontrada', common_1.HttpStatus.NOT_FOUND, 'ORIGEM_NOT_FOUND', {
            identificador,
        });
    }
}
exports.OrigemNaoEncontradaException = OrigemNaoEncontradaException;
class OrigemNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Origem com nome "${nome}" já existe`, 'ORIGEM_NOME_DUPLICADO', {
            nome,
        });
    }
}
exports.OrigemNomeDuplicadoException = OrigemNomeDuplicadoException;
class OrigemPericiasInvalidasException extends base_exception_1.BaseException {
    constructor(periciasInvalidas) {
        super('Uma ou mais perícias fornecidas não existem', common_1.HttpStatus.NOT_FOUND, 'ORIGEM_PERICIAS_INVALIDAS', { periciasInvalidas });
    }
}
exports.OrigemPericiasInvalidasException = OrigemPericiasInvalidasException;
class OrigemHabilidadesInvalidasException extends base_exception_1.BaseException {
    constructor(habilidadesInvalidas) {
        super('Uma ou mais habilidades fornecidas não existem', common_1.HttpStatus.NOT_FOUND, 'ORIGEM_HABILIDADES_INVALIDAS', { habilidadesInvalidas });
    }
}
exports.OrigemHabilidadesInvalidasException = OrigemHabilidadesInvalidasException;
class OrigemEmUsoException extends business_exception_1.BusinessException {
    constructor(origemId, totalUsos, detalhesUso) {
        super(`Origem está sendo usada por ${totalUsos} personagem(ns). Remova as referências primeiro.`, 'ORIGEM_EM_USO', { origemId, totalUsos, detalhesUso });
    }
}
exports.OrigemEmUsoException = OrigemEmUsoException;
//# sourceMappingURL=origem.exception.js.map