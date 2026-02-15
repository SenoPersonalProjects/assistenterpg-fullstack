import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class TipoGrauNaoEncontradoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class TipoGrauCodigoDuplicadoException extends BusinessException {
    constructor(codigo: string);
}
export declare class TipoGrauEmUsoException extends BusinessException {
    constructor(tipoGrauId: number, totalUsos: number, detalhesUso?: Record<string, number>);
}
