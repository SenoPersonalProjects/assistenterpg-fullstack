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
exports.HabilidadesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const regras_poderes_1 = require("../personagem-base/regras-criacao/regras-poderes");
const habilidade_exception_1 = require("../common/exceptions/habilidade.exception");
let HabilidadesService = class HabilidadesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPoderesGenericos() {
        return (0, regras_poderes_1.buscarPoderesGenericosDisponiveis)(this.prisma);
    }
    async create(createDto) {
        const existente = await this.prisma.habilidade.findUnique({
            where: { nome: createDto.nome },
        });
        if (existente) {
            throw new habilidade_exception_1.HabilidadeNomeDuplicadoException(createDto.nome);
        }
        if (createDto.efeitosGrau?.length) {
            const tiposGrau = await this.prisma.tipoGrau.findMany({
                where: { codigo: { in: createDto.efeitosGrau.map((e) => e.tipoGrauCodigo) } },
                select: { codigo: true },
            });
            const codigosExistentes = tiposGrau.map((t) => t.codigo);
            const codigosInvalidos = createDto.efeitosGrau
                .map((e) => e.tipoGrauCodigo)
                .filter((c) => !codigosExistentes.includes(c));
            if (codigosInvalidos.length > 0) {
                throw new habilidade_exception_1.TipoGrauNaoEncontradoException(codigosInvalidos);
            }
        }
        const habilidade = await this.prisma.habilidade.create({
            data: {
                nome: createDto.nome,
                descricao: createDto.descricao,
                tipo: createDto.tipo,
                origem: createDto.origem,
                requisitos: createDto.requisitos,
                mecanicasEspeciais: createDto.mecanicasEspeciais,
                ...(createDto.efeitosGrau?.length && {
                    efeitosGrau: {
                        create: createDto.efeitosGrau.map((efeito) => ({
                            tipoGrauCodigo: efeito.tipoGrauCodigo,
                            valor: efeito.valor ?? 1,
                            escalonamentoPorNivel: efeito.escalonamentoPorNivel,
                        })),
                    },
                }),
            },
            include: {
                efeitosGrau: {
                    include: {
                        tipoGrau: { select: { codigo: true, nome: true } },
                    },
                },
            },
        });
        return habilidade;
    }
    async findAll(filtros) {
        const { tipo, origem, busca, pagina = 1, limite = 20 } = filtros;
        const where = {};
        if (tipo)
            where.tipo = tipo;
        if (origem)
            where.origem = origem;
        if (busca) {
            where.OR = [{ nome: { contains: busca } }, { descricao: { contains: busca } }];
        }
        const [total, dados] = await Promise.all([
            this.prisma.habilidade.count({ where }),
            this.prisma.habilidade.findMany({
                where,
                include: {
                    efeitosGrau: {
                        include: {
                            tipoGrau: { select: { codigo: true, nome: true } },
                        },
                    },
                    _count: {
                        select: {
                            personagensBase: true,
                            personagensCampanha: true,
                            habilidadesClasse: true,
                            habilidadesTrilha: true,
                            habilidadesOrigem: true,
                        },
                    },
                },
                skip: (pagina - 1) * limite,
                take: limite,
                orderBy: { nome: 'asc' },
            }),
        ]);
        return {
            dados,
            paginacao: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(total / limite),
            },
        };
    }
    async findOne(id) {
        const habilidade = await this.prisma.habilidade.findUnique({
            where: { id },
            include: {
                efeitosGrau: {
                    include: {
                        tipoGrau: { select: { codigo: true, nome: true, descricao: true } },
                    },
                    orderBy: { tipoGrauCodigo: 'asc' },
                },
                habilidadesClasse: {
                    include: {
                        classe: { select: { id: true, nome: true } },
                    },
                    orderBy: { nivelConcedido: 'asc' },
                },
                habilidadesTrilha: {
                    include: {
                        trilha: { select: { id: true, nome: true } },
                        caminho: { select: { id: true, nome: true } },
                    },
                    orderBy: { nivelConcedido: 'asc' },
                },
                habilidadesOrigem: {
                    include: {
                        origem: { select: { id: true, nome: true } },
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
        if (!habilidade) {
            throw new habilidade_exception_1.HabilidadeNaoEncontradaException(id);
        }
        return habilidade;
    }
    async update(id, updateDto) {
        await this.findOne(id);
        if (updateDto.nome) {
            const duplicado = await this.prisma.habilidade.findFirst({
                where: {
                    nome: updateDto.nome,
                    NOT: { id },
                },
            });
            if (duplicado) {
                throw new habilidade_exception_1.HabilidadeNomeDuplicadoException(updateDto.nome);
            }
        }
        if (updateDto.efeitosGrau?.length) {
            const tiposGrau = await this.prisma.tipoGrau.findMany({
                where: { codigo: { in: updateDto.efeitosGrau.map((e) => e.tipoGrauCodigo) } },
                select: { codigo: true },
            });
            const codigosExistentes = tiposGrau.map((t) => t.codigo);
            const codigosInvalidos = updateDto.efeitosGrau
                .map((e) => e.tipoGrauCodigo)
                .filter((c) => !codigosExistentes.includes(c));
            if (codigosInvalidos.length > 0) {
                throw new habilidade_exception_1.TipoGrauNaoEncontradoException(codigosInvalidos);
            }
        }
        const habilidade = await this.prisma.habilidade.update({
            where: { id },
            data: {
                ...(updateDto.nome && { nome: updateDto.nome }),
                ...(updateDto.descricao !== undefined && { descricao: updateDto.descricao }),
                ...(updateDto.tipo && { tipo: updateDto.tipo }),
                ...(updateDto.origem !== undefined && { origem: updateDto.origem }),
                ...(updateDto.requisitos !== undefined && { requisitos: updateDto.requisitos }),
                ...(updateDto.mecanicasEspeciais !== undefined && {
                    mecanicasEspeciais: updateDto.mecanicasEspeciais,
                }),
                ...(updateDto.efeitosGrau !== undefined && {
                    efeitosGrau: {
                        deleteMany: {},
                        ...(updateDto.efeitosGrau.length > 0 && {
                            create: updateDto.efeitosGrau.map((efeito) => ({
                                tipoGrauCodigo: efeito.tipoGrauCodigo,
                                valor: efeito.valor ?? 1,
                                escalonamentoPorNivel: efeito.escalonamentoPorNivel,
                            })),
                        }),
                    },
                }),
            },
            include: {
                efeitosGrau: {
                    include: {
                        tipoGrau: { select: { codigo: true, nome: true } },
                    },
                },
            },
        });
        return habilidade;
    }
    async remove(id) {
        await this.findOne(id);
        const [usadaEmPersonagensBase, usadaEmPersonagensCampanha, usadaEmClasses, usadaEmTrilhas, usadaEmOrigens,] = await Promise.all([
            this.prisma.habilidadePersonagemBase.count({ where: { habilidadeId: id } }),
            this.prisma.habilidadePersonagemCampanha.count({ where: { habilidadeId: id } }),
            this.prisma.habilidadeClasse.count({ where: { habilidadeId: id } }),
            this.prisma.habilidadeTrilha.count({ where: { habilidadeId: id } }),
            this.prisma.habilidadeOrigem.count({ where: { habilidadeId: id } }),
        ]);
        const totalUsos = usadaEmPersonagensBase +
            usadaEmPersonagensCampanha +
            usadaEmClasses +
            usadaEmTrilhas +
            usadaEmOrigens;
        if (totalUsos > 0) {
            throw new habilidade_exception_1.HabilidadeEmUsoException(id, totalUsos, {
                personagensBase: usadaEmPersonagensBase,
                personagensCampanha: usadaEmPersonagensCampanha,
                classes: usadaEmClasses,
                trilhas: usadaEmTrilhas,
                origens: usadaEmOrigens,
            });
        }
        await this.prisma.habilidade.delete({
            where: { id },
        });
        return { message: 'Habilidade removida com sucesso' };
    }
};
exports.HabilidadesService = HabilidadesService;
exports.HabilidadesService = HabilidadesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HabilidadesService);
//# sourceMappingURL=habilidades.service.js.map