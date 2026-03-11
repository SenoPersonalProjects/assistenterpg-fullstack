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
export declare class CampanhaApenasMestreException extends BusinessException {
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
export declare class ConvitePendenteDuplicadoException extends BusinessException {
    constructor(campanhaId: number, email: string);
}
export declare class ConviteCodigoIndisponivelException extends BaseException {
    constructor(campanhaId: number, tentativas: number);
}
export declare class PersonagemCampanhaNaoEncontradoException extends BaseException {
    constructor(personagemCampanhaId?: number, campanhaId?: number);
}
export declare class CampanhaPersonagemAssociacaoNegadaException extends BusinessException {
    constructor(campanhaId: number, usuarioId: number, personagemBaseId: number);
}
export declare class CampanhaPersonagemLimiteUsuarioException extends BusinessException {
    constructor(campanhaId: number, usuarioId: number);
}
export declare class CampanhaPersonagemEdicaoNegadaException extends BusinessException {
    constructor(campanhaId: number, personagemCampanhaId: number, usuarioId: number);
}
export declare class CampanhaPersonagemDesassociacaoNegadaException extends BusinessException {
    constructor(campanhaId: number, personagemCampanhaId: number, sessaoId?: number);
}
export declare class CampanhaModificadorNaoEncontradoException extends BaseException {
    constructor(modificadorId: number, personagemCampanhaId: number);
}
export declare class CampanhaModificadorJaDesfeitoException extends BusinessException {
    constructor(modificadorId: number, personagemCampanhaId: number);
}
export declare class SessaoCampanhaNaoEncontradaException extends BaseException {
    constructor(sessaoId?: number, campanhaId?: number);
}
export declare class SessaoTurnoIndisponivelEmCenaLivreException extends BusinessException {
    constructor(sessaoId?: number, campanhaId?: number);
}
export declare class NpcSessaoNaoEncontradoException extends BaseException {
    constructor(npcSessaoId?: number, sessaoId?: number, campanhaId?: number);
}
