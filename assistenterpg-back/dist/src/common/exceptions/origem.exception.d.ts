import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class OrigemNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class OrigemNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class OrigemPericiasInvalidasException extends BaseException {
    constructor(periciasInvalidas?: number[]);
}
export declare class OrigemHabilidadesInvalidasException extends BaseException {
    constructor(habilidadesInvalidas?: number[]);
}
export declare class OrigemEmUsoException extends BusinessException {
    constructor(origemId: number, totalUsos: number, detalhesUso: {
        personagensBase: number;
        personagensCampanha: number;
    });
}
