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