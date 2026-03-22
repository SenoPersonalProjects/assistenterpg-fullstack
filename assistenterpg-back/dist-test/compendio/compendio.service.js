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
exports.CompendioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const compendio_exception_1 = require("src/common/exceptions/compendio.exception");
let CompendioService = class CompendioService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listarCategorias(apenasAtivas = true, page, limit) {
        const where = apenasAtivas ? { ativo: true } : undefined;
        const include = {
            subcategorias: {
                where: apenasAtivas ? { ativo: true } : undefined,
                orderBy: { ordem: 'asc' },
                include: {
                    categoria: true,
                },
            },
        };
        if (!page || !limit) {
            return this.prisma.compendioCategoria.findMany({
                where,
                orderBy: { ordem: 'asc' },
                include,
            });
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.compendioCategoria.findMany({
                where,
                orderBy: { ordem: 'asc' },
                include,
                skip,
                take: limit,
            }),
            this.prisma.compendioCategoria.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async buscarCategoriaPorCodigo(codigo) {
        const categoria = await this.prisma.compendioCategoria.findUnique({
            where: { codigo },
            include: {
                subcategorias: {
                    where: { ativo: true },
                    orderBy: { ordem: 'asc' },
                    include: {
                        categoria: true,
                    },
                },
            },
        });
        if (!categoria) {
            throw new compendio_exception_1.CompendioCategoriaException(codigo);
        }
        return categoria;
    }
    async criarCategoria(dto) {
        const existe = await this.prisma.compendioCategoria.findUnique({
            where: { codigo: dto.codigo },
        });
        if (existe) {
            throw new compendio_exception_1.CompendioCategoriaDuplicadaException(dto.codigo);
        }
        return this.prisma.compendioCategoria.create({ data: dto });
    }
    async atualizarCategoria(id, dto) {
        const existe = await this.prisma.compendioCategoria.findUnique({
            where: { id },
        });
        if (!existe) {
            throw new compendio_exception_1.CompendioCategoriaException(id);
        }
        if (dto.codigo && dto.codigo !== existe.codigo) {
            const outraComCodigo = await this.prisma.compendioCategoria.findUnique({
                where: { codigo: dto.codigo },
            });
            if (outraComCodigo) {
                throw new compendio_exception_1.CompendioCategoriaDuplicadaException(dto.codigo);
            }
        }
        return this.prisma.compendioCategoria.update({ where: { id }, data: dto });
    }
    async removerCategoria(id) {
        const existe = await this.prisma.compendioCategoria.findUnique({
            where: { id },
            include: { subcategorias: true },
        });
        if (!existe) {
            throw new compendio_exception_1.CompendioCategoriaException(id);
        }
        if (existe.subcategorias.length > 0) {
            throw new compendio_exception_1.CompendioCategoriaComSubcategoriasException(id, existe.subcategorias.length);
        }
        await this.prisma.compendioCategoria.delete({ where: { id } });
        return { sucesso: true };
    }
    async listarSubcategorias(categoriaId, apenasAtivas = true, page, limit) {
        const where = {
            categoriaId,
            ...(apenasAtivas && { ativo: true }),
        };
        const include = {
            categoria: true,
            artigos: {
                where: apenasAtivas ? { ativo: true } : undefined,
                orderBy: { ordem: 'asc' },
                include: {
                    subcategoria: true,
                },
            },
        };
        if (!page || !limit) {
            return this.prisma.compendioSubcategoria.findMany({
                where,
                orderBy: { ordem: 'asc' },
                include,
            });
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.compendioSubcategoria.findMany({
                where,
                orderBy: { ordem: 'asc' },
                include,
                skip,
                take: limit,
            }),
            this.prisma.compendioSubcategoria.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async buscarSubcategoriaPorCodigo(codigo) {
        const subcategoria = await this.prisma.compendioSubcategoria.findUnique({
            where: { codigo },
            include: {
                categoria: true,
                artigos: {
                    where: { ativo: true },
                    orderBy: { ordem: 'asc' },
                    include: {
                        subcategoria: true,
                    },
                },
            },
        });
        if (!subcategoria) {
            throw new compendio_exception_1.CompendioSubcategoriaException(codigo);
        }
        return subcategoria;
    }
    async criarSubcategoria(dto) {
        const categoria = await this.prisma.compendioCategoria.findUnique({
            where: { id: dto.categoriaId },
        });
        if (!categoria) {
            throw new compendio_exception_1.CompendioCategoriaException(dto.categoriaId);
        }
        const existe = await this.prisma.compendioSubcategoria.findUnique({
            where: { codigo: dto.codigo },
        });
        if (existe) {
            throw new compendio_exception_1.CompendioSubcategoriaDuplicadaException(dto.codigo);
        }
        return this.prisma.compendioSubcategoria.create({
            data: dto,
            include: { categoria: true },
        });
    }
    async atualizarSubcategoria(id, dto) {
        const existe = await this.prisma.compendioSubcategoria.findUnique({
            where: { id },
        });
        if (!existe) {
            throw new compendio_exception_1.CompendioSubcategoriaException(id);
        }
        if (dto.codigo && dto.codigo !== existe.codigo) {
            const outraComCodigo = await this.prisma.compendioSubcategoria.findUnique({
                where: { codigo: dto.codigo },
            });
            if (outraComCodigo) {
                throw new compendio_exception_1.CompendioSubcategoriaDuplicadaException(dto.codigo);
            }
        }
        return this.prisma.compendioSubcategoria.update({
            where: { id },
            data: dto,
            include: { categoria: true },
        });
    }
    async removerSubcategoria(id) {
        const existe = await this.prisma.compendioSubcategoria.findUnique({
            where: { id },
            include: { artigos: true },
        });
        if (!existe) {
            throw new compendio_exception_1.CompendioSubcategoriaException(id);
        }
        if (existe.artigos.length > 0) {
            throw new compendio_exception_1.CompendioSubcategoriaComArtigosException(id, existe.artigos.length);
        }
        await this.prisma.compendioSubcategoria.delete({ where: { id } });
        return { sucesso: true };
    }
    async listarArtigos(subcategoriaId, apenasAtivos = true, page, limit) {
        const where = {
            ...(subcategoriaId && { subcategoriaId }),
            ...(apenasAtivos && { ativo: true }),
        };
        const include = {
            subcategoria: {
                include: {
                    categoria: true,
                },
            },
        };
        if (!page || !limit) {
            return this.prisma.compendioArtigo.findMany({
                where,
                orderBy: { ordem: 'asc' },
                include,
            });
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.compendioArtigo.findMany({
                where,
                orderBy: { ordem: 'asc' },
                include,
                skip,
                take: limit,
            }),
            this.prisma.compendioArtigo.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async buscarArtigoPorCodigo(codigo) {
        const artigo = await this.prisma.compendioArtigo.findUnique({
            where: { codigo },
            include: {
                subcategoria: {
                    include: {
                        categoria: true,
                    },
                },
            },
        });
        if (!artigo) {
            throw new compendio_exception_1.CompendioArtigoException(codigo);
        }
        return artigo;
    }
    async criarArtigo(dto) {
        const subcategoria = await this.prisma.compendioSubcategoria.findUnique({
            where: { id: dto.subcategoriaId },
        });
        if (!subcategoria) {
            throw new compendio_exception_1.CompendioSubcategoriaException(dto.subcategoriaId);
        }
        const existe = await this.prisma.compendioArtigo.findUnique({
            where: { codigo: dto.codigo },
        });
        if (existe) {
            throw new compendio_exception_1.CompendioArtigoDuplicadoException(dto.codigo);
        }
        return this.prisma.compendioArtigo.create({
            data: dto,
            include: {
                subcategoria: {
                    include: { categoria: true },
                },
            },
        });
    }
    async atualizarArtigo(id, dto) {
        const existe = await this.prisma.compendioArtigo.findUnique({
            where: { id },
        });
        if (!existe) {
            throw new compendio_exception_1.CompendioArtigoException(id);
        }
        if (dto.codigo && dto.codigo !== existe.codigo) {
            const outroComCodigo = await this.prisma.compendioArtigo.findUnique({
                where: { codigo: dto.codigo },
            });
            if (outroComCodigo) {
                throw new compendio_exception_1.CompendioArtigoDuplicadoException(dto.codigo);
            }
        }
        return this.prisma.compendioArtigo.update({
            where: { id },
            data: dto,
            include: {
                subcategoria: {
                    include: { categoria: true },
                },
            },
        });
    }
    async removerArtigo(id) {
        const existe = await this.prisma.compendioArtigo.findUnique({
            where: { id },
        });
        if (!existe) {
            throw new compendio_exception_1.CompendioArtigoException(id);
        }
        await this.prisma.compendioArtigo.delete({ where: { id } });
        return { sucesso: true };
    }
    async buscar(query) {
        const queryTrimmed = query?.trim() || '';
        if (queryTrimmed.length < 3) {
            throw new compendio_exception_1.CompendioBuscaInvalidaException(3, queryTrimmed.length);
        }
        const q = queryTrimmed.toLowerCase();
        return this.prisma.compendioArtigo.findMany({
            where: {
                ativo: true,
                OR: [
                    { titulo: { contains: q } },
                    { resumo: { contains: q } },
                    { palavrasChave: { contains: q } },
                    { conteudo: { contains: q } },
                ],
            },
            include: {
                subcategoria: {
                    include: {
                        categoria: true,
                    },
                },
            },
            take: 20,
        });
    }
    async listarDestaques() {
        return this.prisma.compendioArtigo.findMany({
            where: {
                ativo: true,
                destaque: true,
            },
            orderBy: { ordem: 'asc' },
            include: {
                subcategoria: {
                    include: {
                        categoria: true,
                    },
                },
            },
            take: 6,
        });
    }
};
exports.CompendioService = CompendioService;
exports.CompendioService = CompendioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompendioService);
//# sourceMappingURL=compendio.service.js.map