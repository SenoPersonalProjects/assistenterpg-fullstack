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
exports.CampanhaAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const campanha_exception_1 = require("src/common/exceptions/campanha.exception");
let CampanhaAccessService = class CampanhaAccessService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async garantirAcesso(campanhaId, usuarioId) {
        const campanha = await this.prisma.campanha.findUnique({
            where: { id: campanhaId },
            select: {
                id: true,
                donoId: true,
                membros: {
                    select: {
                        usuarioId: true,
                        papel: true,
                    },
                },
            },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(campanhaId);
        }
        const ehDono = campanha.donoId === usuarioId;
        const membroAtual = campanha.membros.find((m) => m.usuarioId === usuarioId);
        if (!ehDono && !membroAtual) {
            throw new campanha_exception_1.CampanhaAcessoNegadoException(campanhaId, usuarioId);
        }
        const ehMestre = ehDono || membroAtual?.papel === 'MESTRE';
        return {
            campanha,
            ehDono,
            ehMestre,
            papel: membroAtual?.papel ?? null,
        };
    }
    async obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, exigirPermissaoEdicao) {
        const acesso = await this.garantirAcesso(campanhaId, usuarioId);
        const personagem = await this.prisma.personagemCampanha.findUnique({
            where: { id: personagemCampanhaId },
            select: {
                id: true,
                campanhaId: true,
                donoId: true,
                pvMax: true,
                pvAtual: true,
                peMax: true,
                peAtual: true,
                eaMax: true,
                eaAtual: true,
                sanMax: true,
                sanAtual: true,
                defesaBase: true,
                defesaEquipamento: true,
                defesaOutros: true,
                esquiva: true,
                bloqueio: true,
                deslocamento: true,
                limitePeEaPorTurno: true,
                prestigioGeral: true,
                prestigioCla: true,
            },
        });
        if (!personagem || personagem.campanhaId !== campanhaId) {
            throw new campanha_exception_1.PersonagemCampanhaNaoEncontradoException(personagemCampanhaId, campanhaId);
        }
        if (exigirPermissaoEdicao) {
            const podeEditar = acesso.ehMestre || personagem.donoId === usuarioId;
            if (!podeEditar) {
                throw new campanha_exception_1.CampanhaPersonagemEdicaoNegadaException(campanhaId, personagemCampanhaId, usuarioId);
            }
        }
        return {
            acesso,
            personagem,
        };
    }
};
exports.CampanhaAccessService = CampanhaAccessService;
exports.CampanhaAccessService = CampanhaAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampanhaAccessService);
//# sourceMappingURL=campanha.access.service.js.map