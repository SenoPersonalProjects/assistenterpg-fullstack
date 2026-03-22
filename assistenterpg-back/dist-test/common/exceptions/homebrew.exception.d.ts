import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';
export declare class HomebrewNaoEncontradoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class HomebrewJaPublicadoException extends BusinessException {
    constructor(homebrewId: number);
}
export declare class HomebrewDadosInvalidosException extends ValidationException {
    constructor(erros: string[]);
}
export declare class HomebrewSemPermissaoException extends BaseException {
    constructor(acao: string, recurso?: string, homebrewId?: number);
}
