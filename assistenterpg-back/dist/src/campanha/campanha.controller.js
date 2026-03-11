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
exports.CampanhaController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const campanha_service_1 = require("./campanha.service");
const create_campanha_dto_1 = require("./dto/create-campanha.dto");
const add_membro_dto_1 = require("./dto/add-membro.dto");
const create_convite_dto_1 = require("./dto/create-convite.dto");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const vincular_personagem_campanha_dto_1 = require("./dto/vincular-personagem-campanha.dto");
const atualizar_recursos_personagem_campanha_dto_1 = require("./dto/atualizar-recursos-personagem-campanha.dto");
const aplicar_modificador_personagem_campanha_dto_1 = require("./dto/aplicar-modificador-personagem-campanha.dto");
const desfazer_modificador_personagem_campanha_dto_1 = require("./dto/desfazer-modificador-personagem-campanha.dto");
let CampanhaController = class CampanhaController {
    campanhaService;
    constructor(campanhaService) {
        this.campanhaService = campanhaService;
    }
    async criar(req, dto) {
        return this.campanhaService.criarCampanha(req.user.id, dto);
    }
    async listarMinhas(req, paginacao) {
        return this.campanhaService.listarMinhasCampanhas(req.user.id, paginacao.page, paginacao.limit);
    }
    async detalhar(id, req) {
        return this.campanhaService.buscarPorIdParaUsuario(id, req.user.id);
    }
    async excluir(id, req) {
        return this.campanhaService.excluirCampanha(id, req.user.id);
    }
    async listarMembros(id, req) {
        return this.campanhaService.listarMembros(id, req.user.id);
    }
    async adicionarMembro(id, req, dto) {
        return this.campanhaService.adicionarMembro(id, req.user.id, dto);
    }
    async listarPersonagensCampanha(id, req) {
        return this.campanhaService.listarPersonagensCampanha(id, req.user.id);
    }
    async listarPersonagensBaseDisponiveis(id, req) {
        return this.campanhaService.listarPersonagensBaseDisponiveisParaAssociacao(id, req.user.id);
    }
    async vincularPersonagemCampanha(id, req, dto) {
        return this.campanhaService.vincularPersonagemBase(id, req.user.id, dto.personagemBaseId);
    }
    async desassociarPersonagemCampanha(id, personagemCampanhaId, req) {
        return this.campanhaService.desassociarPersonagemCampanha(id, personagemCampanhaId, req.user.id);
    }
    async atualizarRecursosPersonagemCampanha(id, personagemCampanhaId, req, dto) {
        return this.campanhaService.atualizarRecursosPersonagemCampanha(id, personagemCampanhaId, req.user.id, dto);
    }
    async listarModificadoresPersonagemCampanha(id, personagemCampanhaId, req, incluirInativos) {
        return this.campanhaService.listarModificadoresPersonagemCampanha(id, personagemCampanhaId, req.user.id, incluirInativos === 'true');
    }
    async aplicarModificadorPersonagemCampanha(id, personagemCampanhaId, req, dto) {
        return this.campanhaService.aplicarModificadorPersonagemCampanha(id, personagemCampanhaId, req.user.id, dto);
    }
    async desfazerModificadorPersonagemCampanha(id, personagemCampanhaId, modificadorId, req, dto) {
        return this.campanhaService.desfazerModificadorPersonagemCampanha(id, personagemCampanhaId, modificadorId, req.user.id, dto.motivo);
    }
    async listarHistoricoPersonagemCampanha(id, personagemCampanhaId, req) {
        return this.campanhaService.listarHistoricoPersonagemCampanha(id, personagemCampanhaId, req.user.id);
    }
    async criarConvite(id, req, dto) {
        return this.campanhaService.criarConvitePorEmail(id, req.user.id, dto.email, dto.papel);
    }
    async listarConvitesPendentes(req) {
        return this.campanhaService.listarConvitesPendentesPorUsuario(req.user.id);
    }
    async aceitarConvite(codigo, req) {
        return this.campanhaService.aceitarConvite(codigo, req.user.id);
    }
    async recusarConvite(codigo, req) {
        return this.campanhaService.recusarConvite(codigo, req.user.id);
    }
};
exports.CampanhaController = CampanhaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_campanha_dto_1.CreateCampanhaDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)('minhas'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listarMinhas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "detalhar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "excluir", null);
__decorate([
    (0, common_1.Get)(':id/membros'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listarMembros", null);
__decorate([
    (0, common_1.Post)(':id/membros'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, add_membro_dto_1.AddMembroDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "adicionarMembro", null);
__decorate([
    (0, common_1.Get)(':id/personagens'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listarPersonagensCampanha", null);
__decorate([
    (0, common_1.Get)(':id/personagens-base-disponiveis'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listarPersonagensBaseDisponiveis", null);
__decorate([
    (0, common_1.Post)(':id/personagens'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, vincular_personagem_campanha_dto_1.VincularPersonagemCampanhaDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "vincularPersonagemCampanha", null);
__decorate([
    (0, common_1.Delete)(':id/personagens/:personagemCampanhaId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('personagemCampanhaId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "desassociarPersonagemCampanha", null);
__decorate([
    (0, common_1.Patch)(':id/personagens/:personagemCampanhaId/recursos'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('personagemCampanhaId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, atualizar_recursos_personagem_campanha_dto_1.AtualizarRecursosPersonagemCampanhaDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "atualizarRecursosPersonagemCampanha", null);
__decorate([
    (0, common_1.Get)(':id/personagens/:personagemCampanhaId/modificadores'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('personagemCampanhaId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Query)('incluirInativos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, String]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listarModificadoresPersonagemCampanha", null);
__decorate([
    (0, common_1.Post)(':id/personagens/:personagemCampanhaId/modificadores'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('personagemCampanhaId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, aplicar_modificador_personagem_campanha_dto_1.AplicarModificadorPersonagemCampanhaDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "aplicarModificadorPersonagemCampanha", null);
__decorate([
    (0, common_1.Post)(':id/personagens/:personagemCampanhaId/modificadores/:modificadorId/desfazer'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('personagemCampanhaId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('modificadorId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object, desfazer_modificador_personagem_campanha_dto_1.DesfazerModificadorPersonagemCampanhaDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "desfazerModificadorPersonagemCampanha", null);
__decorate([
    (0, common_1.Get)(':id/personagens/:personagemCampanhaId/historico'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('personagemCampanhaId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listarHistoricoPersonagemCampanha", null);
__decorate([
    (0, common_1.Post)(':id/convites'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, create_convite_dto_1.CreateConviteDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "criarConvite", null);
__decorate([
    (0, common_1.Get)('convites/pendentes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listarConvitesPendentes", null);
__decorate([
    (0, common_1.Post)('convites/:codigo/aceitar'),
    __param(0, (0, common_1.Param)('codigo')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "aceitarConvite", null);
__decorate([
    (0, common_1.Post)('convites/:codigo/recusar'),
    __param(0, (0, common_1.Param)('codigo')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "recusarConvite", null);
exports.CampanhaController = CampanhaController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('campanhas'),
    __metadata("design:paramtypes", [campanha_service_1.CampanhaService])
], CampanhaController);
//# sourceMappingURL=campanha.controller.js.map