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
exports.EquipamentosController = void 0;
const common_1 = require("@nestjs/common");
const equipamentos_service_1 = require("./equipamentos.service");
const filtrar_equipamentos_dto_1 = require("./dto/filtrar-equipamentos.dto");
const criar_equipamento_dto_1 = require("./dto/criar-equipamento.dto");
const atualizar_equipamento_dto_1 = require("./dto/atualizar-equipamento.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let EquipamentosController = class EquipamentosController {
    equipamentosService;
    constructor(equipamentosService) {
        this.equipamentosService = equipamentosService;
    }
    async listar(filtros) {
        return this.equipamentosService.listar(filtros);
    }
    async buscarPorId(id) {
        return this.equipamentosService.buscarPorId(id);
    }
    async buscarPorCodigo(codigo) {
        return this.equipamentosService.buscarPorCodigo(codigo);
    }
    async criar(data) {
        return this.equipamentosService.criar(data);
    }
    async atualizar(id, data) {
        return this.equipamentosService.atualizar(id, data);
    }
    async deletar(id) {
        await this.equipamentosService.deletar(id);
    }
};
exports.EquipamentosController = EquipamentosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtrar_equipamentos_dto_1.FiltrarEquipamentosDto]),
    __metadata("design:returntype", Promise)
], EquipamentosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EquipamentosController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Get)('codigo/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EquipamentosController.prototype, "buscarPorCodigo", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_equipamento_dto_1.CriarEquipamentoDto]),
    __metadata("design:returntype", Promise)
], EquipamentosController.prototype, "criar", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, atualizar_equipamento_dto_1.AtualizarEquipamentoDto]),
    __metadata("design:returntype", Promise)
], EquipamentosController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EquipamentosController.prototype, "deletar", null);
exports.EquipamentosController = EquipamentosController = __decorate([
    (0, common_1.Controller)('equipamentos'),
    __metadata("design:paramtypes", [equipamentos_service_1.EquipamentosService])
], EquipamentosController);
//# sourceMappingURL=equipamentos.controller.js.map