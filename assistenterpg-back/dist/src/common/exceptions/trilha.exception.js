"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaminhoEmUsoException = exports.CaminhoNomeDuplicadoException = exports.CaminhoNaoEncontradoException = exports.TrilhaEmUsoException = exports.TrilhaNomeDuplicadoException = exports.TrilhaClasseNaoEncontradaException = exports.TrilhaNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class TrilhaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Trilha não encontrada', common_1.HttpStatus.NOT_FOUND, 'TRILHA_NOT_FOUND', { identificador });
    }
}
exports.TrilhaNaoEncontradaException = TrilhaNaoEncontradaException;
class TrilhaClasseNaoEncontradaException extends base_exception_1.BaseException {
    constructor(classeId) {
        super(`Classe #${classeId} não encontrada`, common_1.HttpStatus.NOT_FOUND, 'TRILHA_CLASSE_NOT_FOUND', { classeId });
    }
}
exports.TrilhaClasseNaoEncontradaException = TrilhaClasseNaoEncontradaException;
class TrilhaNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Trilha com nome "${nome}" já existe`, 'TRILHA_NOME_DUPLICADO', { nome });
    }
}
exports.TrilhaNomeDuplicadoException = TrilhaNomeDuplicadoException;
class TrilhaEmUsoException extends business_exception_1.BusinessException {
    constructor(trilhaId, totalUsos, detalhesUso) {
        super(`Trilha está sendo usada por ${totalUsos} personagem(ns). Remova as referências primeiro.`, 'TRILHA_EM_USO', { trilhaId, totalUsos, detalhesUso });
    }
}
exports.TrilhaEmUsoException = TrilhaEmUsoException;
class CaminhoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Caminho não encontrado', common_1.HttpStatus.NOT_FOUND, 'CAMINHO_NOT_FOUND', { identificador });
    }
}
exports.CaminhoNaoEncontradoException = CaminhoNaoEncontradoException;
class CaminhoNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Caminho com nome "${nome}" já existe`, 'CAMINHO_NOME_DUPLICADO', { nome });
    }
}
exports.CaminhoNomeDuplicadoException = CaminhoNomeDuplicadoException;
class CaminhoEmUsoException extends business_exception_1.BusinessException {
    constructor(caminhoId, totalUsos, detalhesUso) {
        super(`Caminho está sendo usado por ${totalUsos} personagem(ns). Remova as referências primeiro.`, 'CAMINHO_EM_USO', { caminhoId, totalUsos, detalhesUso });
    }
}
exports.CaminhoEmUsoException = CaminhoEmUsoException;
//# sourceMappingURL=trilha.exception.js.map