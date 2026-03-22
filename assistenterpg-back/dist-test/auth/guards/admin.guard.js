"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const auth_exception_1 = require("src/common/exceptions/auth.exception");
let AdminGuard = class AdminGuard {
    canActivate(context) {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new auth_exception_1.UsuarioNaoAutenticadoException();
        }
        if (user.role !== client_1.RoleUsuario.ADMIN) {
            throw new auth_exception_1.AcessoNegadoException('recurso administrativo', 'ADMIN');
        }
        return true;
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)()
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map