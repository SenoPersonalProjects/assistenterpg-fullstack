"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabilidadeEmUsoException = exports.TipoGrauNaoEncontradoException = exports.HabilidadeNomeDuplicadoException = exports.HabilidadeNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class HabilidadeNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Habilidade não encontrada', common_1.HttpStatus.NOT_FOUND, 'HABILIDADE_NOT_FOUND', { identificador });
    }
}
exports.HabilidadeNaoEncontradaException = HabilidadeNaoEncontradaException;
class HabilidadeNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(nome) {
        super(`Habilidade com nome "${nome}" já existe`, 'HABILIDADE_NOME_DUPLICADO', { nome });
    }
}
exports.HabilidadeNomeDuplicadoException = HabilidadeNomeDuplicadoException;
class TipoGrauNaoEncontradoException extends base_exception_1.BaseException {
    constructor(codigosInvalidos) {
        super(`Tipos de grau não encontrados: ${codigosInvalidos.join(', ')}`, common_1.HttpStatus.NOT_FOUND, 'TIPO_GRAU_NOT_FOUND', { codigosInvalidos });
    }
}
exports.TipoGrauNaoEncontradoException = TipoGrauNaoEncontradoException;
class HabilidadeEmUsoException extends business_exception_1.BusinessException {
    constructor(habilidadeId, totalUsos, detalhesUso) {
        super(`Habilidade está sendo usada por ${totalUsos} entidade(s). Remova as referências primeiro.`, 'HABILIDADE_EM_USO', { habilidadeId, totalUsos, detalhesUso });
    }
}
exports.HabilidadeEmUsoException = HabilidadeEmUsoException;
//# sourceMappingURL=habilidade.exception.js.map