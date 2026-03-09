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
exports.SuplementosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const suplemento_exception_1 = require("../common/exceptions/suplemento.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
let SuplementosService = class SuplementosService {
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
    mapearTags(tags) {
        if (!Array.isArray(tags)) {
            return [];
        }
        return tags.filter((tag) => typeof tag === 'string');
    }
    async findAll(filtros, usuarioId) {
        try {
            const where = {};
            if (filtros.nome) {
                where.nome = { contains: filtros.nome };
            }
            if (filtros.codigo) {
                where.codigo = filtros.codigo;
            }
            if (filtros.status) {
                where.status = filtros.status;
            }
            if (filtros.autor) {
                where.autor = { contains: filtros.autor };
            }
            if (filtros.apenasAtivos && usuarioId) {
                where.usuariosAtivos = {
                    some: { usuarioId },
                };
            }
            if (usuarioId) {
                const suplementos = await this.prisma.suplemento.findMany({
                    where,
                    include: {
                        usuariosAtivos: {
                            where: { usuarioId },
                        },
                    },
                    orderBy: { nome: 'asc' },
                });
                return suplementos.map((suplemento) => this.mapToDto(suplemento, usuarioId));
            }
            const suplementos = await this.prisma.suplemento.findMany({
                where,
                orderBy: { nome: 'asc' },
            });
            return suplementos.map((suplemento) => this.mapToDto(suplemento));
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findOne(id, usuarioId) {
        try {
            if (usuarioId) {
                const suplemento = await this.prisma.suplemento.findUnique({
                    where: { id },
                    include: {
                        usuariosAtivos: {
                            where: { usuarioId },
                        },
                    },
                });
                if (!suplemento) {
                    throw new suplemento_exception_1.SuplementoNaoEncontradoException(id);
                }
                return this.mapToDto(suplemento, usuarioId);
            }
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { id },
            });
            if (!suplemento) {
                throw new suplemento_exception_1.SuplementoNaoEncontradoException(id);
            }
            return this.mapToDto(suplemento);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findByCodigo(codigo, usuarioId) {
        try {
            if (usuarioId) {
                const suplemento = await this.prisma.suplemento.findUnique({
                    where: { codigo },
                    include: {
                        usuariosAtivos: {
                            where: { usuarioId },
                        },
                    },
                });
                if (!suplemento) {
                    throw new suplemento_exception_1.SuplementoNaoEncontradoException(codigo);
                }
                return this.mapToDto(suplemento, usuarioId);
            }
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { codigo },
            });
            if (!suplemento) {
                throw new suplemento_exception_1.SuplementoNaoEncontradoException(codigo);
            }
            return this.mapToDto(suplemento);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async create(dto) {
        try {
            const existe = await this.prisma.suplemento.findUnique({
                where: { codigo: dto.codigo },
            });
            if (existe) {
                throw new suplemento_exception_1.SuplementoCodigoDuplicadoException(dto.codigo);
            }
            const suplemento = await this.prisma.suplemento.create({
                data: {
                    codigo: dto.codigo,
                    nome: dto.nome,
                    descricao: dto.descricao ?? null,
                    versao: dto.versao ?? '1.0.0',
                    status: dto.status ?? client_1.StatusPublicacao.RASCUNHO,
                    icone: dto.icone ?? null,
                    banner: dto.banner ?? null,
                    tags: dto.tags ? dto.tags : client_1.Prisma.JsonNull,
                    autor: dto.autor ?? null,
                },
            });
            return this.mapToDto(suplemento);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async update(id, dto) {
        try {
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { id },
            });
            if (!suplemento) {
                throw new suplemento_exception_1.SuplementoNaoEncontradoException(id);
            }
            const atualizado = await this.prisma.suplemento.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    versao: dto.versao,
                    status: dto.status,
                    icone: dto.icone,
                    banner: dto.banner,
                    tags: dto.tags !== undefined
                        ? dto.tags
                            ? dto.tags
                            : client_1.Prisma.JsonNull
                        : undefined,
                    autor: dto.autor,
                },
            });
            return this.mapToDto(atualizado);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async remove(id) {
        try {
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            cla: true,
                            classes: true,
                            trilhas: true,
                            caminhos: true,
                            origens: true,
                            equipamentos: true,
                            habilidades: true,
                            tecnicas: true,
                            modificacoes: true,
                        },
                    },
                },
            });
            if (!suplemento) {
                throw new suplemento_exception_1.SuplementoNaoEncontradoException(id);
            }
            const detalhesConteudo = {
                cla: suplemento._count.cla,
                classes: suplemento._count.classes,
                trilhas: suplemento._count.trilhas,
                caminhos: suplemento._count.caminhos,
                origens: suplemento._count.origens,
                equipamentos: suplemento._count.equipamentos,
                habilidades: suplemento._count.habilidades,
                tecnicas: suplemento._count.tecnicas,
                modificacoes: suplemento._count.modificacoes,
            };
            const totalConteudo = Object.values(detalhesConteudo).reduce((acc, val) => acc + val, 0);
            if (totalConteudo > 0) {
                throw new suplemento_exception_1.SuplementoComConteudoVinculadoException(id, totalConteudo, detalhesConteudo);
            }
            await this.prisma.suplemento.delete({ where: { id } });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findSuplementosAtivos(usuarioId) {
        try {
            const suplementos = await this.prisma.suplemento.findMany({
                where: {
                    usuariosAtivos: {
                        some: { usuarioId },
                    },
                    status: client_1.StatusPublicacao.PUBLICADO,
                },
                include: {
                    usuariosAtivos: {
                        where: { usuarioId },
                    },
                },
                orderBy: { nome: 'asc' },
            });
            return suplementos.map((suplemento) => this.mapToDto(suplemento, usuarioId));
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async ativarSuplemento(usuarioId, suplementoId) {
        try {
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { id: suplementoId },
            });
            if (!suplemento) {
                throw new suplemento_exception_1.SuplementoNaoEncontradoException(suplementoId);
            }
            if (suplemento.status !== client_1.StatusPublicacao.PUBLICADO) {
                throw new suplemento_exception_1.SuplementoNaoPublicadoException(suplementoId, suplemento.status);
            }
            const jaAtivo = await this.prisma.usuarioSuplemento.findUnique({
                where: {
                    usuarioId_suplementoId: {
                        usuarioId,
                        suplementoId,
                    },
                },
            });
            if (jaAtivo) {
                throw new suplemento_exception_1.SuplementoJaAtivoException(usuarioId, suplementoId);
            }
            await this.prisma.usuarioSuplemento.create({
                data: {
                    usuarioId,
                    suplementoId,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async desativarSuplemento(usuarioId, suplementoId) {
        try {
            const ativo = await this.prisma.usuarioSuplemento.findUnique({
                where: {
                    usuarioId_suplementoId: {
                        usuarioId,
                        suplementoId,
                    },
                },
            });
            if (!ativo) {
                throw new suplemento_exception_1.SuplementoNaoAtivoException(usuarioId, suplementoId);
            }
            await this.prisma.usuarioSuplemento.delete({
                where: {
                    usuarioId_suplementoId: {
                        usuarioId,
                        suplementoId,
                    },
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    mapToDto(suplemento, usuarioId) {
        return {
            id: suplemento.id,
            codigo: suplemento.codigo,
            nome: suplemento.nome,
            descricao: suplemento.descricao ?? undefined,
            versao: suplemento.versao,
            status: suplemento.status,
            icone: suplemento.icone ?? undefined,
            banner: suplemento.banner ?? undefined,
            tags: this.mapearTags(suplemento.tags),
            autor: suplemento.autor ?? undefined,
            ativo: usuarioId
                ? (suplemento.usuariosAtivos?.length ?? 0) > 0
                : undefined,
            criadoEm: suplemento.criadoEm,
            atualizadoEm: suplemento.atualizadoEm,
        };
    }
};
exports.SuplementosService = SuplementosService;
exports.SuplementosService = SuplementosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuplementosService);
//# sourceMappingURL=suplementos.service.js.map