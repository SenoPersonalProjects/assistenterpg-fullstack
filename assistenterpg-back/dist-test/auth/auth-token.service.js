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
exports.AuthTokenService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("src/prisma/prisma.service");
const auth_exception_1 = require("src/common/exceptions/auth.exception");
let AuthTokenService = class AuthTokenService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async gerarToken(usuarioId, tipo, tempoDeVidaMinutos) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiraEm = new Date(Date.now() + tempoDeVidaMinutos * 60 * 1000);
        await this.prisma.authToken.create({
            data: {
                usuarioId,
                tipo,
                tokenHash,
                expiraEm,
            },
        });
        return { token, expiraEm };
    }
    async consumirToken(token, tipo) {
        const tokenHash = this.hashToken(token);
        const agora = new Date();
        const registro = await this.prisma.authToken.findFirst({
            where: {
                tokenHash,
                tipo,
                usadoEm: null,
            },
            select: {
                id: true,
                usuarioId: true,
                expiraEm: true,
            },
        });
        if (!registro || registro.expiraEm <= agora) {
            throw new auth_exception_1.AuthTokenInvalidoOuExpiradoException();
        }
        const consumo = await this.prisma.authToken.updateMany({
            where: {
                id: registro.id,
                usadoEm: null,
            },
            data: {
                usadoEm: agora,
            },
        });
        if (consumo.count === 0) {
            throw new auth_exception_1.AuthTokenInvalidoOuExpiradoException();
        }
        return registro;
    }
    async invalidarTokensAtivos(usuarioId, tipo) {
        await this.prisma.authToken.updateMany({
            where: {
                usuarioId,
                tipo,
                usadoEm: null,
            },
            data: {
                usadoEm: new Date(),
            },
        });
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.AuthTokenService = AuthTokenService;
exports.AuthTokenService = AuthTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthTokenService);
//# sourceMappingURL=auth-token.service.js.map