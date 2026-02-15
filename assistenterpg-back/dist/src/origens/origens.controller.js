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
exports.OrigensController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const origens_service_1 = require("./origens.service");
const create_origem_dto_1 = require("./dto/create-origem.dto");
const update_origem_dto_1 = require("./dto/update-origem.dto");
let OrigensController = class OrigensController {
    origensService;
    constructor(origensService) {
        this.origensService = origensService;
    }
    create(dto) {
        return this.origensService.create(dto);
    }
    findAll() {
        return this.origensService.findAll();
    }
    findOne(id) {
        return this.origensService.findOne(id);
    }
    update(id, dto) {
        return this.origensService.update(id, dto);
    }
    remove(id) {
        return this.origensService.remove(id);
    }
};
exports.OrigensController = OrigensController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_origem_dto_1.CreateOrigemDto]),
    __metadata("design:returntype", void 0)
], OrigensController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrigensController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrigensController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_origem_dto_1.UpdateOrigemDto]),
    __metadata("design:returntype", void 0)
], OrigensController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrigensController.prototype, "remove", null);
exports.OrigensController = OrigensController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('origens'),
    __metadata("design:paramtypes", [origens_service_1.OrigensService])
], OrigensController);
//# sourceMappingURL=origens.controller.js.map