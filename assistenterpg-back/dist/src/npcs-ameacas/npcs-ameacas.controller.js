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
exports.NpcsAmeacasController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const create_npc_ameaca_dto_1 = require("./dto/create-npc-ameaca.dto");
const listar_npcs_ameacas_dto_1 = require("./dto/listar-npcs-ameacas.dto");
const update_npc_ameaca_dto_1 = require("./dto/update-npc-ameaca.dto");
const npcs_ameacas_service_1 = require("./npcs-ameacas.service");
let NpcsAmeacasController = class NpcsAmeacasController {
    npcsAmeacasService;
    constructor(npcsAmeacasService) {
        this.npcsAmeacasService = npcsAmeacasService;
    }
    criar(req, dto) {
        return this.npcsAmeacasService.criar(req.user.id, dto);
    }
    listarMeus(req, query) {
        return this.npcsAmeacasService.listarDoUsuario(req.user.id, query);
    }
    buscarPorId(req, id) {
        return this.npcsAmeacasService.buscarPorId(req.user.id, id);
    }
    atualizar(req, id, dto) {
        return this.npcsAmeacasService.atualizar(req.user.id, id, dto);
    }
    remover(req, id) {
        return this.npcsAmeacasService.remover(req.user.id, id);
    }
};
exports.NpcsAmeacasController = NpcsAmeacasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_npc_ameaca_dto_1.CreateNpcAmeacaDto]),
    __metadata("design:returntype", void 0)
], NpcsAmeacasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)('meus'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, listar_npcs_ameacas_dto_1.ListarNpcsAmeacasDto]),
    __metadata("design:returntype", void 0)
], NpcsAmeacasController.prototype, "listarMeus", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], NpcsAmeacasController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_npc_ameaca_dto_1.UpdateNpcAmeacaDto]),
    __metadata("design:returntype", void 0)
], NpcsAmeacasController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], NpcsAmeacasController.prototype, "remover", null);
exports.NpcsAmeacasController = NpcsAmeacasController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('npcs-ameacas'),
    __metadata("design:paramtypes", [npcs_ameacas_service_1.NpcsAmeacasService])
], NpcsAmeacasController);
//# sourceMappingURL=npcs-ameacas.controller.js.map