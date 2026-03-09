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
exports.ModificacoesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const modificacoes_service_1 = require("./modificacoes.service");
const filtrar_modificacoes_dto_1 = require("./dto/filtrar-modificacoes.dto");
const create_modificacao_dto_1 = require("./dto/create-modificacao.dto");
const update_modificacao_dto_1 = require("./dto/update-modificacao.dto");
const admin_guard_1 = require("../auth/guards/admin.guard");
let ModificacoesController = class ModificacoesController {
    modificacoesService;
    constructor(modificacoesService) {
        this.modificacoesService = modificacoesService;
    }
    async listar(filtros) {
        return this.modificacoesService.listar(filtros);
    }
    async buscarPorId(id) {
        return this.modificacoesService.buscarPorId(id);
    }
    async buscarCompatíveis(equipamentoId) {
        return this.modificacoesService.buscarCompatíveisComEquipamento(equipamentoId);
    }
    create(createDto) {
        return this.modificacoesService.create(createDto);
    }
    update(id, updateDto) {
        return this.modificacoesService.update(id, updateDto);
    }
    remove(id) {
        return this.modificacoesService.remove(id);
    }
};
exports.ModificacoesController = ModificacoesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtrar_modificacoes_dto_1.FiltrarModificacoesDto]),
    __metadata("design:returntype", Promise)
], ModificacoesController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModificacoesController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Get)('equipamento/:equipamentoId/compativeis'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('equipamentoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModificacoesController.prototype, "buscarCompat\u00EDveis", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_modificacao_dto_1.CreateModificacaoDto]),
    __metadata("design:returntype", void 0)
], ModificacoesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_modificacao_dto_1.UpdateModificacaoDto]),
    __metadata("design:returntype", void 0)
], ModificacoesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ModificacoesController.prototype, "remove", null);
exports.ModificacoesController = ModificacoesController = __decorate([
    (0, common_1.Controller)('modificacoes'),
    __metadata("design:paramtypes", [modificacoes_service_1.ModificacoesService])
], ModificacoesController);
//# sourceMappingURL=modificacoes.controller.js.map