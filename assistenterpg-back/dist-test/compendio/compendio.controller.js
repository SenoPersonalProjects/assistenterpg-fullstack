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
exports.CompendioController = void 0;
const common_1 = require("@nestjs/common");
const compendio_service_1 = require("./compendio.service");
const create_categoria_dto_1 = require("./dto/create-categoria.dto");
const update_categoria_dto_1 = require("./dto/update-categoria.dto");
const create_subcategoria_dto_1 = require("./dto/create-subcategoria.dto");
const update_subcategoria_dto_1 = require("./dto/update-subcategoria.dto");
const create_artigo_dto_1 = require("./dto/create-artigo.dto");
const update_artigo_dto_1 = require("./dto/update-artigo.dto");
const pagination_query_dto_1 = require("src/common/dto/pagination-query.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let CompendioController = class CompendioController {
    compendioService;
    constructor(compendioService) {
        this.compendioService = compendioService;
    }
    async listarCategorias(todas, paginacao) {
        const apenasAtivas = todas !== 'true';
        return this.compendioService.listarCategorias(apenasAtivas, paginacao?.page, paginacao?.limit);
    }
    async buscarCategoriaPorCodigo(codigo) {
        return this.compendioService.buscarCategoriaPorCodigo(codigo);
    }
    async criarCategoria(dto) {
        return this.compendioService.criarCategoria(dto);
    }
    async atualizarCategoria(id, dto) {
        return this.compendioService.atualizarCategoria(id, dto);
    }
    async removerCategoria(id) {
        return this.compendioService.removerCategoria(id);
    }
    async listarSubcategorias(categoriaId, todas, paginacao) {
        const apenasAtivas = todas !== 'true';
        return this.compendioService.listarSubcategorias(categoriaId, apenasAtivas, paginacao?.page, paginacao?.limit);
    }
    async buscarSubcategoriaPorCodigo(codigo) {
        return this.compendioService.buscarSubcategoriaPorCodigo(codigo);
    }
    async criarSubcategoria(dto) {
        return this.compendioService.criarSubcategoria(dto);
    }
    async atualizarSubcategoria(id, dto) {
        return this.compendioService.atualizarSubcategoria(id, dto);
    }
    async removerSubcategoria(id) {
        return this.compendioService.removerSubcategoria(id);
    }
    async listarArtigos(subcategoriaId, todas, paginacao) {
        const apenasAtivos = todas !== 'true';
        return this.compendioService.listarArtigos(subcategoriaId, apenasAtivos, paginacao?.page, paginacao?.limit);
    }
    async buscarArtigoPorCodigo(codigo) {
        return this.compendioService.buscarArtigoPorCodigo(codigo);
    }
    async criarArtigo(dto) {
        return this.compendioService.criarArtigo(dto);
    }
    async atualizarArtigo(id, dto) {
        return this.compendioService.atualizarArtigo(id, dto);
    }
    async removerArtigo(id) {
        return this.compendioService.removerArtigo(id);
    }
    async buscar(query) {
        return this.compendioService.buscar(query);
    }
    async listarDestaques() {
        return this.compendioService.listarDestaques();
    }
};
exports.CompendioController = CompendioController;
__decorate([
    (0, common_1.Get)('categorias'),
    __param(0, (0, common_1.Query)('todas')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "listarCategorias", null);
__decorate([
    (0, common_1.Get)('categorias/codigo/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "buscarCategoriaPorCodigo", null);
__decorate([
    (0, common_1.Post)('categorias'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_categoria_dto_1.CreateCategoriaDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "criarCategoria", null);
__decorate([
    (0, common_1.Put)('categorias/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_categoria_dto_1.UpdateCategoriaDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "atualizarCategoria", null);
__decorate([
    (0, common_1.Delete)('categorias/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "removerCategoria", null);
__decorate([
    (0, common_1.Get)('categorias/:categoriaId/subcategorias'),
    __param(0, (0, common_1.Param)('categoriaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('todas')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "listarSubcategorias", null);
__decorate([
    (0, common_1.Get)('subcategorias/codigo/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "buscarSubcategoriaPorCodigo", null);
__decorate([
    (0, common_1.Post)('subcategorias'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subcategoria_dto_1.CreateSubcategoriaDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "criarSubcategoria", null);
__decorate([
    (0, common_1.Put)('subcategorias/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_subcategoria_dto_1.UpdateSubcategoriaDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "atualizarSubcategoria", null);
__decorate([
    (0, common_1.Delete)('subcategorias/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "removerSubcategoria", null);
__decorate([
    (0, common_1.Get)('artigos'),
    __param(0, (0, common_1.Query)('subcategoriaId', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('todas')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "listarArtigos", null);
__decorate([
    (0, common_1.Get)('artigos/codigo/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "buscarArtigoPorCodigo", null);
__decorate([
    (0, common_1.Post)('artigos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_artigo_dto_1.CreateArtigoDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "criarArtigo", null);
__decorate([
    (0, common_1.Put)('artigos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_artigo_dto_1.UpdateArtigoDto]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "atualizarArtigo", null);
__decorate([
    (0, common_1.Delete)('artigos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "removerArtigo", null);
__decorate([
    (0, common_1.Get)('buscar'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "buscar", null);
__decorate([
    (0, common_1.Get)('destaques'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompendioController.prototype, "listarDestaques", null);
exports.CompendioController = CompendioController = __decorate([
    (0, common_1.Controller)('compendio'),
    __metadata("design:paramtypes", [compendio_service_1.CompendioService])
], CompendioController);
//# sourceMappingURL=compendio.controller.js.map