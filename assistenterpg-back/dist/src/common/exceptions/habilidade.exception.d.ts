import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class HabilidadeNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class HabilidadeNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class TipoGrauNaoEncontradoException extends BaseException {
    constructor(codigosInvalidos: string[]);
}
export declare class HabilidadeEmUsoException extends BusinessException {
    constructor(habilidadeId: number, totalUsos: number, detalhesUso: {
        personagensBase: number;
        personagensCampanha: number;
        classes: number;
        trilhas: number;
        origens: number;
    });
}
