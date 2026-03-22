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
exports.CampanhaContextoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const campanha_exception_1 = require("src/common/exceptions/campanha.exception");
let CampanhaContextoService = class CampanhaContextoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validarContextoSessaoCena(campanhaId, sessaoId, cenaId) {
        if (cenaId !== undefined && sessaoId === undefined) {
            throw new campanha_exception_1.CenaSessaoNaoEncontradaException(cenaId, undefined, campanhaId);
        }
        let sessaoValidaId = null;
        let cenaValidaId = null;
        if (sessaoId !== undefined) {
            const sessao = await this.prisma.sessao.findFirst({
                where: {
                    id: sessaoId,
                    campanhaId,
                },
                select: { id: true },
            });
            if (!sessao) {
                throw new campanha_exception_1.SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
            }
            sessaoValidaId = sessao.id;
        }
        if (cenaId !== undefined && sessaoValidaId !== null) {
            const cena = await this.prisma.cena.findFirst({
                where: {
                    id: cenaId,
                    sessaoId: sessaoValidaId,
                },
                select: { id: true },
            });
            if (!cena) {
                throw new campanha_exception_1.CenaSessaoNaoEncontradaException(cenaId, sessaoValidaId, campanhaId);
            }
            cenaValidaId = cena.id;
        }
        return {
            sessaoId: sessaoValidaId,
            cenaId: cenaValidaId,
        };
    }
};
exports.CampanhaContextoService = CampanhaContextoService;
exports.CampanhaContextoService = CampanhaContextoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampanhaContextoService);
//# sourceMappingURL=campanha.contexto.service.js.map