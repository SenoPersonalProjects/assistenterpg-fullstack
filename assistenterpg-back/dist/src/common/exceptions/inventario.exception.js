"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioModificacaoNaoAplicadaException = exports.InventarioModificacaoDuplicadaException = exports.InventarioModificacaoIncompativelException = exports.InventarioModificacaoInvalidaException = exports.InventarioModificacaoNaoEncontradaException = exports.InventarioGrauXamaExcedidoException = exports.InventarioEspacosInsuficientesException = exports.InventarioCapacidadeExcedidaException = exports.InventarioLimiteVestirExcedidoException = exports.InventarioEquipamentoNaoEncontradoException = exports.InventarioItemNaoEncontradoException = exports.InventarioSemPermissaoException = exports.InventarioPersonagemNaoEncontradoException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class InventarioPersonagemNaoEncontradoException extends base_exception_1.BaseException {
    constructor(personagemBaseId) {
        super('Personagem não encontrado', common_1.HttpStatus.NOT_FOUND, 'INVENTARIO_PERSONAGEM_NOT_FOUND', { personagemBaseId });
    }
}
exports.InventarioPersonagemNaoEncontradoException = InventarioPersonagemNaoEncontradoException;
class InventarioSemPermissaoException extends base_exception_1.BaseException {
    constructor(personagemBaseId, usuarioId) {
        super('Você não tem permissão para acessar este personagem', common_1.HttpStatus.FORBIDDEN, 'INVENTARIO_SEM_PERMISSAO', { personagemBaseId, usuarioId });
    }
}
exports.InventarioSemPermissaoException = InventarioSemPermissaoException;
class InventarioItemNaoEncontradoException extends base_exception_1.BaseException {
    constructor(itemId) {
        super('Item não encontrado', common_1.HttpStatus.NOT_FOUND, 'INVENTARIO_ITEM_NOT_FOUND', { itemId });
    }
}
exports.InventarioItemNaoEncontradoException = InventarioItemNaoEncontradoException;
class InventarioEquipamentoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(equipamentoId) {
        super('Equipamento não encontrado', common_1.HttpStatus.NOT_FOUND, 'INVENTARIO_EQUIPAMENTO_NOT_FOUND', { equipamentoId });
    }
}
exports.InventarioEquipamentoNaoEncontradoException = InventarioEquipamentoNaoEncontradoException;
class InventarioLimiteVestirExcedidoException extends business_exception_1.BusinessException {
    constructor(detalhes) {
        super('Limites de itens vestidos excedidos', 'INVENTARIO_LIMITE_VESTIR_EXCEDIDO', detalhes);
    }
}
exports.InventarioLimiteVestirExcedidoException = InventarioLimiteVestirExcedidoException;
class InventarioCapacidadeExcedidaException extends business_exception_1.BusinessException {
    constructor(detalhes) {
        super('Limite máximo de capacidade excedido', 'INVENTARIO_CAPACIDADE_EXCEDIDA', detalhes);
    }
}
exports.InventarioCapacidadeExcedidaException = InventarioCapacidadeExcedidaException;
class InventarioEspacosInsuficientesException extends business_exception_1.BusinessException {
    constructor(espacosNecessarios, espacosDisponiveis) {
        super(`Nova quantidade requer ${espacosNecessarios} espaços, mas você tem apenas ${espacosDisponiveis} disponíveis`, 'INVENTARIO_ESPACOS_INSUFICIENTES', { espacosNecessarios, espacosDisponiveis });
    }
}
exports.InventarioEspacosInsuficientesException = InventarioEspacosInsuficientesException;
class InventarioGrauXamaExcedidoException extends business_exception_1.BusinessException {
    constructor(grauAtual, erros) {
        super('Limites de Grau Xamã excedidos', 'INVENTARIO_GRAU_XAMA_EXCEDIDO', { grauAtual, erros });
    }
}
exports.InventarioGrauXamaExcedidoException = InventarioGrauXamaExcedidoException;
class InventarioModificacaoNaoEncontradaException extends base_exception_1.BaseException {
    constructor(modificacaoId) {
        super('Modificação não encontrada', common_1.HttpStatus.NOT_FOUND, 'INVENTARIO_MODIFICACAO_NOT_FOUND', { modificacaoId });
    }
}
exports.InventarioModificacaoNaoEncontradaException = InventarioModificacaoNaoEncontradaException;
class InventarioModificacaoInvalidaException extends business_exception_1.BusinessException {
    constructor(modificacoesInvalidas) {
        super('Uma ou mais modificações não existem', 'INVENTARIO_MODIFICACAO_INVALIDA', { modificacoesInvalidas });
    }
}
exports.InventarioModificacaoInvalidaException = InventarioModificacaoInvalidaException;
class InventarioModificacaoIncompativelException extends business_exception_1.BusinessException {
    constructor(modificacaoId, equipamentoId) {
        super(`Modificação ID ${modificacaoId} não é compatível com este equipamento`, 'INVENTARIO_MODIFICACAO_INCOMPATIVEL', { modificacaoId, equipamentoId });
    }
}
exports.InventarioModificacaoIncompativelException = InventarioModificacaoIncompativelException;
class InventarioModificacaoDuplicadaException extends business_exception_1.BusinessException {
    constructor(modificacaoId, itemId) {
        super('Este item já possui essa modificação', 'INVENTARIO_MODIFICACAO_DUPLICADA', { modificacaoId, itemId });
    }
}
exports.InventarioModificacaoDuplicadaException = InventarioModificacaoDuplicadaException;
class InventarioModificacaoNaoAplicadaException extends business_exception_1.BusinessException {
    constructor(modificacaoId, itemId) {
        super('Este item não possui essa modificação', 'INVENTARIO_MODIFICACAO_NAO_APLICADA', { modificacaoId, itemId });
    }
}
exports.InventarioModificacaoNaoAplicadaException = InventarioModificacaoNaoAplicadaException;
//# sourceMappingURL=inventario.exception.js.map