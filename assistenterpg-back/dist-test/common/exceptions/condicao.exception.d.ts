import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class CondicaoNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class CondicaoNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class CondicaoEmUsoException extends BusinessException {
    constructor(condicaoId: number, totalUsosSessoes: number);
}
