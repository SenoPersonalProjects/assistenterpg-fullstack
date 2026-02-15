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
exports.CondicoesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const condicoes_service_1 = require("./condicoes.service");
const create_condicao_dto_1 = require("./dto/create-condicao.dto");
const update_condicao_dto_1 = require("./dto/update-condicao.dto");
let CondicoesController = class CondicoesController {
    condicoesService;
    constructor(condicoesService) {
        this.condicoesService = condicoesService;
    }
    create(createCondicaoDto) {
        return this.condicoesService.create(createCondicaoDto);
    }
    findAll() {
        return this.condicoesService.findAll();
    }
    findOne(id) {
        return this.condicoesService.findOne(id);
    }
    update(id, updateCondicaoDto) {
        return this.condicoesService.update(id, updateCondicaoDto);
    }
    remove(id) {
        return this.condicoesService.remove(id);
    }
};
exports.CondicoesController = CondicoesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_condicao_dto_1.CreateCondicaoDto]),
    __metadata("design:returntype", void 0)
], CondicoesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CondicoesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CondicoesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_condicao_dto_1.UpdateCondicaoDto]),
    __metadata("design:returntype", void 0)
], CondicoesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CondicoesController.prototype, "remove", null);
exports.CondicoesController = CondicoesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('condicoes'),
    __metadata("design:paramtypes", [condicoes_service_1.CondicoesService])
], CondicoesController);
//# sourceMappingURL=condicoes.controller.js.map