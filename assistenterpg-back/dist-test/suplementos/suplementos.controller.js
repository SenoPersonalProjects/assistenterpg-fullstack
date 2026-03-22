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
exports.SuplementosController = void 0;
const common_1 = require("@nestjs/common");
const suplementos_service_1 = require("./suplementos.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const create_suplemento_dto_1 = require("./dto/create-suplemento.dto");
const update_suplemento_dto_1 = require("./dto/update-suplemento.dto");
const filtrar_suplementos_dto_1 = require("./dto/filtrar-suplementos.dto");
let SuplementosController = class SuplementosController {
    suplementosService;
    constructor(suplementosService) {
        this.suplementosService = suplementosService;
    }
    async findAll(req, filtros) {
        return this.suplementosService.findAll(filtros, req.user.id);
    }
    async findOne(req, id) {
        return this.suplementosService.findOne(id, req.user.id);
    }
    async findByCodigo(req, codigo) {
        return this.suplementosService.findByCodigo(codigo, req.user.id);
    }
    async findMeusSuplemetos(req) {
        return this.suplementosService.findSuplementosAtivos(req.user.id);
    }
    async ativarSuplemento(req, id) {
        await this.suplementosService.ativarSuplemento(req.user.id, id);
        return { message: 'Suplemento ativado com sucesso' };
    }
    async desativarSuplemento(req, id) {
        await this.suplementosService.desativarSuplemento(req.user.id, id);
        return { message: 'Suplemento desativado com sucesso' };
    }
    async create(dto) {
        return this.suplementosService.create(dto);
    }
    async update(id, dto) {
        return this.suplementosService.update(id, dto);
    }
    async remove(id) {
        await this.suplementosService.remove(id);
        return { message: 'Suplemento deletado com sucesso' };
    }
};
exports.SuplementosController = SuplementosController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, filtrar_suplementos_dto_1.FiltrarSuplementosDto]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('codigo/:codigo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "findByCodigo", null);
__decorate([
    (0, common_1.Get)('me/ativos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "findMeusSuplemetos", null);
__decorate([
    (0, common_1.Post)(':id/ativar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "ativarSuplemento", null);
__decorate([
    (0, common_1.Delete)(':id/desativar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "desativarSuplemento", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_suplemento_dto_1.CreateSuplementoDto]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_suplemento_dto_1.UpdateSuplementoDto]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SuplementosController.prototype, "remove", null);
exports.SuplementosController = SuplementosController = __decorate([
    (0, common_1.Controller)('suplementos'),
    __metadata("design:paramtypes", [suplementos_service_1.SuplementosService])
], SuplementosController);
//# sourceMappingURL=suplementos.controller.js.map