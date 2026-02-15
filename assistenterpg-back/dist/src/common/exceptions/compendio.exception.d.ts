import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';
export declare class CompendioCategoriaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class CompendioCategoriaDuplicadaException extends BusinessException {
    constructor(codigo: string);
}
export declare class CompendioCategoriaComSubcategoriasException extends BusinessException {
    constructor(categoriaId: number, quantidadeSubcategorias: number);
}
export declare class CompendioSubcategoriaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class CompendioSubcategoriaDuplicadaException extends BusinessException {
    constructor(codigo: string);
}
export declare class CompendioSubcategoriaComArtigosException extends BusinessException {
    constructor(subcategoriaId: number, quantidadeArtigos: number);
}
export declare class CompendioArtigoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class CompendioArtigoDuplicadoException extends BusinessException {
    constructor(codigo: string);
}
export declare class CompendioBuscaInvalidaException extends ValidationException {
    constructor(tamanhoMinimo: number, tamanhoRecebido: number);
}
