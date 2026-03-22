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
exports.TecnicasAmaldicoadasPersistence = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tecnicas_amaldicoadas_mapper_1 = require("./tecnicas-amaldicoadas.mapper");
let TecnicasAmaldicoadasPersistence = class TecnicasAmaldicoadasPersistence {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buscarTecnicaDetalhadaPorId(id, prisma = this.prisma) {
        return prisma.tecnicaAmaldicoada.findUnique({
            where: { id },
            include: tecnicas_amaldicoadas_mapper_1.tecnicaDetalhadaInclude,
        });
    }
    async buscarTecnicaDetalhadaPorCodigo(codigo, prisma = this.prisma) {
        return prisma.tecnicaAmaldicoada.findUnique({
            where: { codigo },
            include: tecnicas_amaldicoadas_mapper_1.tecnicaDetalhadaInclude,
        });
    }
    async listarTecnicasDetalhadas(where, orderBy = {
        nome: 'asc',
    }, prisma = this.prisma) {
        return prisma.tecnicaAmaldicoada.findMany({
            where,
            include: tecnicas_amaldicoadas_mapper_1.tecnicaDetalhadaInclude,
            orderBy,
        });
    }
    async buscarTecnicasHereditariaPorCla(claId, prisma = this.prisma) {
        return prisma.tecnicaAmaldicoada.findMany({
            where: {
                hereditaria: true,
                clas: {
                    some: { claId },
                },
            },
            include: tecnicas_amaldicoadas_mapper_1.tecnicaDetalhadaInclude,
            orderBy: { nome: 'asc' },
        });
    }
    async buscarTecnicaComUso(id, prisma = this.prisma) {
        return prisma.tecnicaAmaldicoada.findUnique({
            where: { id },
            include: tecnicas_amaldicoadas_mapper_1.tecnicaUsoInclude,
        });
    }
};
exports.TecnicasAmaldicoadasPersistence = TecnicasAmaldicoadasPersistence;
exports.TecnicasAmaldicoadasPersistence = TecnicasAmaldicoadasPersistence = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TecnicasAmaldicoadasPersistence);
//# sourceMappingURL=tecnicas-amaldicoadas.persistence.js.map