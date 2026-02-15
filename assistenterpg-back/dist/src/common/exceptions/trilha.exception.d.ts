import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class TrilhaNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class TrilhaClasseNaoEncontradaException extends BaseException {
    constructor(classeId: number);
}
export declare class TrilhaNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class TrilhaEmUsoException extends BusinessException {
    constructor(trilhaId: number, totalUsos: number, detalhesUso: {
        personagensBase: number;
        personagensCampanha: number;
    });
}
export declare class CaminhoNaoEncontradoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class CaminhoNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class CaminhoEmUsoException extends BusinessException {
    constructor(caminhoId: number, totalUsos: number, detalhesUso: {
        personagensBase: number;
        personagensCampanha: number;
    });
}
