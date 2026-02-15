"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModificacaoEquipamentoNaoEncontradoException = exports.ModificacaoEmUsoException = exports.ModificacaoEquipamentosInvalidosException = exports.ModificacaoFonteInvalidaException = exports.ModificacaoSuplementoNaoEncontradoException = exports.ModificacaoCodigoDuplicadoException = exports.ModificacaoNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class ModificacaoNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Modificação não encontrada', common_1.HttpStatus.NOT_FOUND, 'MODIFICACAO_NOT_FOUND', { identificador });
    }
}
exports.ModificacaoNaoEncontradaException = ModificacaoNaoEncontradaException;
class ModificacaoCodigoDuplicadoException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Modificação com código "${codigo}" já existe`, 'MODIFICACAO_CODIGO_DUPLICADO', { codigo });
    }
}
exports.ModificacaoCodigoDuplicadoException = ModificacaoCodigoDuplicadoException;
class ModificacaoSuplementoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(suplementoId) {
        super(`Suplemento com ID ${suplementoId} não encontrado`, common_1.HttpStatus.NOT_FOUND, 'MODIFICACAO_SUPLEMENTO_NOT_FOUND', { suplementoId });
    }
}
exports.ModificacaoSuplementoNaoEncontradoException = ModificacaoSuplementoNaoEncontradoException;
class ModificacaoFonteInvalidaException extends business_exception_1.BusinessException {
    constructor() {
        super('Ao fornecer suplementoId, fonte deve ser SUPLEMENTO', 'MODIFICACAO_FONTE_INVALIDA');
    }
}
exports.ModificacaoFonteInvalidaException = ModificacaoFonteInvalidaException;
class ModificacaoEquipamentosInvalidosException extends base_exception_1.BaseException {
    constructor(idsInvalidos) {
        super('Um ou mais equipamentos fornecidos não existem', common_1.HttpStatus.NOT_FOUND, 'MODIFICACAO_EQUIPAMENTOS_INVALIDOS', { idsInvalidos });
    }
}
exports.ModificacaoEquipamentosInvalidosException = ModificacaoEquipamentosInvalidosException;
class ModificacaoEmUsoException extends business_exception_1.BusinessException {
    constructor(modificacaoId, totalUsos, detalhesUso) {
        super(`Modificação está sendo usada em ${totalUsos} item(ns) de inventário. Remova as referências primeiro.`, 'MODIFICACAO_EM_USO', { modificacaoId, totalUsos, detalhesUso });
    }
}
exports.ModificacaoEmUsoException = ModificacaoEmUsoException;
class ModificacaoEquipamentoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(equipamentoId) {
        super('Equipamento não encontrado', common_1.HttpStatus.NOT_FOUND, 'MODIFICACAO_EQUIPAMENTO_NOT_FOUND', { equipamentoId });
    }
}
exports.ModificacaoEquipamentoNaoEncontradoException = ModificacaoEquipamentoNaoEncontradoException;
//# sourceMappingURL=modificacao.exception.js.map