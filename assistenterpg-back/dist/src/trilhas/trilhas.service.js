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
exports.TrilhasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const trilha_exception_1 = require("../common/exceptions/trilha.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
let TrilhasService = class TrilhasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureTrilha(id) {
        const trilha = await this.prisma.trilha.findUnique({ where: { id } });
        if (!trilha) {
            throw new trilha_exception_1.TrilhaNaoEncontradaException(id);
        }
        return trilha;
    }
    async ensureCaminho(id) {
        const caminho = await this.prisma.caminho.findUnique({ where: { id } });
        if (!caminho) {
            throw new trilha_exception_1.CaminhoNaoEncontradoException(id);
        }
        return caminho;
    }
    async create(createDto) {
        try {
            const classe = await this.prisma.classe.findUnique({
                where: { id: createDto.classeId },
            });
            if (!classe) {
                throw new trilha_exception_1.TrilhaClasseNaoEncontradaException(createDto.classeId);
            }
            const existente = await this.prisma.trilha.findUnique({
                where: { nome: createDto.nome },
            });
            if (existente) {
                throw new trilha_exception_1.TrilhaNomeDuplicadoException(createDto.nome);
            }
            const trilha = await this.prisma.trilha.create({
                data: {
                    classeId: createDto.classeId,
                    nome: createDto.nome,
                    descricao: createDto.descricao,
                    requisitos: createDto.requisitos,
                    ...(createDto.habilidades?.length && {
                        habilidadesTrilha: {
                            create: createDto.habilidades.map((hab) => ({
                                habilidadeId: hab.habilidadeId,
                                nivelConcedido: hab.nivelConcedido,
                                caminhoId: hab.caminhoId,
                            })),
                        },
                    }),
                },
                include: {
                    classe: { select: { id: true, nome: true } },
                    habilidadesTrilha: {
                        include: {
                            habilidade: { select: { id: true, nome: true, descricao: true } },
                            caminho: { select: { id: true, nome: true } },
                        },
                        orderBy: { nivelConcedido: 'asc' },
                    },
                    caminhos: { select: { id: true, nome: true } },
                },
            });
            return trilha;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findAll(classeId) {
        try {
            const where = classeId ? { classeId } : {};
            return this.prisma.trilha.findMany({
                where,
                include: {
                    classe: { select: { id: true, nome: true } },
                    caminhos: { select: { id: true, nome: true } },
                    _count: {
                        select: {
                            habilidadesTrilha: true,
                            personagensBase: true,
                            personagensCampanha: true,
                        },
                    },
                },
                orderBy: { nome: 'asc' },
            });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findOne(id) {
        try {
            const trilha = await this.prisma.trilha.findUnique({
                where: { id },
                include: {
                    classe: { select: { id: true, nome: true } },
                    caminhos: {
                        select: { id: true, nome: true, descricao: true },
                        orderBy: { nome: 'asc' },
                    },
                    habilidadesTrilha: {
                        include: {
                            habilidade: { select: { id: true, nome: true, descricao: true, tipo: true } },
                            caminho: { select: { id: true, nome: true } },
                        },
                        orderBy: { nivelConcedido: 'asc' },
                    },
                    _count: {
                        select: {
                            personagensBase: true,
                            personagensCampanha: true,
                        },
                    },
                },
            });
            if (!trilha) {
                throw new trilha_exception_1.TrilhaNaoEncontradaException(id);
            }
            return trilha;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async update(id, updateDto) {
        try {
            await this.ensureTrilha(id);
            if (updateDto.nome) {
                const duplicado = await this.prisma.trilha.findFirst({
                    where: {
                        nome: updateDto.nome,
                        NOT: { id },
                    },
                });
                if (duplicado) {
                    throw new trilha_exception_1.TrilhaNomeDuplicadoException(updateDto.nome);
                }
            }
            const trilha = await this.prisma.trilha.update({
                where: { id },
                data: {
                    ...(updateDto.nome && { nome: updateDto.nome }),
                    ...(updateDto.descricao !== undefined && { descricao: updateDto.descricao }),
                    ...(updateDto.requisitos !== undefined && { requisitos: updateDto.requisitos }),
                    ...(updateDto.habilidades && {
                        habilidadesTrilha: {
                            deleteMany: {},
                            create: updateDto.habilidades.map((hab) => ({
                                habilidadeId: hab.habilidadeId,
                                nivelConcedido: hab.nivelConcedido,
                                caminhoId: hab.caminhoId,
                            })),
                        },
                    }),
                },
                include: {
                    classe: { select: { id: true, nome: true } },
                    habilidadesTrilha: {
                        include: {
                            habilidade: { select: { id: true, nome: true, descricao: true } },
                            caminho: { select: { id: true, nome: true } },
                        },
                        orderBy: { nivelConcedido: 'asc' },
                    },
                    caminhos: { select: { id: true, nome: true } },
                },
            });
            return trilha;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.ensureTrilha(id);
            const [usadaEmBase, usadaEmCampanha] = await Promise.all([
                this.prisma.personagemBase.count({ where: { trilhaId: id } }),
                this.prisma.personagemCampanha.count({ where: { trilhaId: id } }),
            ]);
            const totalUsos = usadaEmBase + usadaEmCampanha;
            if (totalUsos > 0) {
                throw new trilha_exception_1.TrilhaEmUsoException(id, totalUsos, {
                    personagensBase: usadaEmBase,
                    personagensCampanha: usadaEmCampanha,
                });
            }
            await this.prisma.trilha.delete({
                where: { id },
            });
            return { message: 'Trilha removida com sucesso' };
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async createCaminho(createDto) {
        try {
            await this.ensureTrilha(createDto.trilhaId);
            const existente = await this.prisma.caminho.findUnique({
                where: { nome: createDto.nome },
            });
            if (existente) {
                throw new trilha_exception_1.CaminhoNomeDuplicadoException(createDto.nome);
            }
            const caminho = await this.prisma.caminho.create({
                data: {
                    trilhaId: createDto.trilhaId,
                    nome: createDto.nome,
                    descricao: createDto.descricao,
                    ...(createDto.habilidades?.length && {
                        habilidadesTrilha: {
                            create: createDto.habilidades.map((hab) => ({
                                trilhaId: createDto.trilhaId,
                                habilidadeId: hab.habilidadeId,
                                nivelConcedido: hab.nivelConcedido,
                            })),
                        },
                    }),
                },
                include: {
                    trilha: { select: { id: true, nome: true } },
                    habilidadesTrilha: {
                        include: {
                            habilidade: { select: { id: true, nome: true, descricao: true } },
                        },
                        orderBy: { nivelConcedido: 'asc' },
                    },
                },
            });
            return caminho;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async updateCaminho(id, updateDto) {
        try {
            await this.ensureCaminho(id);
            if (updateDto.nome) {
                const duplicado = await this.prisma.caminho.findFirst({
                    where: {
                        nome: updateDto.nome,
                        NOT: { id },
                    },
                });
                if (duplicado) {
                    throw new trilha_exception_1.CaminhoNomeDuplicadoException(updateDto.nome);
                }
            }
            const caminho = await this.prisma.caminho.update({
                where: { id },
                data: {
                    ...(updateDto.nome && { nome: updateDto.nome }),
                    ...(updateDto.descricao !== undefined && { descricao: updateDto.descricao }),
                    ...(updateDto.habilidades && {
                        habilidadesTrilha: {
                            deleteMany: { caminhoId: id },
                            create: updateDto.habilidades.map((hab) => ({
                                trilhaId: updateDto.trilhaId,
                                habilidadeId: hab.habilidadeId,
                                nivelConcedido: hab.nivelConcedido,
                            })),
                        },
                    }),
                },
                include: {
                    trilha: { select: { id: true, nome: true } },
                    habilidadesTrilha: {
                        include: {
                            habilidade: { select: { id: true, nome: true, descricao: true } },
                        },
                        orderBy: { nivelConcedido: 'asc' },
                    },
                },
            });
            return caminho;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async removeCaminho(id) {
        try {
            await this.ensureCaminho(id);
            const [usadoEmBase, usadoEmCampanha] = await Promise.all([
                this.prisma.personagemBase.count({ where: { caminhoId: id } }),
                this.prisma.personagemCampanha.count({ where: { caminhoId: id } }),
            ]);
            const totalUsos = usadoEmBase + usadoEmCampanha;
            if (totalUsos > 0) {
                throw new trilha_exception_1.CaminhoEmUsoException(id, totalUsos, {
                    personagensBase: usadoEmBase,
                    personagensCampanha: usadoEmCampanha,
                });
            }
            await this.prisma.caminho.delete({
                where: { id },
            });
            return { message: 'Caminho removido com sucesso' };
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findCaminhos(trilhaId) {
        try {
            await this.ensureTrilha(trilhaId);
            const caminhos = await this.prisma.caminho.findMany({
                where: { trilhaId },
                orderBy: { nome: 'asc' },
            });
            return caminhos.map((c) => ({
                id: c.id,
                nome: c.nome,
                descricao: c.descricao,
                trilhaId: c.trilhaId,
            }));
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findHabilidades(trilhaId) {
        try {
            await this.ensureTrilha(trilhaId);
            const itens = await this.prisma.habilidadeTrilha.findMany({
                where: { trilhaId },
                orderBy: { nivelConcedido: 'asc' },
                include: {
                    habilidade: true,
                    caminho: true,
                },
            });
            return itens.map((ht) => ({
                id: ht.id,
                nivelConcedido: ht.nivelConcedido,
                habilidadeId: ht.habilidadeId,
                habilidadeNome: ht.habilidade.nome,
                habilidadeDescricao: ht.habilidade.descricao,
                caminhoId: ht.caminhoId,
                caminhoNome: ht.caminho?.nome ?? null,
            }));
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
};
exports.TrilhasService = TrilhasService;
exports.TrilhasService = TrilhasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrilhasService);
//# sourceMappingURL=trilhas.service.js.map