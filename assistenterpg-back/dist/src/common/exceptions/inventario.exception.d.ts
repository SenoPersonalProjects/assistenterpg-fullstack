import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
export declare class InventarioPersonagemNaoEncontradoException extends BaseException {
    constructor(personagemBaseId: number);
}
export declare class InventarioSemPermissaoException extends BaseException {
    constructor(personagemBaseId: number, usuarioId: number);
}
export declare class InventarioItemNaoEncontradoException extends BaseException {
    constructor(itemId: number);
}
export declare class InventarioEquipamentoNaoEncontradoException extends BaseException {
    constructor(equipamentoId: number);
}
export declare class InventarioLimiteVestirExcedidoException extends BusinessException {
    constructor(detalhes: {
        erros: string[];
        totalVestiveis: number;
        totalVestimentas: number;
        limiteVestiveis: number;
        limiteVestimentas: number;
    });
}
export declare class InventarioCapacidadeExcedidaException extends BusinessException {
    constructor(detalhes: {
        espacosOcupados: number;
        espacosAdicionais: number;
        espacosAposAdicao: number;
        capacidadeNormal: number;
        limiteMaximo: number;
        excedente: number;
    });
}
export declare class InventarioEspacosInsuficientesException extends BusinessException {
    constructor(espacosNecessarios: number, espacosDisponiveis: number);
}
export declare class InventarioGrauXamaExcedidoException extends BusinessException {
    constructor(grauAtual: string, erros: string[]);
}
export declare class InventarioModificacaoNaoEncontradaException extends BaseException {
    constructor(modificacaoId: number);
}
export declare class InventarioModificacaoInvalidaException extends BusinessException {
    constructor(modificacoesInvalidas: number[]);
}
export declare class InventarioModificacaoIncompativelException extends BusinessException {
    constructor(modificacaoId: number, equipamentoId: number);
}
export declare class InventarioModificacaoDuplicadaException extends BusinessException {
    constructor(modificacaoId: number, itemId: number);
}
export declare class InventarioModificacaoNaoAplicadaException extends BusinessException {
    constructor(modificacaoId: number, itemId: number);
}
