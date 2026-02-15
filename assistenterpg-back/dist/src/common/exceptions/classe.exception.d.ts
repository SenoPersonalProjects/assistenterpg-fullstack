import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class ClasseNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class ClasseNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class ClasseEmUsoException extends BusinessException {
    constructor(totalUsos: number, usosPersonagensBase: number, usosPersonagensCampanha: number);
}
