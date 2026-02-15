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
exports.ClasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cla_exception_1 = require("../common/exceptions/cla.exception");
let ClasService = class ClasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existente = await this.prisma.cla.findUnique({
            where: { nome: dto.nome },
        });
        if (existente) {
            throw new cla_exception_1.ClaNomeDuplicadoException(dto.nome);
        }
        if (dto.tecnicasHereditariasIds?.length) {
            const tecnicasExistentes = await this.prisma.tecnicaAmaldicoada.findMany({
                where: {
                    id: { in: dto.tecnicasHereditariasIds },
                    hereditaria: true,
                },
                select: { id: true },
            });
            if (tecnicasExistentes.length !== dto.tecnicasHereditariasIds.length) {
                const idsEncontrados = new Set(tecnicasExistentes.map((t) => t.id));
                const idsInvalidos = dto.tecnicasHereditariasIds.filter((id) => !idsEncontrados.has(id));
                throw new cla_exception_1.TecnicasHereditariasInvalidasException(idsInvalidos);
            }
        }
        const cla = await this.prisma.cla.create({
            data: {
                nome: dto.nome,
                descricao: dto.descricao,
                grandeCla: dto.grandeCla,
                ...(dto.tecnicasHereditariasIds?.length && {
                    tecnicasHereditarias: {
                        create: dto.tecnicasHereditariasIds.map((tecnicaId) => ({
                            tecnicaId,
                        })),
                    },
                }),
            },
            include: {
                tecnicasHereditarias: {
                    include: {
                        tecnica: {
                            select: {
                                id: true,
                                codigo: true,
                                nome: true,
                                descricao: true,
                                tipo: true,
                            },
                        },
                    },
                },
            },
        });
        return cla;
    }
    async findAll() {
        return this.prisma.cla.findMany({
            orderBy: { nome: 'asc' },
            include: {
                tecnicasHereditarias: {
                    include: {
                        tecnica: {
                            select: {
                                id: true,
                                codigo: true,
                                nome: true,
                                descricao: true,
                                tipo: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        personagensBase: true,
                        personagensCampanha: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const cla = await this.prisma.cla.findUnique({
            where: { id },
            include: {
                tecnicasHereditarias: {
                    include: {
                        tecnica: {
                            select: {
                                id: true,
                                codigo: true,
                                nome: true,
                                descricao: true,
                                tipo: true,
                                requisitos: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        personagensBase: true,
                        personagensCampanha: true,
                    },
                },
            },
        });
        if (!cla) {
            throw new cla_exception_1.ClaNaoEncontradoException(id);
        }
        return cla;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.nome) {
            const duplicado = await this.prisma.cla.findFirst({
                where: {
                    nome: dto.nome,
                    NOT: { id },
                },
            });
            if (duplicado) {
                throw new cla_exception_1.ClaNomeDuplicadoException(dto.nome);
            }
        }
        if (dto.tecnicasHereditariasIds?.length) {
            const tecnicasExistentes = await this.prisma.tecnicaAmaldicoada.findMany({
                where: {
                    id: { in: dto.tecnicasHereditariasIds },
                    hereditaria: true,
                },
                select: { id: true },
            });
            if (tecnicasExistentes.length !== dto.tecnicasHereditariasIds.length) {
                const idsEncontrados = new Set(tecnicasExistentes.map((t) => t.id));
                const idsInvalidos = dto.tecnicasHereditariasIds.filter((id) => !idsEncontrados.has(id));
                throw new cla_exception_1.TecnicasHereditariasInvalidasException(idsInvalidos);
            }
        }
        const cla = await this.prisma.cla.update({
            where: { id },
            data: {
                ...(dto.nome && { nome: dto.nome }),
                ...(dto.descricao !== undefined && { descricao: dto.descricao }),
                ...(dto.grandeCla !== undefined && { grandeCla: dto.grandeCla }),
                ...(dto.tecnicasHereditariasIds !== undefined && {
                    tecnicasHereditarias: {
                        deleteMany: {},
                        ...(dto.tecnicasHereditariasIds.length > 0 && {
                            create: dto.tecnicasHereditariasIds.map((tecnicaId) => ({
                                tecnicaId,
                            })),
                        }),
                    },
                }),
            },
            include: {
                tecnicasHereditarias: {
                    include: {
                        tecnica: {
                            select: {
                                id: true,
                                codigo: true,
                                nome: true,
                                descricao: true,
                                tipo: true,
                            },
                        },
                    },
                },
            },
        });
        return cla;
    }
    async remove(id) {
        await this.findOne(id);
        const [usadoEmBase, usadoEmCampanha] = await Promise.all([
            this.prisma.personagemBase.count({ where: { claId: id } }),
            this.prisma.personagemCampanha.count({ where: { claId: id } }),
        ]);
        const totalUsos = usadoEmBase + usadoEmCampanha;
        if (totalUsos > 0) {
            throw new cla_exception_1.ClaEmUsoException(totalUsos, usadoEmBase, usadoEmCampanha);
        }
        await this.prisma.cla.delete({
            where: { id },
        });
        return { message: 'Clã removido com sucesso' };
    }
};
exports.ClasService = ClasService;
exports.ClasService = ClasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClasService);
//# sourceMappingURL=clas.service.js.map