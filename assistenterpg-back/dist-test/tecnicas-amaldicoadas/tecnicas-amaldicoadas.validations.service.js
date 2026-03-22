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
exports.TecnicasAmaldicoadasValidationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const tecnica_amaldicoada_exception_1 = require("src/common/exceptions/tecnica-amaldicoada.exception");
let TecnicasAmaldicoadasValidationsService = class TecnicasAmaldicoadasValidationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validarFonteSuplemento(fonte, suplementoId) {
        if (suplementoId) {
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { id: suplementoId },
                select: { id: true },
            });
            if (!suplemento) {
                throw new tecnica_amaldicoada_exception_1.TecnicaSuplementoNaoEncontradoException(suplementoId);
            }
            if (fonte !== client_1.TipoFonte.SUPLEMENTO) {
                throw new common_1.BadRequestException({
                    code: 'FONTE_SUPLEMENTO_OBRIGATORIA',
                    message: 'Quando suplementoId for informado, fonte deve ser SUPLEMENTO',
                    field: 'fonte',
                });
            }
            return;
        }
        if (fonte === client_1.TipoFonte.SUPLEMENTO) {
            throw new common_1.BadRequestException({
                code: 'SUPLEMENTO_ID_OBRIGATORIO',
                message: 'fonte SUPLEMENTO exige suplementoId',
                field: 'suplementoId',
            });
        }
    }
};
exports.TecnicasAmaldicoadasValidationsService = TecnicasAmaldicoadasValidationsService;
exports.TecnicasAmaldicoadasValidationsService = TecnicasAmaldicoadasValidationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TecnicasAmaldicoadasValidationsService);
//# sourceMappingURL=tecnicas-amaldicoadas.validations.service.js.map