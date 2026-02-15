"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariacaoHabilidadeNaoEncontradaException = exports.HabilidadeCodigoDuplicadoException = exports.HabilidadeTecnicaNaoEncontradaException = exports.TecnicaClaNaoEncontradoException = exports.TecnicaEmUsoException = exports.TecnicaSuplementoNaoEncontradoException = exports.TecnicaHereditariaSemClaException = exports.TecnicaNaoInataHereditariaException = exports.TecnicaCodigoOuNomeDuplicadoException = exports.TecnicaNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class TecnicaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Técnica amaldiçoada não encontrada', common_1.HttpStatus.NOT_FOUND, 'TECNICA_NOT_FOUND', { identificador });
    }
}
exports.TecnicaNaoEncontradaException = TecnicaNaoEncontradaException;
class TecnicaCodigoOuNomeDuplicadoException extends business_exception_1.BusinessException {
    constructor(codigo, nome) {
        super(`Técnica com código "${codigo}" ou nome "${nome}" já existe`, 'TECNICA_CODIGO_OU_NOME_DUPLICADO', { codigo, nome });
    }
}
exports.TecnicaCodigoOuNomeDuplicadoException = TecnicaCodigoOuNomeDuplicadoException;
class TecnicaNaoInataHereditariaException extends business_exception_1.BusinessException {
    constructor(tipo) {
        super('Apenas técnicas INATAS podem ser hereditárias', 'TECNICA_NAO_INATA_HEREDITARIA', { tipoAtual: tipo });
    }
}
exports.TecnicaNaoInataHereditariaException = TecnicaNaoInataHereditariaException;
class TecnicaHereditariaSemClaException extends business_exception_1.BusinessException {
    constructor(tecnicaId) {
        super('Técnicas hereditárias devem ter pelo menos um clã', 'TECNICA_HEREDITARIA_SEM_CLA', { tecnicaId });
    }
}
exports.TecnicaHereditariaSemClaException = TecnicaHereditariaSemClaException;
class TecnicaSuplementoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(suplementoId) {
        super(`Suplemento com ID ${suplementoId} não encontrado`, common_1.HttpStatus.NOT_FOUND, 'TECNICA_SUPLEMENTO_NOT_FOUND', { suplementoId });
    }
}
exports.TecnicaSuplementoNaoEncontradoException = TecnicaSuplementoNaoEncontradoException;
class TecnicaEmUsoException extends business_exception_1.BusinessException {
    constructor(tecnicaId, totalUsos, detalhesUso) {
        super(`Técnica está em uso por ${totalUsos} personagem(ns) e não pode ser deletada`, 'TECNICA_EM_USO', { tecnicaId, totalUsos, detalhesUso });
    }
}
exports.TecnicaEmUsoException = TecnicaEmUsoException;
class TecnicaClaNaoEncontradoException extends base_exception_1.BaseException {
    constructor(claNome) {
        super(`Clã "${claNome}" não encontrado`, common_1.HttpStatus.NOT_FOUND, 'TECNICA_CLA_NOT_FOUND', { claNome });
    }
}
exports.TecnicaClaNaoEncontradoException = TecnicaClaNaoEncontradoException;
class HabilidadeTecnicaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Habilidade de técnica não encontrada', common_1.HttpStatus.NOT_FOUND, 'HABILIDADE_TECNICA_NOT_FOUND', { identificador });
    }
}
exports.HabilidadeTecnicaNaoEncontradaException = HabilidadeTecnicaNaoEncontradaException;
class HabilidadeCodigoDuplicadoException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Habilidade com código "${codigo}" já existe`, 'HABILIDADE_CODIGO_DUPLICADO', { codigo });
    }
}
exports.HabilidadeCodigoDuplicadoException = HabilidadeCodigoDuplicadoException;
class VariacaoHabilidadeNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Variação de habilidade não encontrada', common_1.HttpStatus.NOT_FOUND, 'VARIACAO_HABILIDADE_NOT_FOUND', { identificador });
    }
}
exports.VariacaoHabilidadeNaoEncontradaException = VariacaoHabilidadeNaoEncontradaException;
//# sourceMappingURL=tecnica-amaldicoada.exception.js.map