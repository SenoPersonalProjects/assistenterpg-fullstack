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
exports.HabilidadesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const habilidades_service_1 = require("./habilidades.service");
const create_habilidade_dto_1 = require("./dto/create-habilidade.dto");
const update_habilidade_dto_1 = require("./dto/update-habilidade.dto");
const filter_habilidade_dto_1 = require("./dto/filter-habilidade.dto");
let HabilidadesController = class HabilidadesController {
    habilidadesService;
    constructor(habilidadesService) {
        this.habilidadesService = habilidadesService;
    }
    findPoderesGenericos() {
        return this.habilidadesService.findPoderesGenericos();
    }
    findAll(filtros) {
        return this.habilidadesService.findAll(filtros);
    }
    findOne(id) {
        return this.habilidadesService.findOne(id);
    }
    create(createDto) {
        return this.habilidadesService.create(createDto);
    }
    update(id, updateDto) {
        return this.habilidadesService.update(id, updateDto);
    }
    remove(id) {
        return this.habilidadesService.remove(id);
    }
};
exports.HabilidadesController = HabilidadesController;
__decorate([
    (0, common_1.Get)('poderes-genericos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HabilidadesController.prototype, "findPoderesGenericos", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_habilidade_dto_1.FilterHabilidadeDto]),
    __metadata("design:returntype", void 0)
], HabilidadesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HabilidadesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_habilidade_dto_1.CreateHabilidadeDto]),
    __metadata("design:returntype", void 0)
], HabilidadesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_habilidade_dto_1.UpdateHabilidadeDto]),
    __metadata("design:returntype", void 0)
], HabilidadesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HabilidadesController.prototype, "remove", null);
exports.HabilidadesController = HabilidadesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('habilidades'),
    __metadata("design:paramtypes", [habilidades_service_1.HabilidadesService])
], HabilidadesController);
//# sourceMappingURL=habilidades.controller.js.map