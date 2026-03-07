"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioJaNaCampanhaException = exports.CampanhaNaoEncontradaException = exports.EspacoInsuficienteException = exports.EquipamentoNaoEncontradoException = exports.PontosInsuficientesException = exports.PersonagemNaoEncontradoException = exports.HomebrewTipoNaoSuportadoException = exports.HomebrewDadosInvalidosException = exports.HomebrewJaPublicadoException = exports.HomebrewNaoEncontradoException = exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
class BusinessException extends base_exception_1.BaseException {
    constructor(message, code, details, field) {
        super(message, common_1.HttpStatus.UNPROCESSABLE_ENTITY, code, details, field);
    }
}
exports.BusinessException = BusinessException;
class HomebrewNaoEncontradoException extends BusinessException {
    constructor(identificador) {
        super(`Homebrew não encontrado`, 'HB_NOT_FOUND', { identificador });
    }
}
exports.HomebrewNaoEncontradoException = HomebrewNaoEncontradoException;
class HomebrewJaPublicadoException extends BusinessException {
    constructor(homebrewId) {
        super('Este homebrew já está publicado', 'HB_ALREADY_PUBLISHED', {
            homebrewId,
        });
    }
}
exports.HomebrewJaPublicadoException = HomebrewJaPublicadoException;
class HomebrewDadosInvalidosException extends BusinessException {
    constructor(errors) {
        super('Dados do homebrew inválidos', 'HB_INVALID_DATA', { errors });
    }
}
exports.HomebrewDadosInvalidosException = HomebrewDadosInvalidosException;
class HomebrewTipoNaoSuportadoException extends BusinessException {
    constructor(tipo, tiposValidos) {
        super(`Tipo de homebrew "${tipo}" não suportado`, 'HB_UNSUPPORTED_TYPE', {
            tipo,
            tiposValidos,
        });
    }
}
exports.HomebrewTipoNaoSuportadoException = HomebrewTipoNaoSuportadoException;
class PersonagemNaoEncontradoException extends BusinessException {
    constructor(personagemId) {
        super('Personagem não encontrado', 'CHAR_NOT_FOUND', { personagemId });
    }
}
exports.PersonagemNaoEncontradoException = PersonagemNaoEncontradoException;
class PontosInsuficientesException extends BusinessException {
    constructor(tipo, disponivel, necessario) {
        super(`Pontos de ${tipo} insuficientes`, 'CHAR_INSUFFICIENT_POINTS', {
            tipo,
            disponivel,
            necessario,
        });
    }
}
exports.PontosInsuficientesException = PontosInsuficientesException;
class EquipamentoNaoEncontradoException extends BusinessException {
    constructor(equipamentoId) {
        super('Equipamento não encontrado', 'EQUIP_NOT_FOUND', { equipamentoId });
    }
}
exports.EquipamentoNaoEncontradoException = EquipamentoNaoEncontradoException;
class EspacoInsuficienteException extends BusinessException {
    constructor(espacoDisponivel, espacoNecessario) {
        super('Espaço insuficiente no inventário', 'INV_INSUFFICIENT_SPACE', {
            espacoDisponivel,
            espacoNecessario,
        });
    }
}
exports.EspacoInsuficienteException = EspacoInsuficienteException;
class CampanhaNaoEncontradaException extends BusinessException {
    constructor(campanhaId) {
        super('Campanha não encontrada', 'CAMP_NOT_FOUND', { campanhaId });
    }
}
exports.CampanhaNaoEncontradaException = CampanhaNaoEncontradaException;
class UsuarioJaNaCampanhaException extends BusinessException {
    constructor(usuarioId, campanhaId) {
        super('Usuário já está nesta campanha', 'CAMP_USER_ALREADY_MEMBER', {
            usuarioId,
            campanhaId,
        });
    }
}
exports.UsuarioJaNaCampanhaException = UsuarioJaNaCampanhaException;
//# sourceMappingURL=business.exception.js.map