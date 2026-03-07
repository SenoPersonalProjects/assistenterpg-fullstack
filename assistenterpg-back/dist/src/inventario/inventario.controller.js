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
exports.InventarioController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const inventario_service_1 = require("./inventario.service");
const adicionar_item_dto_1 = require("./dto/adicionar-item.dto");
const atualizar_item_dto_1 = require("./dto/atualizar-item.dto");
const aplicar_modificacao_dto_1 = require("./dto/aplicar-modificacao.dto");
const remover_modificacao_dto_1 = require("./dto/remover-modificacao.dto");
const preview_item_dto_1 = require("./dto/preview-item.dto");
const preview_itens_inventario_dto_1 = require("./dto/preview-itens-inventario.dto");
let InventarioController = class InventarioController {
    inventarioService;
    constructor(inventarioService) {
        this.inventarioService = inventarioService;
    }
    async buscarInventario(req, personagemBaseId) {
        return this.inventarioService.buscarInventario(req.user.id, personagemBaseId);
    }
    async previewAdicionarItem(req, dto) {
        return this.inventarioService.previewAdicionarItem(req.user.id, dto);
    }
    async previewItensInventario(dto) {
        console.log('[InventarioController] ============ CHEGOU NO CONTROLLER ============');
        console.log('[InventarioController] Body recebido:', JSON.stringify(dto, null, 2));
        console.log('[InventarioController] Tipos:', {
            forca: typeof dto.forca,
            prestigioBase: typeof dto.prestigioBase,
            itens: Array.isArray(dto.itens)
                ? `array[${dto.itens.length}]`
                : typeof dto.itens,
        });
        try {
            const resultado = await this.inventarioService.previewItensInventario(dto);
            console.log('[InventarioController] ✅ Preview gerado com sucesso');
            return resultado;
        }
        catch (err) {
            console.error('[InventarioController] ❌ Erro ao gerar preview:', {
                message: err.message,
                name: err.name,
                status: err.status,
                response: err.response,
            });
            throw err;
        }
    }
    async adicionarItem(req, dto) {
        return this.inventarioService.adicionarItem(req.user.id, dto);
    }
    async atualizarItem(req, itemId, dto) {
        return this.inventarioService.atualizarItem(req.user.id, itemId, dto);
    }
    async removerItem(req, itemId) {
        return this.inventarioService.removerItem(req.user.id, itemId);
    }
    async aplicarModificacao(req, dto) {
        return this.inventarioService.aplicarModificacao(req.user.id, dto.itemId, dto);
    }
    async removerModificacao(req, dto) {
        return this.inventarioService.removerModificacao(req.user.id, dto.itemId, dto);
    }
};
exports.InventarioController = InventarioController;
__decorate([
    (0, common_1.Get)('personagem/:personagemBaseId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('personagemBaseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "buscarInventario", null);
__decorate([
    (0, common_1.Post)('preview-adicionar'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, preview_item_dto_1.PreviewItemDto]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "previewAdicionarItem", null);
__decorate([
    (0, common_1.Post)('preview'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [preview_itens_inventario_dto_1.PreviewItensInventarioDto]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "previewItensInventario", null);
__decorate([
    (0, common_1.Post)('adicionar'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, adicionar_item_dto_1.AdicionarItemDto]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "adicionarItem", null);
__decorate([
    (0, common_1.Patch)('item/:itemId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, atualizar_item_dto_1.AtualizarItemDto]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "atualizarItem", null);
__decorate([
    (0, common_1.Delete)('item/:itemId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "removerItem", null);
__decorate([
    (0, common_1.Post)('aplicar-modificacao'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, aplicar_modificacao_dto_1.AplicarModificacaoDto]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "aplicarModificacao", null);
__decorate([
    (0, common_1.Post)('remover-modificacao'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, remover_modificacao_dto_1.RemoverModificacaoDto]),
    __metadata("design:returntype", Promise)
], InventarioController.prototype, "removerModificacao", null);
exports.InventarioController = InventarioController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('inventario'),
    __metadata("design:paramtypes", [inventario_service_1.InventarioService])
], InventarioController);
//# sourceMappingURL=inventario.controller.js.map