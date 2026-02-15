import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class SuplementoNaoEncontradoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class SuplementoCodigoDuplicadoException extends BusinessException {
    constructor(codigo: string);
}
export declare class SuplementoComConteudoVinculadoException extends BusinessException {
    constructor(suplementoId: number, totalConteudo: number, detalhesConteudo: Record<string, number>);
}
export declare class SuplementoNaoPublicadoException extends BusinessException {
    constructor(suplementoId: number, statusAtual: string);
}
export declare class SuplementoJaAtivoException extends BusinessException {
    constructor(usuarioId: number, suplementoId: number);
}
export declare class SuplementoNaoAtivoException extends BaseException {
    constructor(usuarioId: number, suplementoId: number);
}
