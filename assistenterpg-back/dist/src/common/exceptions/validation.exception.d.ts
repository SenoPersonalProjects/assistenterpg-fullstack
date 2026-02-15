import { BaseException } from './base.exception';
export declare class ValidationException extends BaseException {
    constructor(message: string, field?: string, details?: any, code?: string);
}
export declare class CampoObrigatorioException extends ValidationException {
    constructor(field: string);
}
export declare class FormatoInvalidoException extends ValidationException {
    constructor(field: string, formatoEsperado: string);
}
export declare class ValorForaDoIntervaloException extends ValidationException {
    constructor(field: string, min: number, max: number, valorRecebido: number);
}
export declare class ValoresUnicosException extends ValidationException {
    constructor(field: string, valorDuplicado: any);
}
