"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpcSessaoNaoEncontradoException = exports.SessaoTurnoIndisponivelEmCenaLivreException = exports.SessaoCampanhaNaoEncontradaException = exports.CampanhaModificadorJaDesfeitoException = exports.CampanhaModificadorNaoEncontradoException = exports.CampanhaPersonagemDesassociacaoNegadaException = exports.CampanhaPersonagemEdicaoNegadaException = exports.CampanhaPersonagemLimiteUsuarioException = exports.CampanhaPersonagemAssociacaoNegadaException = exports.PersonagemCampanhaNaoEncontradoException = exports.ConviteCodigoIndisponivelException = exports.ConvitePendenteDuplicadoException = exports.ConviteNaoPertenceUsuarioException = exports.ConviteInvalidoOuUtilizadoException = exports.ConviteNaoEncontradoException = exports.UsuarioJaMembroCampanhaException = exports.UsuarioNaoEncontradoException = exports.CampanhaApenasMestreException = exports.CampanhaApenasDonoException = exports.CampanhaAcessoNegadoException = exports.CampanhaNaoEncontradaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
class CampanhaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Campanha nao encontrada', common_1.HttpStatus.NOT_FOUND, 'CAMPANHA_NOT_FOUND', {
            identificador,
        });
    }
}
exports.CampanhaNaoEncontradaException = CampanhaNaoEncontradaException;
class CampanhaAcessoNegadoException extends business_exception_1.BusinessException {
    constructor(campanhaId, usuarioId) {
        super('Voce nao tem acesso a esta campanha', 'CAMPANHA_ACESSO_NEGADO', {
            campanhaId,
            usuarioId,
        });
    }
}
exports.CampanhaAcessoNegadoException = CampanhaAcessoNegadoException;
class CampanhaApenasDonoException extends business_exception_1.BusinessException {
    constructor(acao) {
        super(`Apenas o dono pode ${acao}`, 'CAMPANHA_APENAS_DONO', { acao });
    }
}
exports.CampanhaApenasDonoException = CampanhaApenasDonoException;
class CampanhaApenasMestreException extends business_exception_1.BusinessException {
    constructor(acao) {
        super(`Apenas mestre pode ${acao} nesta campanha`, 'CAMPANHA_APENAS_MESTRE', { acao });
    }
}
exports.CampanhaApenasMestreException = CampanhaApenasMestreException;
class UsuarioNaoEncontradoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Usuario nao encontrado', common_1.HttpStatus.NOT_FOUND, 'USUARIO_NOT_FOUND', {
            identificador,
        });
    }
}
exports.UsuarioNaoEncontradoException = UsuarioNaoEncontradoException;
class UsuarioJaMembroCampanhaException extends business_exception_1.BusinessException {
    constructor(usuarioId, campanhaId) {
        super('Usuario ja e membro desta campanha', 'USUARIO_JA_MEMBRO', {
            usuarioId,
            campanhaId,
        });
    }
}
exports.UsuarioJaMembroCampanhaException = UsuarioJaMembroCampanhaException;
class ConviteNaoEncontradoException extends base_exception_1.BaseException {
    constructor(codigo) {
        super('Convite nao encontrado', common_1.HttpStatus.NOT_FOUND, 'CONVITE_NOT_FOUND', {
            codigo,
        });
    }
}
exports.ConviteNaoEncontradoException = ConviteNaoEncontradoException;
class ConviteInvalidoOuUtilizadoException extends business_exception_1.BusinessException {
    constructor(codigo, status) {
        super('Convite invalido ou ja utilizado', 'CONVITE_INVALIDO', {
            codigo,
            status,
        });
    }
}
exports.ConviteInvalidoOuUtilizadoException = ConviteInvalidoOuUtilizadoException;
class ConviteNaoPertenceUsuarioException extends business_exception_1.BusinessException {
    constructor(conviteEmail, usuarioEmail) {
        super('Este convite nao pertence a este usuario', 'CONVITE_NAO_PERTENCE_USUARIO', {
            conviteEmail,
            usuarioEmail,
        });
    }
}
exports.ConviteNaoPertenceUsuarioException = ConviteNaoPertenceUsuarioException;
class ConvitePendenteDuplicadoException extends business_exception_1.BusinessException {
    constructor(campanhaId, email) {
        super('Ja existe convite pendente para este email nesta campanha', 'CONVITE_DUPLICADO_PENDENTE', {
            campanhaId,
            email,
        });
    }
}
exports.ConvitePendenteDuplicadoException = ConvitePendenteDuplicadoException;
class ConviteCodigoIndisponivelException extends base_exception_1.BaseException {
    constructor(campanhaId, tentativas) {
        super('Nao foi possivel gerar codigo unico para convite', common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'CONVITE_CODIGO_INDISPONIVEL', { campanhaId, tentativas });
    }
}
exports.ConviteCodigoIndisponivelException = ConviteCodigoIndisponivelException;
class PersonagemCampanhaNaoEncontradoException extends base_exception_1.BaseException {
    constructor(personagemCampanhaId, campanhaId) {
        super('Personagem da campanha nao encontrado', common_1.HttpStatus.NOT_FOUND, 'PERSONAGEM_CAMPANHA_NOT_FOUND', {
            personagemCampanhaId,
            campanhaId,
        });
    }
}
exports.PersonagemCampanhaNaoEncontradoException = PersonagemCampanhaNaoEncontradoException;
class CampanhaPersonagemAssociacaoNegadaException extends business_exception_1.BusinessException {
    constructor(campanhaId, usuarioId, personagemBaseId) {
        super('Voce nao pode associar este personagem-base a esta campanha', 'CAMPANHA_PERSONAGEM_ASSOCIACAO_NEGADA', {
            campanhaId,
            usuarioId,
            personagemBaseId,
        });
    }
}
exports.CampanhaPersonagemAssociacaoNegadaException = CampanhaPersonagemAssociacaoNegadaException;
class CampanhaPersonagemLimiteUsuarioException extends business_exception_1.BusinessException {
    constructor(campanhaId, usuarioId) {
        super('Este usuario ja possui um personagem associado nesta campanha', 'CAMPANHA_PERSONAGEM_LIMITE_USUARIO', {
            campanhaId,
            usuarioId,
        });
    }
}
exports.CampanhaPersonagemLimiteUsuarioException = CampanhaPersonagemLimiteUsuarioException;
class CampanhaPersonagemEdicaoNegadaException extends business_exception_1.BusinessException {
    constructor(campanhaId, personagemCampanhaId, usuarioId) {
        super('Voce nao tem permissao para editar esta ficha de campanha', 'CAMPANHA_PERSONAGEM_EDICAO_NEGADA', {
            campanhaId,
            personagemCampanhaId,
            usuarioId,
        });
    }
}
exports.CampanhaPersonagemEdicaoNegadaException = CampanhaPersonagemEdicaoNegadaException;
class CampanhaPersonagemDesassociacaoNegadaException extends business_exception_1.BusinessException {
    constructor(campanhaId, personagemCampanhaId, sessaoId) {
        super('Nao e possivel desassociar personagem que ja participou de sessao', 'CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA', {
            campanhaId,
            personagemCampanhaId,
            sessaoId,
        });
    }
}
exports.CampanhaPersonagemDesassociacaoNegadaException = CampanhaPersonagemDesassociacaoNegadaException;
class CampanhaModificadorNaoEncontradoException extends base_exception_1.BaseException {
    constructor(modificadorId, personagemCampanhaId) {
        super('Modificador da ficha de campanha nao encontrado', common_1.HttpStatus.NOT_FOUND, 'CAMPANHA_MODIFICADOR_NOT_FOUND', {
            modificadorId,
            personagemCampanhaId,
        });
    }
}
exports.CampanhaModificadorNaoEncontradoException = CampanhaModificadorNaoEncontradoException;
class CampanhaModificadorJaDesfeitoException extends business_exception_1.BusinessException {
    constructor(modificadorId, personagemCampanhaId) {
        super('Este modificador ja foi desfeito', 'CAMPANHA_MODIFICADOR_JA_DESFEITO', {
            modificadorId,
            personagemCampanhaId,
        });
    }
}
exports.CampanhaModificadorJaDesfeitoException = CampanhaModificadorJaDesfeitoException;
class SessaoCampanhaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(sessaoId, campanhaId) {
        super('Sessao da campanha nao encontrada', common_1.HttpStatus.NOT_FOUND, 'SESSAO_CAMPANHA_NOT_FOUND', {
            sessaoId,
            campanhaId,
        });
    }
}
exports.SessaoCampanhaNaoEncontradaException = SessaoCampanhaNaoEncontradaException;
class SessaoTurnoIndisponivelEmCenaLivreException extends business_exception_1.BusinessException {
    constructor(sessaoId, campanhaId) {
        super('Cena livre nao possui controle de turnos ou rodadas', 'SESSAO_TURNO_INDISPONIVEL', {
            sessaoId,
            campanhaId,
        });
    }
}
exports.SessaoTurnoIndisponivelEmCenaLivreException = SessaoTurnoIndisponivelEmCenaLivreException;
class NpcSessaoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(npcSessaoId, sessaoId, campanhaId) {
        super('NPC/Ameaca da sessao nao encontrado', common_1.HttpStatus.NOT_FOUND, 'NPC_SESSAO_NOT_FOUND', {
            npcSessaoId,
            sessaoId,
            campanhaId,
        });
    }
}
exports.NpcSessaoNaoEncontradoException = NpcSessaoNaoEncontradoException;
//# sourceMappingURL=campanha.exception.js.map