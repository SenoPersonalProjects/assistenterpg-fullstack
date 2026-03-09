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
exports.ProficienciasService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const proficiencia_exception_1 = require("../common/exceptions/proficiencia.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
let ProficienciasService = class ProficienciasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    tratarErroPrisma(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError ||
            error instanceof client_1.Prisma.PrismaClientValidationError) {
            (0, database_exception_1.handlePrismaError)(error);
        }
    }
    async create(dto) {
        try {
            return this.prisma.proficiencia.create({ data: dto });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findAll() {
        try {
            return this.prisma.proficiencia.findMany({
                orderBy: { nome: 'asc' },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const prof = await this.prisma.proficiencia.findUnique({ where: { id } });
            if (!prof) {
                throw new proficiencia_exception_1.ProficienciaNaoEncontradaException(id);
            }
            return prof;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async update(id, dto) {
        try {
            await this.findOne(id);
            return this.prisma.proficiencia.update({
                where: { id },
                data: dto,
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.findOne(id);
            await this.prisma.proficiencia.delete({ where: { id } });
            return { sucesso: true };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
};
exports.ProficienciasService = ProficienciasService;
exports.ProficienciasService = ProficienciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProficienciasService);
//# sourceMappingURL=proficiencias.service.js.map