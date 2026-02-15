import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class CampanhaNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class CampanhaAcessoNegadoException extends BusinessException {
    constructor(campanhaId?: number, usuarioId?: number);
}
export declare class CampanhaApenasDonoException extends BusinessException {
    constructor(acao: string);
}
export declare class UsuarioNaoEncontradoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class UsuarioJaMembroCampanhaException extends BusinessException {
    constructor(usuarioId: number, campanhaId: number);
}
export declare class ConviteNaoEncontradoException extends BaseException {
    constructor(codigo?: string);
}
export declare class ConviteInvalidoOuUtilizadoException extends BusinessException {
    constructor(codigo: string, status?: string);
}
export declare class ConviteNaoPertenceUsuarioException extends BusinessException {
    constructor(conviteEmail: string, usuarioEmail: string);
}
