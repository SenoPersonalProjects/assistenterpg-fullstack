import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class EquipamentoNaoEncontradoException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class EquipamentoCodigoDuplicadoException extends BusinessException {
    constructor(codigo: string);
}
export declare class EquipamentoEmUsoException extends BusinessException {
    constructor(equipamentoId: number, totalUsos: number, usosInventarioBase: number, usosInventarioCampanha: number);
}
