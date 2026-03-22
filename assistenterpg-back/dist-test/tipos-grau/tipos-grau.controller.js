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
exports.TiposGrauController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const admin_guard_1 = require("../auth/guards/admin.guard");
const tipos_grau_service_1 = require("./tipos-grau.service");
const create_tipo_grau_dto_1 = require("./dto/create-tipo-grau.dto");
const update_tipo_grau_dto_1 = require("./dto/update-tipo-grau.dto");
let TiposGrauController = class TiposGrauController {
    tiposGrauService;
    constructor(tiposGrauService) {
        this.tiposGrauService = tiposGrauService;
    }
    create(dto) {
        return this.tiposGrauService.create(dto);
    }
    findAll() {
        return this.tiposGrauService.findAll();
    }
    findOne(id) {
        return this.tiposGrauService.findOne(id);
    }
    update(id, dto) {
        return this.tiposGrauService.update(id, dto);
    }
    remove(id) {
        return this.tiposGrauService.remove(id);
    }
};
exports.TiposGrauController = TiposGrauController;
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tipo_grau_dto_1.CreateTipoGrauDto]),
    __metadata("design:returntype", void 0)
], TiposGrauController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TiposGrauController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TiposGrauController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_tipo_grau_dto_1.UpdateTipoGrauDto]),
    __metadata("design:returntype", void 0)
], TiposGrauController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TiposGrauController.prototype, "remove", null);
exports.TiposGrauController = TiposGrauController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('tipos-grau'),
    __metadata("design:paramtypes", [tipos_grau_service_1.TiposGrauService])
], TiposGrauController);
//# sourceMappingURL=tipos-grau.controller.js.map