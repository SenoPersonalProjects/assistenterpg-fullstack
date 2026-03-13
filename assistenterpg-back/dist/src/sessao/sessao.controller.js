"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessaoController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const sessao_service_1 = require("./sessao.service");
const create_sessao_campanha_dto_1 = require("./dto/create-sessao-campanha.dto");
const listar_chat_sessao_dto_1 = require("./dto/listar-chat-sessao.dto");
const enviar_chat_sessao_dto_1 = require("./dto/enviar-chat-sessao.dto");
const atualizar_cena_sessao_dto_1 = require("./dto/atualizar-cena-sessao.dto");
const adicionar_npc_sessao_dto_1 = require("./dto/adicionar-npc-sessao.dto");
const atualizar_npc_sessao_dto_1 = require("./dto/atualizar-npc-sessao.dto");
const listar_eventos_sessao_dto_1 = require("./dto/listar-eventos-sessao.dto");
const desfazer_evento_sessao_dto_1 = require("./dto/desfazer-evento-sessao.dto");
const atualizar_ordem_iniciativa_sessao_dto_1 = require("./dto/atualizar-ordem-iniciativa-sessao.dto");
const usar_habilidade_sessao_dto_1 = require("./dto/usar-habilidade-sessao.dto");
const encerrar_sustentacao_sessao_dto_1 = require("./dto/encerrar-sustentacao-sessao.dto");
const aplicar_condicao_sessao_dto_1 = require("./dto/aplicar-condicao-sessao.dto");
const remover_condicao_sessao_dto_1 = require("./dto/remover-condicao-sessao.dto");
const sessao_gateway_1 = require("./sessao.gateway");
let SessaoController = class SessaoController {
    sessaoService;
    sessaoGateway;
    constructor(sessaoService, sessaoGateway) {
        this.sessaoService = sessaoService;
        this.sessaoGateway = sessaoGateway;
    }
    async listarSessoesCampanha(campanhaId, req) {
        return this.sessaoService.listarSessoesCampanha(campanhaId, req.user.id);
    }
    async criarSessaoCampanha(campanhaId, req, dto) {
        return this.sessaoService.criarSessaoCampanha(campanhaId, req.user.id, dto);
    }
    async buscarDetalheSessao(campanhaId, sessaoId, req) {
        return this.sessaoService.buscarDetalheSessao(campanhaId, sessaoId, req.user.id);
    }
    async listarChatSessao(campanhaId, sessaoId, req, query) {
        return this.sessaoService.listarChatSessao(campanhaId, sessaoId, req.user.id, query.afterId);
    }
    async listarEventosSessao(campanhaId, sessaoId, req, query) {
        return this.sessaoService.listarEventosSessao(campanhaId, sessaoId, req.user.id, query);
    }
    async enviarMensagemChatSessao(campanhaId, sessaoId, req, dto) {
        const resultado = await this.sessaoService.enviarMensagemChatSessao(campanhaId, sessaoId, req.user.id, dto.mensagem);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'CHAT_NOVA');
        return resultado;
    }
    async usarHabilidadeSessao(campanhaId, sessaoId, personagemSessaoId, req, dto) {
        const resultado = await this.sessaoService.usarHabilidadeSessao(campanhaId, sessaoId, personagemSessaoId, req.user.id, dto);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'HABILIDADE_USADA');
        return resultado;
    }
    async aplicarCondicaoSessao(campanhaId, sessaoId, req, dto) {
        const resultado = await this.sessaoService.aplicarCondicaoSessao(campanhaId, sessaoId, req.user.id, dto);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'CONDICAO_APLICADA');
        return resultado;
    }
    async removerCondicaoSessao(campanhaId, sessaoId, condicaoSessaoId, req, dto) {
        const resultado = await this.sessaoService.removerCondicaoSessao(campanhaId, sessaoId, condicaoSessaoId, req.user.id, dto.motivo);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'CONDICAO_REMOVIDA');
        return resultado;
    }
    async encerrarSustentacaoHabilidadeSessao(campanhaId, sessaoId, personagemSessaoId, sustentacaoId, req, dto) {
        const resultado = await this.sessaoService.encerrarSustentacaoHabilidadeSessao(campanhaId, sessaoId, personagemSessaoId, sustentacaoId, req.user.id, dto.motivo);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'HABILIDADE_SUSTENTADA_ENCERRADA');
        return resultado;
    }
    async avancarTurnoSessao(campanhaId, sessaoId, req) {
        const resultado = await this.sessaoService.avancarTurnoSessao(campanhaId, sessaoId, req.user.id);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'TURNO_AVANCADO');
        return resultado;
    }
    async voltarTurnoSessao(campanhaId, sessaoId, req) {
        const resultado = await this.sessaoService.voltarTurnoSessao(campanhaId, sessaoId, req.user.id);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'TURNO_RECUADO');
        return resultado;
    }
    async pularTurnoSessao(campanhaId, sessaoId, req) {
        const resultado = await this.sessaoService.pularTurnoSessao(campanhaId, sessaoId, req.user.id);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'TURNO_PULADO');
        return resultado;
    }
    async atualizarOrdemIniciativaSessao(campanhaId, sessaoId, req, dto) {
        const resultado = await this.sessaoService.atualizarOrdemIniciativaSessao(campanhaId, sessaoId, req.user.id, dto);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'ORDEM_INICIATIVA_ATUALIZADA');
        return resultado;
    }
    async encerrarSessaoCampanha(campanhaId, sessaoId, req) {
        const resultado = await this.sessaoService.encerrarSessaoCampanha(campanhaId, sessaoId, req.user.id);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'SESSAO_ENCERRADA');
        return resultado;
    }
    async atualizarCenaSessao(campanhaId, sessaoId, req, dto) {
        const resultado = await this.sessaoService.atualizarCenaSessao(campanhaId, sessaoId, req.user.id, dto);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'CENA_ATUALIZADA');
        return resultado;
    }
    async adicionarNpcSessao(campanhaId, sessaoId, req, dto) {
        const resultado = await this.sessaoService.adicionarNpcSessao(campanhaId, sessaoId, req.user.id, dto);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'NPC_ATUALIZADO');
        return resultado;
    }
    async atualizarNpcSessao(campanhaId, sessaoId, npcSessaoId, req, dto) {
        const resultado = await this.sessaoService.atualizarNpcSessao(campanhaId, sessaoId, npcSessaoId, req.user.id, dto);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'NPC_ATUALIZADO');
        return resultado;
    }
    async removerNpcSessao(campanhaId, sessaoId, npcSessaoId, req) {
        const resultado = await this.sessaoService.removerNpcSessao(campanhaId, sessaoId, npcSessaoId, req.user.id);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'NPC_ATUALIZADO');
        return resultado;
    }
    async desfazerEventoSessao(campanhaId, sessaoId, eventoId, req, dto) {
        const resultado = await this.sessaoService.desfazerEventoSessao(campanhaId, sessaoId, eventoId, req.user.id, dto.motivo);
        this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'SESSAO_EVENTO_DESFEITO');
        return resultado;
    }
};
exports.SessaoController = SessaoController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "listarSessoesCampanha", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, create_sessao_campanha_dto_1.CreateSessaoCampanhaDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "criarSessaoCampanha", null);
__decorate([
    (0, common_1.Get)(':sessaoId'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "buscarDetalheSessao", null);
__decorate([
    (0, common_1.Get)(':sessaoId/chat'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, listar_chat_sessao_dto_1.ListarChatSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "listarChatSessao", null);
__decorate([
    (0, common_1.Get)(':sessaoId/eventos'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, listar_eventos_sessao_dto_1.ListarEventosSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "listarEventosSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/chat'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, enviar_chat_sessao_dto_1.EnviarChatSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "enviarMensagemChatSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/personagens/:personagemSessaoId/habilidades/usar'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('personagemSessaoId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object, usar_habilidade_sessao_dto_1.UsarHabilidadeSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "usarHabilidadeSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/condicoes/aplicar'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, aplicar_condicao_sessao_dto_1.AplicarCondicaoSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "aplicarCondicaoSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/condicoes/:condicaoSessaoId/remover'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('condicaoSessaoId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object, remover_condicao_sessao_dto_1.RemoverCondicaoSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "removerCondicaoSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/personagens/:personagemSessaoId/sustentacoes/:sustentacaoId/encerrar'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('personagemSessaoId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Param)('sustentacaoId', common_1.ParseIntPipe)),
    __param(4, (0, common_1.Request)()),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number, Object, encerrar_sustentacao_sessao_dto_1.EncerrarSustentacaoSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "encerrarSustentacaoHabilidadeSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/turno/avancar'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "avancarTurnoSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/turno/voltar'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "voltarTurnoSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/turno/pular'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "pularTurnoSessao", null);
__decorate([
    (0, common_1.Patch)(':sessaoId/iniciativa/ordem'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, atualizar_ordem_iniciativa_sessao_dto_1.AtualizarOrdemIniciativaSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "atualizarOrdemIniciativaSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/encerrar'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "encerrarSessaoCampanha", null);
__decorate([
    (0, common_1.Patch)(':sessaoId/cena'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, atualizar_cena_sessao_dto_1.AtualizarCenaSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "atualizarCenaSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/npcs'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, adicionar_npc_sessao_dto_1.AdicionarNpcSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "adicionarNpcSessao", null);
__decorate([
    (0, common_1.Patch)(':sessaoId/npcs/:npcSessaoId'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('npcSessaoId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object, atualizar_npc_sessao_dto_1.AtualizarNpcSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "atualizarNpcSessao", null);
__decorate([
    (0, common_1.Delete)(':sessaoId/npcs/:npcSessaoId'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('npcSessaoId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "removerNpcSessao", null);
__decorate([
    (0, common_1.Post)(':sessaoId/eventos/:eventoId/desfazer'),
    __param(0, (0, common_1.Param)('campanhaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sessaoId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('eventoId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object, desfazer_evento_sessao_dto_1.DesfazerEventoSessaoDto]),
    __metadata("design:returntype", Promise)
], SessaoController.prototype, "desfazerEventoSessao", null);
exports.SessaoController = SessaoController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('campanhas/:campanhaId/sessoes'),
    __metadata("design:paramtypes", [sessao_service_1.SessaoService,
        sessao_gateway_1.SessaoGateway])
], SessaoController);
//# sourceMappingURL=sessao.controller.js.map