import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class ModificacaoNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class ModificacaoCodigoDuplicadoException extends BusinessException {
    constructor(codigo: string);
}
export declare class ModificacaoSuplementoNaoEncontradoException extends BaseException {
    constructor(suplementoId: number);
}
export declare class ModificacaoFonteInvalidaException extends BusinessException {
    constructor();
}
export declare class ModificacaoEquipamentosInvalidosException extends BaseException {
    constructor(idsInvalidos?: number[]);
}
export declare class ModificacaoEmUsoException extends BusinessException {
    constructor(modificacaoId: number, totalUsos: number, detalhesUso: {
        itensBase: number;
        itensCampanha: number;
    });
}
export declare class ModificacaoEquipamentoNaoEncontradoException extends BaseException {
    constructor(equipamentoId: number);
}
