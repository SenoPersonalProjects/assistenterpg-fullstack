import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class ProficienciaNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class ProficienciaNomeDuplicadoException extends BusinessException {
    constructor(nome: string);
}
export declare class ProficienciaEmUsoException extends BusinessException {
    constructor(proficienciaId: number, totalUsos: number, detalhesUso?: Record<string, number>);
}
