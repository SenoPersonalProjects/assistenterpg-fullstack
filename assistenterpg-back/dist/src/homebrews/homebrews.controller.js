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
exports.HomebrewsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
const homebrews_service_1 = require("./homebrews.service");
const create_homebrew_dto_1 = require("./dto/create-homebrew.dto");
const update_homebrew_dto_1 = require("./dto/update-homebrew.dto");
const filtrar_homebrews_dto_1 = require("./dto/filtrar-homebrews.dto");
let HomebrewsController = class HomebrewsController {
    homebrewsService;
    constructor(homebrewsService) {
        this.homebrewsService = homebrewsService;
    }
    getUserContext(req) {
        return {
            usuarioId: req.user.id,
            isAdmin: req.user.role === client_1.RoleUsuario.ADMIN,
        };
    }
    meus(req, filtros) {
        const { usuarioId } = this.getUserContext(req);
        return this.homebrewsService.meus(usuarioId, filtros);
    }
    buscarPorCodigo(codigo, req) {
        const { usuarioId, isAdmin } = this.getUserContext(req);
        return this.homebrewsService.buscarPorCodigo(codigo, usuarioId, isAdmin);
    }
    listar(filtros, req) {
        const { usuarioId, isAdmin } = this.getUserContext(req);
        return this.homebrewsService.listar(filtros, usuarioId, isAdmin);
    }
    buscarPorId(id, req) {
        const { usuarioId, isAdmin } = this.getUserContext(req);
        return this.homebrewsService.buscarPorId(id, usuarioId, isAdmin);
    }
    criar(createHomebrewDto, req) {
        const { usuarioId } = this.getUserContext(req);
        return this.homebrewsService.criar(createHomebrewDto, usuarioId);
    }
    atualizar(id, updateHomebrewDto, req) {
        const { usuarioId, isAdmin } = this.getUserContext(req);
        return this.homebrewsService.atualizar(id, updateHomebrewDto, usuarioId, isAdmin);
    }
    deletar(id, req) {
        const { usuarioId, isAdmin } = this.getUserContext(req);
        return this.homebrewsService.deletar(id, usuarioId, isAdmin);
    }
    publicar(id, req) {
        const { usuarioId, isAdmin } = this.getUserContext(req);
        return this.homebrewsService.publicar(id, usuarioId, isAdmin);
    }
    arquivar(id, req) {
        const { usuarioId, isAdmin } = this.getUserContext(req);
        return this.homebrewsService.arquivar(id, usuarioId, isAdmin);
    }
};
exports.HomebrewsController = HomebrewsController;
__decorate([
    (0, common_1.Get)('meus'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, filtrar_homebrews_dto_1.FiltrarHomebrewsDto]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "meus", null);
__decorate([
    (0, common_1.Get)('codigo/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "buscarPorCodigo", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtrar_homebrews_dto_1.FiltrarHomebrewsDto, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_homebrew_dto_1.CreateHomebrewDto, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "criar", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_homebrew_dto_1.UpdateHomebrewDto, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "deletar", null);
__decorate([
    (0, common_1.Patch)(':id/publicar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "publicar", null);
__decorate([
    (0, common_1.Patch)(':id/arquivar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HomebrewsController.prototype, "arquivar", null);
exports.HomebrewsController = HomebrewsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('homebrews'),
    __metadata("design:paramtypes", [homebrews_service_1.HomebrewsService])
], HomebrewsController);
//# sourceMappingURL=homebrews.controller.js.map