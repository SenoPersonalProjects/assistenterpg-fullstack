import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class TecnicaNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class TecnicaCodigoOuNomeDuplicadoException extends BusinessException {
    constructor(codigo: string, nome: string);
}
export declare class TecnicaNaoInataHereditariaException extends BusinessException {
    constructor(tipo: string);
}
export declare class TecnicaHereditariaSemClaException extends BusinessException {
    constructor(tecnicaId?: number);
}
export declare class TecnicaSuplementoNaoEncontradoException extends BaseException {
    constructor(suplementoId: number);
}
export declare class TecnicaEmUsoException extends BusinessException {
    constructor(tecnicaId: number, totalUsos: number, detalhesUso: {
        personagensBaseComInata: number;
        personagensCampanhaComInata: number;
        personagensBaseAprendeu: number;
        personagensCampanhaAprendeu: number;
    });
}
export declare class TecnicaClaNaoEncontradoException extends BaseException {
    constructor(claNome: string);
}
export declare class HabilidadeTecnicaNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
export declare class HabilidadeCodigoDuplicadoException extends BusinessException {
    constructor(codigo: string);
}
export declare class VariacaoHabilidadeNaoEncontradaException extends BaseException {
    constructor(identificador?: string | number);
}
