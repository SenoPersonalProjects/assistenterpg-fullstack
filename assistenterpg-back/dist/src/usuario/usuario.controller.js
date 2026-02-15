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
exports.UsuarioController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const usuario_service_1 = require("./usuario.service");
const atualizar_preferencias_dto_1 = require("./dto/atualizar-preferencias.dto");
const alterar_senha_dto_1 = require("./dto/alterar-senha.dto");
const excluir_conta_dto_1 = require("./dto/excluir-conta.dto");
let UsuarioController = class UsuarioController {
    usuarioService;
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    async getMe(req) {
        const usuario = await this.usuarioService.buscarPorId(req.user.id);
        const { senhaHash, ...resto } = usuario;
        return resto;
    }
    async obterEstatisticas(req) {
        return this.usuarioService.obterEstatisticas(req.user.id);
    }
    async obterPreferencias(req) {
        return this.usuarioService.obterPreferencias(req.user.id);
    }
    async atualizarPreferencias(req, dto) {
        return this.usuarioService.atualizarPreferencias(req.user.id, dto);
    }
    async alterarSenha(req, dto) {
        return this.usuarioService.alterarSenha(req.user.id, dto);
    }
    async exportarDados(req) {
        return this.usuarioService.exportarDados(req.user.id);
    }
    async excluirConta(req, body) {
        return this.usuarioService.excluirConta(req.user.id, body.senha);
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('me/estatisticas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "obterEstatisticas", null);
__decorate([
    (0, common_1.Get)('me/preferencias'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "obterPreferencias", null);
__decorate([
    (0, common_1.Patch)('me/preferencias'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, atualizar_preferencias_dto_1.AtualizarPreferenciasDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "atualizarPreferencias", null);
__decorate([
    (0, common_1.Patch)('me/senha'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, alterar_senha_dto_1.AlterarSenhaDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "alterarSenha", null);
__decorate([
    (0, common_1.Get)('me/exportar'),
    (0, common_1.Header)('Content-Type', 'application/json'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="dados-assistenterpg.json"'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "exportarDados", null);
__decorate([
    (0, common_1.Delete)('me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, excluir_conta_dto_1.ExcluirContaDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "excluirConta", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, common_1.Controller)('usuarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService])
], UsuarioController);
//# sourceMappingURL=usuario.controller.js.map