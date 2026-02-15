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
exports.ProficienciasController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const proficiencias_service_1 = require("./proficiencias.service");
const create_proficiencia_dto_1 = require("./dto/create-proficiencia.dto");
const update_proficiencia_dto_1 = require("./dto/update-proficiencia.dto");
let ProficienciasController = class ProficienciasController {
    proficienciasService;
    constructor(proficienciasService) {
        this.proficienciasService = proficienciasService;
    }
    create(dto) {
        return this.proficienciasService.create(dto);
    }
    findAll() {
        return this.proficienciasService.findAll();
    }
    findOne(id) {
        return this.proficienciasService.findOne(+id);
    }
    update(id, dto) {
        return this.proficienciasService.update(+id, dto);
    }
    remove(id) {
        return this.proficienciasService.remove(+id);
    }
};
exports.ProficienciasController = ProficienciasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_proficiencia_dto_1.CreateProficienciaDto]),
    __metadata("design:returntype", void 0)
], ProficienciasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProficienciasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProficienciasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_proficiencia_dto_1.UpdateProficienciaDto]),
    __metadata("design:returntype", void 0)
], ProficienciasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProficienciasController.prototype, "remove", null);
exports.ProficienciasController = ProficienciasController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('proficiencias'),
    __metadata("design:paramtypes", [proficiencias_service_1.ProficienciasService])
], ProficienciasController);
//# sourceMappingURL=proficiencias.controller.js.map