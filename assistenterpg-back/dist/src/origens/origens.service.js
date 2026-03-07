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
exports.OrigensService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const origem_exception_1 = require("../common/exceptions/origem.exception");
const suplemento_exception_1 = require("../common/exceptions/suplemento.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
let OrigensService = class OrigensService {
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
                throw new suplemento_exception_1.SuplementoNaoEncontradoException(suplementoId);
            }
            if (fonte !== client_1.TipoFonte.SUPLEMENTO) {
                throw new common_1.BadRequestException('Quando suplementoId for informado, fonte deve ser SUPLEMENTO');
            }
            return;
        }
        if (fonte === client_1.TipoFonte.SUPLEMENTO) {
            throw new common_1.BadRequestException('fonte SUPLEMENTO exige suplementoId');
        }
    }
    addHabilidadesIniciais(origem) {
        const habilidadesIniciais = origem.habilidadesOrigem?.map((rel) => rel.habilidade) ?? [];
        return {
            ...origem,
            habilidadesIniciais,
        };
    }
    async create(dto) {
        try {
            const existente = await this.prisma.origem.findUnique({
                where: { nome: dto.nome },
            });
            if (existente) {
                throw new origem_exception_1.OrigemNomeDuplicadoException(dto.nome);
            }
            if (dto.pericias?.length) {
                const periciaIds = dto.pericias.map((p) => p.periciaId);
                const periciasExistentes = await this.prisma.pericia.findMany({
                    where: { id: { in: periciaIds } },
                    select: { id: true },
                });
                if (periciasExistentes.length !== periciaIds.length) {
                    const idsEncontrados = periciasExistentes.map((p) => p.id);
                    const idsInvalidos = periciaIds.filter((id) => !idsEncontrados.includes(id));
                    throw new origem_exception_1.OrigemPericiasInvalidasException(idsInvalidos);
                }
            }
            if (dto.habilidadesIds?.length) {
                const habilidadesExistentes = await this.prisma.habilidade.findMany({
                    where: { id: { in: dto.habilidadesIds } },
                    select: { id: true },
                });
                if (habilidadesExistentes.length !== dto.habilidadesIds.length) {
                    const idsEncontrados = habilidadesExistentes.map((h) => h.id);
                    const idsInvalidos = dto.habilidadesIds.filter((id) => !idsEncontrados.includes(id));
                    throw new origem_exception_1.OrigemHabilidadesInvalidasException(idsInvalidos);
                }
            }
            const suplementoIdFinal = dto.suplementoId ?? null;
            const fonteFinal = dto.fonte ??
                (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : client_1.TipoFonte.SISTEMA_BASE);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            const origem = await this.prisma.origem.create({
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    requisitosTexto: dto.requisitosTexto,
                    requerGrandeCla: dto.requerGrandeCla ?? false,
                    requerTecnicaHeriditaria: dto.requerTecnicaHeriditaria ?? false,
                    bloqueiaTecnicaHeriditaria: dto.bloqueiaTecnicaHeriditaria ?? false,
                    fonte: fonteFinal,
                    suplementoId: suplementoIdFinal,
                    ...(dto.pericias?.length && {
                        pericias: {
                            create: dto.pericias.map((p) => ({
                                periciaId: p.periciaId,
                                tipo: p.tipo,
                                grupoEscolha: p.grupoEscolha,
                            })),
                        },
                    }),
                    ...(dto.habilidadesIds?.length && {
                        habilidadesOrigem: {
                            create: dto.habilidadesIds.map((habilidadeId) => ({
                                habilidadeId,
                            })),
                        },
                    }),
                },
                include: {
                    pericias: {
                        include: {
                            pericia: true,
                        },
                    },
                    habilidadesOrigem: {
                        include: {
                            habilidade: true,
                        },
                    },
                },
            });
            return this.addHabilidadesIniciais(origem);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findAll() {
        try {
            const origens = await this.prisma.origem.findMany({
                orderBy: { nome: 'asc' },
                include: {
                    pericias: {
                        include: {
                            pericia: true,
                        },
                        orderBy: { tipo: 'asc' },
                    },
                    habilidadesOrigem: {
                        include: {
                            habilidade: true,
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
            return origens.map((o) => this.addHabilidadesIniciais(o));
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
            const origem = await this.prisma.origem.findUnique({
                where: { id },
                include: {
                    pericias: {
                        include: {
                            pericia: true,
                        },
                        orderBy: { tipo: 'asc' },
                    },
                    habilidadesOrigem: {
                        include: {
                            habilidade: true,
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
            if (!origem) {
                throw new origem_exception_1.OrigemNaoEncontradaException(id);
            }
            return this.addHabilidadesIniciais(origem);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async update(id, dto) {
        try {
            const origemAtual = await this.findOne(id);
            if (dto.nome) {
                const duplicado = await this.prisma.origem.findFirst({
                    where: {
                        nome: dto.nome,
                        NOT: { id },
                    },
                });
                if (duplicado) {
                    throw new origem_exception_1.OrigemNomeDuplicadoException(dto.nome);
                }
            }
            if (dto.pericias?.length) {
                const periciaIds = dto.pericias.map((p) => p.periciaId);
                const periciasExistentes = await this.prisma.pericia.findMany({
                    where: { id: { in: periciaIds } },
                    select: { id: true },
                });
                if (periciasExistentes.length !== periciaIds.length) {
                    const idsEncontrados = periciasExistentes.map((p) => p.id);
                    const idsInvalidos = periciaIds.filter((id) => !idsEncontrados.includes(id));
                    throw new origem_exception_1.OrigemPericiasInvalidasException(idsInvalidos);
                }
            }
            if (dto.habilidadesIds?.length) {
                const habilidadesExistentes = await this.prisma.habilidade.findMany({
                    where: { id: { in: dto.habilidadesIds } },
                    select: { id: true },
                });
                if (habilidadesExistentes.length !== dto.habilidadesIds.length) {
                    const idsEncontrados = habilidadesExistentes.map((h) => h.id);
                    const idsInvalidos = dto.habilidadesIds.filter((id) => !idsEncontrados.includes(id));
                    throw new origem_exception_1.OrigemHabilidadesInvalidasException(idsInvalidos);
                }
            }
            const suplementoIdFinal = dto.suplementoId !== undefined
                ? dto.suplementoId
                : origemAtual.suplementoId;
            const fonteFinal = dto.fonte ??
                (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : origemAtual.fonte);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            const origem = await this.prisma.origem.update({
                where: { id },
                data: {
                    ...(dto.nome && { nome: dto.nome }),
                    ...(dto.descricao !== undefined && { descricao: dto.descricao }),
                    ...(dto.requisitosTexto !== undefined && {
                        requisitosTexto: dto.requisitosTexto,
                    }),
                    ...(dto.requerGrandeCla !== undefined && {
                        requerGrandeCla: dto.requerGrandeCla,
                    }),
                    ...(dto.requerTecnicaHeriditaria !== undefined && {
                        requerTecnicaHeriditaria: dto.requerTecnicaHeriditaria,
                    }),
                    ...(dto.bloqueiaTecnicaHeriditaria !== undefined && {
                        bloqueiaTecnicaHeriditaria: dto.bloqueiaTecnicaHeriditaria,
                    }),
                    ...(fonteFinal !== origemAtual.fonte && { fonte: fonteFinal }),
                    ...(dto.suplementoId !== undefined && {
                        suplementoId: dto.suplementoId,
                    }),
                    ...(dto.pericias !== undefined && {
                        pericias: {
                            deleteMany: {},
                            ...(dto.pericias.length > 0 && {
                                create: dto.pericias.map((p) => ({
                                    periciaId: p.periciaId,
                                    tipo: p.tipo,
                                    grupoEscolha: p.grupoEscolha,
                                })),
                            }),
                        },
                    }),
                    ...(dto.habilidadesIds !== undefined && {
                        habilidadesOrigem: {
                            deleteMany: {},
                            ...(dto.habilidadesIds.length > 0 && {
                                create: dto.habilidadesIds.map((habilidadeId) => ({
                                    habilidadeId,
                                })),
                            }),
                        },
                    }),
                },
                include: {
                    pericias: {
                        include: {
                            pericia: true,
                        },
                    },
                    habilidadesOrigem: {
                        include: {
                            habilidade: true,
                        },
                    },
                },
            });
            return this.addHabilidadesIniciais(origem);
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
            await this.findOne(id);
            const [usadaEmBase, usadaEmCampanha] = await Promise.all([
                this.prisma.personagemBase.count({ where: { origemId: id } }),
                this.prisma.personagemCampanha.count({ where: { origemId: id } }),
            ]);
            const totalUsos = usadaEmBase + usadaEmCampanha;
            if (totalUsos > 0) {
                throw new origem_exception_1.OrigemEmUsoException(id, totalUsos, {
                    personagensBase: usadaEmBase,
                    personagensCampanha: usadaEmCampanha,
                });
            }
            await this.prisma.origem.delete({ where: { id } });
            return { message: 'Origem removida com sucesso' };
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
};
exports.OrigensService = OrigensService;
exports.OrigensService = OrigensService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrigensService);
//# sourceMappingURL=origens.service.js.map