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
exports.TrilhasController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const admin_guard_1 = require("../auth/guards/admin.guard");
const trilhas_service_1 = require("./trilhas.service");
const create_trilha_dto_1 = require("./dto/create-trilha.dto");
const update_trilha_dto_1 = require("./dto/update-trilha.dto");
const create_caminho_dto_1 = require("./dto/create-caminho.dto");
const update_caminho_dto_1 = require("./dto/update-caminho.dto");
let TrilhasController = class TrilhasController {
    trilhasService;
    constructor(trilhasService) {
        this.trilhasService = trilhasService;
    }
    create(createDto) {
        return this.trilhasService.create(createDto);
    }
    findAll(classeId) {
        return this.trilhasService.findAll(classeId);
    }
    findOne(id) {
        return this.trilhasService.findOne(id);
    }
    update(id, updateDto) {
        return this.trilhasService.update(id, updateDto);
    }
    remove(id) {
        return this.trilhasService.remove(id);
    }
    findCaminhos(id) {
        return this.trilhasService.findCaminhos(id);
    }
    findHabilidades(id) {
        return this.trilhasService.findHabilidades(id);
    }
    createCaminho(createDto) {
        return this.trilhasService.createCaminho(createDto);
    }
    updateCaminho(id, updateDto) {
        return this.trilhasService.updateCaminho(id, updateDto);
    }
    removeCaminho(id) {
        return this.trilhasService.removeCaminho(id);
    }
};
exports.TrilhasController = TrilhasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trilha_dto_1.CreateTrilhaDto]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('classeId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_trilha_dto_1.UpdateTrilhaDto]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/caminhos'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "findCaminhos", null);
__decorate([
    (0, common_1.Get)(':id/habilidades'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "findHabilidades", null);
__decorate([
    (0, common_1.Post)('caminhos'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_caminho_dto_1.CreateCaminhoDto]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "createCaminho", null);
__decorate([
    (0, common_1.Patch)('caminhos/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_caminho_dto_1.UpdateCaminhoDto]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "updateCaminho", null);
__decorate([
    (0, common_1.Delete)('caminhos/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrilhasController.prototype, "removeCaminho", null);
exports.TrilhasController = TrilhasController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('trilhas'),
    __metadata("design:paramtypes", [trilhas_service_1.TrilhasService])
], TrilhasController);
//# sourceMappingURL=trilhas.controller.js.map