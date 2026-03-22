"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClasseEmUsoException = exports.ClasseNomeDuplicadoException = exports.ClasseNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class ClasseNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Classe não encontrada', common_1.HttpStatus.NOT_FOUND, 'CLASSE_NOT_FOUND', {
            identificador,
        });
    }
}
exports.ClasseNaoEncontradaException = ClasseNaoEncontradaException;
class ClasseNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Classe com nome "${nome}" já existe`, 'CLASSE_NOME_DUPLICADO', {
            nome,
        });
    }
}
exports.ClasseNomeDuplicadoException = ClasseNomeDuplicadoException;
class ClasseEmUsoException extends business_exception_1.BusinessException {
    constructor(totalUsos, usosPersonagensBase, usosPersonagensCampanha) {
        super(`Classe está sendo usada por ${totalUsos} personagem(ns). Remova as referências primeiro.`, 'CLASSE_EM_USO', { totalUsos, usosPersonagensBase, usosPersonagensCampanha });
    }
}
exports.ClasseEmUsoException = ClasseEmUsoException;
//# sourceMappingURL=classe.exception.js.map