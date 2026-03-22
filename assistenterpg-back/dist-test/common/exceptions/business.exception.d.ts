import { BaseException } from './base.exception';
export declare class BusinessException extends BaseException {
    constructor(message: string, code?: string, details?: any, field?: string);
}
export declare class HomebrewNaoEncontradoException extends BusinessException {
    constructor(identificador: string | number);
}
export declare class HomebrewJaPublicadoException extends BusinessException {
    constructor(homebrewId: number);
}
export declare class HomebrewDadosInvalidosException extends BusinessException {
    constructor(errors: string[]);
}
export declare class HomebrewTipoNaoSuportadoException extends BusinessException {
    constructor(tipo: string, tiposValidos?: string[]);
}
export declare class PersonagemNaoEncontradoException extends BusinessException {
    constructor(personagemId: number);
}
export declare class PontosInsuficientesException extends BusinessException {
    constructor(tipo: string, disponivel: number, necessario: number);
}
export declare class EquipamentoNaoEncontradoException extends BusinessException {
    constructor(equipamentoId: number);
}
export declare class EspacoInsuficienteException extends BusinessException {
    constructor(espacoDisponivel: number, espacoNecessario: number);
}
export declare class CampanhaNaoEncontradaException extends BusinessException {
    constructor(campanhaId: number);
}
export declare class UsuarioJaNaCampanhaException extends BusinessException {
    constructor(usuarioId: number, campanhaId: number);
}
