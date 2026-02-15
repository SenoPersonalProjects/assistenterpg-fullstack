import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class ClaNaoEncontradoException extends BaseException {
    constructor(identificador: string | number);
}
export declare class ClaNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class TecnicasHereditariasInvalidasException extends BusinessException {
    constructor(idsInvalidos?: number[]);
}
export declare class ClaEmUsoException extends BusinessException {
    constructor(totalUsos: number, usosBase: number, usosCampanha: number);
}
