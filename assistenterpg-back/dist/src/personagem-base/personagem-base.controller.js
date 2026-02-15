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
exports.PersonagemBaseController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const personagem_base_service_1 = require("./personagem-base.service");
const create_personagem_base_dto_1 = require("./dto/create-personagem-base.dto");
const update_personagem_base_dto_1 = require("./dto/update-personagem-base.dto");
const consultar_graus_treinamento_dto_1 = require("./dto/consultar-graus-treinamento.dto");
let PersonagemBaseController = class PersonagemBaseController {
    personagemBaseService;
    constructor(personagemBaseService) {
        this.personagemBaseService = personagemBaseService;
    }
    async criar(req, dto) {
        return this.personagemBaseService.criar(req.user.id, dto);
    }
    async preview(req, dto) {
        return this.personagemBaseService.preview(req.user.id, dto);
    }
    async consultarInfoGrausTreinamento(query) {
        return this.personagemBaseService.consultarInfoGrausTreinamento(Number(query.nivel), Number(query.intelecto));
    }
    async consultarPericiasElegiveis(body) {
        return this.personagemBaseService.consultarPericiasElegiveis(body.periciasComGrauInicial);
    }
    async listarPassivasDisponiveis() {
        return this.personagemBaseService.listarPassivasDisponiveis();
    }
    async listarTecnicasDisponiveis(claId, origemId) {
        const origemIdNum = origemId ? Number(origemId) : undefined;
        return this.personagemBaseService.listarTecnicasDisponveis(claId, origemIdNum);
    }
    async listarMeus(req) {
        return this.personagemBaseService.listarDoUsuario(req.user.id);
    }
    async buscarPorId(req, id, incluirInventario) {
        const incluir = incluirInventario === 'true';
        return this.personagemBaseService.buscarPorId(req.user.id, id, incluir);
    }
    async atualizar(req, id, dto) {
        return this.personagemBaseService.atualizar(req.user.id, id, dto);
    }
    async remover(req, id) {
        return this.personagemBaseService.remover(req.user.id, id);
    }
};
exports.PersonagemBaseController = PersonagemBaseController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_personagem_base_dto_1.CreatePersonagemBaseDto]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "criar", null);
__decorate([
    (0, common_1.Post)('preview'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_personagem_base_dto_1.CreatePersonagemBaseDto]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "preview", null);
__decorate([
    (0, common_1.Get)('graus-treinamento/info'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [consultar_graus_treinamento_dto_1.ConsultarInfoGrausTreinamentoDto]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "consultarInfoGrausTreinamento", null);
__decorate([
    (0, common_1.Post)('graus-treinamento/pericias-elegiveis'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [consultar_graus_treinamento_dto_1.ConsultarPericiasElegiveisDto]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "consultarPericiasElegiveis", null);
__decorate([
    (0, common_1.Get)('passivas-disponiveis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "listarPassivasDisponiveis", null);
__decorate([
    (0, common_1.Get)('tecnicas-disponiveis'),
    __param(0, (0, common_1.Query)('claId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('origemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "listarTecnicasDisponiveis", null);
__decorate([
    (0, common_1.Get)('meus'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "listarMeus", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('incluirInventario')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_personagem_base_dto_1.UpdatePersonagemBaseDto]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PersonagemBaseController.prototype, "remover", null);
exports.PersonagemBaseController = PersonagemBaseController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('personagens-base'),
    __metadata("design:paramtypes", [personagem_base_service_1.PersonagemBaseService])
], PersonagemBaseController);
//# sourceMappingURL=personagem-base.controller.js.map