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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TecnicasAmaldicoadasService = void 0;
const common_1 = require("@nestjs/common");
const tecnicas_amaldicoadas_crud_service_1 = require("./tecnicas-amaldicoadas.crud.service");
const tecnicas_amaldicoadas_import_export_service_1 = require("./tecnicas-amaldicoadas.import-export.service");
const tecnicas_amaldicoadas_habilidades_service_1 = require("./tecnicas-amaldicoadas.habilidades.service");
const tecnicas_amaldicoadas_variacoes_service_1 = require("./tecnicas-amaldicoadas.variacoes.service");
let TecnicasAmaldicoadasService = class TecnicasAmaldicoadasService {
    crudService;
    importExportService;
    habilidadesService;
    variacoesService;
    constructor(crudService, importExportService, habilidadesService, variacoesService) {
        this.crudService = crudService;
        this.importExportService = importExportService;
        this.habilidadesService = habilidadesService;
        this.variacoesService = variacoesService;
    }
    getGuiaImportacaoJson() {
        return this.importExportService.getGuiaImportacaoJson();
    }
    async exportarTecnicasJson(query) {
        return this.importExportService.exportarTecnicasJson(query);
    }
    async importarTecnicasJson(dto) {
        return this.importExportService.importarTecnicasJson(dto);
    }
    async findAllTecnicas(filtros) {
        return this.crudService.findAllTecnicas(filtros);
    }
    async findOneTecnica(id) {
        return this.crudService.findOneTecnica(id);
    }
    async findTecnicaByCodigo(codigo) {
        return this.crudService.findTecnicaByCodigo(codigo);
    }
    async createTecnica(dto) {
        return this.crudService.createTecnica(dto);
    }
    async updateTecnica(id, dto) {
        return this.crudService.updateTecnica(id, dto);
    }
    async removeTecnica(id) {
        return this.crudService.removeTecnica(id);
    }
    async findTecnicasByCla(claId) {
        return this.crudService.findTecnicasByCla(claId);
    }
    async findAllHabilidades(tecnicaId) {
        return this.habilidadesService.findAllHabilidades(tecnicaId);
    }
    async findOneHabilidade(id) {
        return this.habilidadesService.findOneHabilidade(id);
    }
    async createHabilidade(dto) {
        return this.habilidadesService.createHabilidade(dto);
    }
    async updateHabilidade(id, dto) {
        return this.habilidadesService.updateHabilidade(id, dto);
    }
    async removeHabilidade(id) {
        return this.habilidadesService.removeHabilidade(id);
    }
    async findAllVariacoes(habilidadeTecnicaId) {
        return this.variacoesService.findAllVariacoes(habilidadeTecnicaId);
    }
    async findOneVariacao(id) {
        return this.variacoesService.findOneVariacao(id);
    }
    async createVariacao(dto) {
        return this.variacoesService.createVariacao(dto);
    }
    async updateVariacao(id, dto) {
        return this.variacoesService.updateVariacao(id, dto);
    }
    async removeVariacao(id) {
        return this.variacoesService.removeVariacao(id);
    }
};
exports.TecnicasAmaldicoadasService = TecnicasAmaldicoadasService;
exports.TecnicasAmaldicoadasService = TecnicasAmaldicoadasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tecnicas_amaldicoadas_crud_service_1.TecnicasAmaldicoadasCrudService,
        tecnicas_amaldicoadas_import_export_service_1.TecnicasAmaldicoadasImportExportService,
        tecnicas_amaldicoadas_habilidades_service_1.TecnicasAmaldicoadasHabilidadesService,
        tecnicas_amaldicoadas_variacoes_service_1.TecnicasAmaldicoadasVariacoesService])
], TecnicasAmaldicoadasService);
//# sourceMappingURL=tecnicas-amaldicoadas.service.js.map