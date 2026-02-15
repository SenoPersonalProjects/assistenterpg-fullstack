"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProficienciaEmUsoException = exports.ProficienciaNomeDuplicadoException = exports.ProficienciaNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class ProficienciaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Proficiência não encontrada', common_1.HttpStatus.NOT_FOUND, 'PROFICIENCIA_NOT_FOUND', { identificador });
    }
}
exports.ProficienciaNaoEncontradaException = ProficienciaNaoEncontradaException;
class ProficienciaNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Proficiência com nome "${nome}" já existe`, 'PROFICIENCIA_NOME_DUPLICADO', { nome });
    }
}
exports.ProficienciaNomeDuplicadoException = ProficienciaNomeDuplicadoException;
class ProficienciaEmUsoException extends business_exception_1.BusinessException {
    constructor(proficienciaId, totalUsos, detalhesUso) {
        super(`Proficiência está sendo usada em ${totalUsos} referência(s). Remova as referências primeiro.`, 'PROFICIENCIA_EM_USO', { proficienciaId, totalUsos, detalhesUso });
    }
}
exports.ProficienciaEmUsoException = ProficienciaEmUsoException;
//# sourceMappingURL=proficiencia.exception.js.map