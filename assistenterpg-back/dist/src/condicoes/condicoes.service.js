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
exports.CondicoesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const condicao_exception_1 = require("../common/exceptions/condicao.exception");
let CondicoesService = class CondicoesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto) {
        const existente = await this.prisma.condicao.findUnique({
            where: { nome: createDto.nome },
        });
        if (existente) {
            throw new condicao_exception_1.CondicaoNomeDuplicadoException(createDto.nome);
        }
        return this.prisma.condicao.create({
            data: {
                nome: createDto.nome,
                descricao: createDto.descricao,
            },
        });
    }
    async findAll() {
        return this.prisma.condicao.findMany({
            orderBy: { nome: 'asc' },
            include: {
                _count: {
                    select: {
                        condicoesPersonagemSessao: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const condicao = await this.prisma.condicao.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        condicoesPersonagemSessao: true,
                    },
                },
            },
        });
        if (!condicao) {
            throw new condicao_exception_1.CondicaoNaoEncontradaException(id);
        }
        return condicao;
    }
    async update(id, updateDto) {
        await this.findOne(id);
        if (updateDto.nome) {
            const duplicado = await this.prisma.condicao.findFirst({
                where: {
                    nome: updateDto.nome,
                    NOT: { id },
                },
            });
            if (duplicado) {
                throw new condicao_exception_1.CondicaoNomeDuplicadoException(updateDto.nome);
            }
        }
        return this.prisma.condicao.update({
            where: { id },
            data: {
                ...(updateDto.nome && { nome: updateDto.nome }),
                ...(updateDto.descricao !== undefined && {
                    descricao: updateDto.descricao,
                }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        const usadaEmSessoes = await this.prisma.condicaoPersonagemSessao.count({
            where: { condicaoId: id },
        });
        if (usadaEmSessoes > 0) {
            throw new condicao_exception_1.CondicaoEmUsoException(id, usadaEmSessoes);
        }
        await this.prisma.condicao.delete({
            where: { id },
        });
        return { message: 'Condição removida com sucesso' };
    }
};
exports.CondicoesService = CondicoesService;
exports.CondicoesService = CondicoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CondicoesService);
//# sourceMappingURL=condicoes.service.js.map