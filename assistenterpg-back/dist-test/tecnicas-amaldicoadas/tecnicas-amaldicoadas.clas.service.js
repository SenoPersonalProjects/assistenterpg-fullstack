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
exports.TecnicasAmaldicoadasClasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tecnica_amaldicoada_exception_1 = require("src/common/exceptions/tecnica-amaldicoada.exception");
let TecnicasAmaldicoadasClasService = class TecnicasAmaldicoadasClasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async vincularClas(tecnicaId, claNomes) {
        for (const nome of claNomes) {
            const cla = await this.prisma.cla.findUnique({ where: { nome } });
            if (!cla) {
                throw new tecnica_amaldicoada_exception_1.TecnicaClaNaoEncontradoException(nome);
            }
            await this.prisma.tecnicaCla.create({
                data: {
                    tecnicaId,
                    claId: cla.id,
                },
            });
        }
    }
};
exports.TecnicasAmaldicoadasClasService = TecnicasAmaldicoadasClasService;
exports.TecnicasAmaldicoadasClasService = TecnicasAmaldicoadasClasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TecnicasAmaldicoadasClasService);
//# sourceMappingURL=tecnicas-amaldicoadas.clas.service.js.map