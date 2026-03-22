import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class UsuarioNaoEncontradoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class UsuarioEmailDuplicadoException extends BusinessException {
    constructor(email: string);
}
export declare class UsuarioSenhaIncorretaException extends BaseException {
    constructor(contexto?: 'login' | 'alteracao' | 'exclusao');
}
export declare class UsuarioEmailNaoEncontradoException extends BaseException {
    constructor(email: string);
}
export declare class UsuarioApelidoNaoEncontradoException extends BaseException {
    constructor(apelido: string);
}
