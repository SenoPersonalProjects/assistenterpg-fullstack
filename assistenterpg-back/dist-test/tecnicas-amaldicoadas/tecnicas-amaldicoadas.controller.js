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
exports.TecnicasAmaldicoadasController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const tecnicas_amaldicoadas_service_1 = require("./tecnicas-amaldicoadas.service");
const admin_guard_1 = require("../auth/guards/admin.guard");
const create_tecnica_dto_1 = require("./dto/create-tecnica.dto");
const update_tecnica_dto_1 = require("./dto/update-tecnica.dto");
const filtrar_tecnicas_dto_1 = require("./dto/filtrar-tecnicas.dto");
const exportar_tecnicas_json_dto_1 = require("./dto/exportar-tecnicas-json.dto");
const importar_tecnicas_json_dto_1 = require("./dto/importar-tecnicas-json.dto");
const create_habilidade_tecnica_dto_1 = require("./dto/create-habilidade-tecnica.dto");
const update_habilidade_tecnica_dto_1 = require("./dto/update-habilidade-tecnica.dto");
const create_variacao_dto_1 = require("./dto/create-variacao.dto");
const update_variacao_dto_1 = require("./dto/update-variacao.dto");
let TecnicasAmaldicoadasController = class TecnicasAmaldicoadasController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAllTecnicas(filtros) {
        return this.service.findAllTecnicas(filtros);
    }
    async findTecnicaByCodigo(codigo) {
        return this.service.findTecnicaByCodigo(codigo);
    }
    async findTecnicasByCla(claId) {
        return this.service.findTecnicasByCla(claId);
    }
    getGuiaImportacaoJson() {
        return this.service.getGuiaImportacaoJson();
    }
    async exportarJson(query) {
        return this.service.exportarTecnicasJson(query);
    }
    async findOneTecnica(id) {
        return this.service.findOneTecnica(id);
    }
    async importarJson(req, dto) {
        return this.service.importarTecnicasJson(dto);
    }
    async createTecnica(req, dto) {
        return this.service.createTecnica(dto);
    }
    async updateTecnica(req, id, dto) {
        return this.service.updateTecnica(id, dto);
    }
    async removeTecnica(req, id) {
        await this.service.removeTecnica(id);
        return { sucesso: true };
    }
    async findAllHabilidades(tecnicaId) {
        return this.service.findAllHabilidades(tecnicaId);
    }
    async findOneHabilidade(id) {
        return this.service.findOneHabilidade(id);
    }
    async createHabilidade(req, dto) {
        return this.service.createHabilidade(dto);
    }
    async updateHabilidade(req, id, dto) {
        return this.service.updateHabilidade(id, dto);
    }
    async removeHabilidade(req, id) {
        await this.service.removeHabilidade(id);
        return { sucesso: true };
    }
    async findAllVariacoes(habilidadeId) {
        return this.service.findAllVariacoes(habilidadeId);
    }
    async findOneVariacao(id) {
        return this.service.findOneVariacao(id);
    }
    async createVariacao(req, dto) {
        return this.service.createVariacao(dto);
    }
    async updateVariacao(req, id, dto) {
        return this.service.updateVariacao(id, dto);
    }
    async removeVariacao(req, id) {
        await this.service.removeVariacao(id);
        return { sucesso: true };
    }
};
exports.TecnicasAmaldicoadasController = TecnicasAmaldicoadasController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtrar_tecnicas_dto_1.FiltrarTecnicasDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findAllTecnicas", null);
__decorate([
    (0, common_1.Get)('codigo/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findTecnicaByCodigo", null);
__decorate([
    (0, common_1.Get)('cla/:claId'),
    __param(0, (0, common_1.Param)('claId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findTecnicasByCla", null);
__decorate([
    (0, common_1.Get)('importar-json/guia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TecnicasAmaldicoadasController.prototype, "getGuiaImportacaoJson", null);
__decorate([
    (0, common_1.Get)('exportar-json'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exportar_tecnicas_json_dto_1.ExportarTecnicasJsonDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "exportarJson", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findOneTecnica", null);
__decorate([
    (0, common_1.Post)('importar-json'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, importar_tecnicas_json_dto_1.ImportarTecnicasJsonDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "importarJson", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tecnica_dto_1.CreateTecnicaDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "createTecnica", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_tecnica_dto_1.UpdateTecnicaDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "updateTecnica", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "removeTecnica", null);
__decorate([
    (0, common_1.Get)(':tecnicaId/habilidades'),
    __param(0, (0, common_1.Param)('tecnicaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findAllHabilidades", null);
__decorate([
    (0, common_1.Get)('habilidades/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findOneHabilidade", null);
__decorate([
    (0, common_1.Post)('habilidades'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_habilidade_tecnica_dto_1.CreateHabilidadeTecnicaDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "createHabilidade", null);
__decorate([
    (0, common_1.Patch)('habilidades/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_habilidade_tecnica_dto_1.UpdateHabilidadeTecnicaDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "updateHabilidade", null);
__decorate([
    (0, common_1.Delete)('habilidades/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "removeHabilidade", null);
__decorate([
    (0, common_1.Get)('habilidades/:habilidadeId/variacoes'),
    __param(0, (0, common_1.Param)('habilidadeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findAllVariacoes", null);
__decorate([
    (0, common_1.Get)('variacoes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "findOneVariacao", null);
__decorate([
    (0, common_1.Post)('variacoes'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_variacao_dto_1.CreateVariacaoHabilidadeDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "createVariacao", null);
__decorate([
    (0, common_1.Patch)('variacoes/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_variacao_dto_1.UpdateVariacaoHabilidadeDto]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "updateVariacao", null);
__decorate([
    (0, common_1.Delete)('variacoes/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TecnicasAmaldicoadasController.prototype, "removeVariacao", null);
exports.TecnicasAmaldicoadasController = TecnicasAmaldicoadasController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('tecnicas-amaldicoadas'),
    __metadata("design:paramtypes", [tecnicas_amaldicoadas_service_1.TecnicasAmaldicoadasService])
], TecnicasAmaldicoadasController);
//# sourceMappingURL=tecnicas-amaldicoadas.controller.js.map