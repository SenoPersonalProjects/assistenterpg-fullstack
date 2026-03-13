import { BaseException } from './base.exception';
export declare class CredenciaisInvalidasException extends BaseException {
    constructor();
}
export declare class TokenInvalidoException extends BaseException {
    constructor(motivo?: string);
}
export declare class AuthTokenInvalidoOuExpiradoException extends BaseException {
    constructor();
}
export declare class AuthEmailNaoVerificadoException extends BaseException {
    constructor();
}
export declare class UsuarioTokenNaoEncontradoException extends BaseException {
    constructor(usuarioId: number);
}
export declare class UsuarioNaoAutenticadoException extends BaseException {
    constructor();
}
export declare class AcessoNegadoException extends BaseException {
    constructor(recurso?: string, roleNecessaria?: string);
}
