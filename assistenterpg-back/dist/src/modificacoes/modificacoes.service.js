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
exports.ModificacoesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const modificacao_exception_1 = require("../common/exceptions/modificacao.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
let ModificacoesService = class ModificacoesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto) {
        try {
            const existenteCodigo = await this.prisma.modificacaoEquipamento.findUnique({
                where: { codigo: createDto.codigo },
            });
            if (existenteCodigo) {
                throw new modificacao_exception_1.ModificacaoCodigoDuplicadoException(createDto.codigo);
            }
            if (createDto.suplementoId) {
                const suplemento = await this.prisma.suplemento.findUnique({
                    where: { id: createDto.suplementoId },
                });
                if (!suplemento) {
                    throw new modificacao_exception_1.ModificacaoSuplementoNaoEncontradoException(createDto.suplementoId);
                }
                if (createDto.fonte && createDto.fonte !== client_1.TipoFonte.SUPLEMENTO) {
                    throw new modificacao_exception_1.ModificacaoFonteInvalidaException();
                }
            }
            if (createDto.equipamentosCompatíveisIds?.length) {
                const equipamentosExistentes = await this.prisma.equipamentoCatalogo.findMany({
                    where: { id: { in: createDto.equipamentosCompatíveisIds } },
                    select: { id: true },
                });
                if (equipamentosExistentes.length !== createDto.equipamentosCompatíveisIds.length) {
                    const idsEncontrados = equipamentosExistentes.map((e) => e.id);
                    const idsInvalidos = createDto.equipamentosCompatíveisIds.filter((id) => !idsEncontrados.includes(id));
                    throw new modificacao_exception_1.ModificacaoEquipamentosInvalidosException(idsInvalidos);
                }
            }
            const modificacao = await this.prisma.modificacaoEquipamento.create({
                data: {
                    codigo: createDto.codigo,
                    nome: createDto.nome,
                    descricao: createDto.descricao,
                    tipo: createDto.tipo,
                    incrementoEspacos: createDto.incrementoEspacos,
                    restricoes: createDto.restricoes,
                    efeitosMecanicos: createDto.efeitosMecanicos,
                    fonte: createDto.fonte ?? client_1.TipoFonte.SISTEMA_BASE,
                    suplementoId: createDto.suplementoId,
                    ...(createDto.equipamentosCompatíveisIds?.length && {
                        equipamentosApplicaveis: {
                            create: createDto.equipamentosCompatíveisIds.map((equipamentoId) => ({
                                equipamentoId,
                            })),
                        },
                    }),
                },
                include: {
                    equipamentosApplicaveis: {
                        include: {
                            equipamento: {
                                select: { id: true, codigo: true, nome: true, tipo: true },
                            },
                        },
                    },
                },
            });
            return this.mapDetalhado(modificacao);
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
            await this.buscarPorId(id);
            if (updateDto.codigo) {
                const duplicado = await this.prisma.modificacaoEquipamento.findFirst({
                    where: {
                        codigo: updateDto.codigo,
                        NOT: { id },
                    },
                });
                if (duplicado) {
                    throw new modificacao_exception_1.ModificacaoCodigoDuplicadoException(updateDto.codigo);
                }
            }
            if (updateDto.suplementoId) {
                const suplemento = await this.prisma.suplemento.findUnique({
                    where: { id: updateDto.suplementoId },
                });
                if (!suplemento) {
                    throw new modificacao_exception_1.ModificacaoSuplementoNaoEncontradoException(updateDto.suplementoId);
                }
            }
            if (updateDto.equipamentosCompatíveisIds?.length) {
                const equipamentosExistentes = await this.prisma.equipamentoCatalogo.findMany({
                    where: { id: { in: updateDto.equipamentosCompatíveisIds } },
                    select: { id: true },
                });
                if (equipamentosExistentes.length !== updateDto.equipamentosCompatíveisIds.length) {
                    const idsEncontrados = equipamentosExistentes.map((e) => e.id);
                    const idsInvalidos = updateDto.equipamentosCompatíveisIds.filter((id) => !idsEncontrados.includes(id));
                    throw new modificacao_exception_1.ModificacaoEquipamentosInvalidosException(idsInvalidos);
                }
            }
            const modificacao = await this.prisma.modificacaoEquipamento.update({
                where: { id },
                data: {
                    ...(updateDto.codigo && { codigo: updateDto.codigo }),
                    ...(updateDto.nome && { nome: updateDto.nome }),
                    ...(updateDto.descricao !== undefined && {
                        descricao: updateDto.descricao,
                    }),
                    ...(updateDto.tipo && { tipo: updateDto.tipo }),
                    ...(updateDto.incrementoEspacos !== undefined && {
                        incrementoEspacos: updateDto.incrementoEspacos,
                    }),
                    ...(updateDto.restricoes !== undefined && {
                        restricoes: updateDto.restricoes,
                    }),
                    ...(updateDto.efeitosMecanicos !== undefined && {
                        efeitosMecanicos: updateDto.efeitosMecanicos,
                    }),
                    ...(updateDto.fonte && { fonte: updateDto.fonte }),
                    ...(updateDto.suplementoId !== undefined && {
                        suplementoId: updateDto.suplementoId,
                    }),
                    ...(updateDto.equipamentosCompatíveisIds !== undefined && {
                        equipamentosApplicaveis: {
                            deleteMany: {},
                            ...(updateDto.equipamentosCompatíveisIds.length > 0 && {
                                create: updateDto.equipamentosCompatíveisIds.map((equipamentoId) => ({
                                    equipamentoId,
                                })),
                            }),
                        },
                    }),
                },
                include: {
                    equipamentosApplicaveis: {
                        include: {
                            equipamento: {
                                select: { id: true, codigo: true, nome: true, tipo: true },
                            },
                        },
                    },
                },
            });
            return this.mapDetalhado(modificacao);
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
            await this.buscarPorId(id);
            const [usadaEmItensBase, usadaEmItensCampanha] = await Promise.all([
                this.prisma.inventarioItemBaseModificacao.count({
                    where: { modificacaoId: id },
                }),
                this.prisma.inventarioItemCampanhaModificacao.count({
                    where: { modificacaoId: id },
                }),
            ]);
            const totalUsos = usadaEmItensBase + usadaEmItensCampanha;
            if (totalUsos > 0) {
                throw new modificacao_exception_1.ModificacaoEmUsoException(id, totalUsos, {
                    itensBase: usadaEmItensBase,
                    itensCampanha: usadaEmItensCampanha,
                });
            }
            await this.prisma.modificacaoEquipamento.delete({
                where: { id },
            });
            return { message: 'Modificação removida com sucesso' };
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async listar(filtros) {
        try {
            const { tipo, fontes, suplementoId, busca, pagina = 1, limite = 50 } = filtros;
            const where = {};
            if (tipo)
                where.tipo = tipo;
            if (fontes?.length) {
                where.fonte = { in: fontes };
            }
            if (suplementoId)
                where.suplementoId = suplementoId;
            if (busca) {
                where.OR = [
                    { nome: { contains: busca, mode: 'insensitive' } },
                    { descricao: { contains: busca, mode: 'insensitive' } },
                    { codigo: { contains: busca, mode: 'insensitive' } },
                ];
            }
            const [total, modificacoes] = await Promise.all([
                this.prisma.modificacaoEquipamento.count({ where }),
                this.prisma.modificacaoEquipamento.findMany({
                    where,
                    skip: (pagina - 1) * limite,
                    take: limite,
                    orderBy: [{ tipo: 'asc' }, { nome: 'asc' }],
                    include: {
                        suplemento: {
                            select: { id: true, codigo: true, nome: true },
                        },
                        _count: {
                            select: {
                                equipamentosApplicaveis: true,
                                itensBase: true,
                                itensCampanha: true,
                            },
                        },
                    },
                }),
            ]);
            return {
                dados: modificacoes.map(this.mapDetalhado),
                paginacao: {
                    pagina,
                    limite,
                    total,
                    totalPaginas: Math.ceil(total / limite),
                },
            };
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async buscarPorId(id) {
        try {
            const modificacao = await this.prisma.modificacaoEquipamento.findUnique({
                where: { id },
                include: {
                    suplemento: {
                        select: { id: true, codigo: true, nome: true },
                    },
                    equipamentosApplicaveis: {
                        include: {
                            equipamento: {
                                select: { id: true, codigo: true, nome: true, tipo: true },
                            },
                        },
                    },
                    _count: {
                        select: {
                            itensBase: true,
                            itensCampanha: true,
                        },
                    },
                },
            });
            if (!modificacao) {
                throw new modificacao_exception_1.ModificacaoNaoEncontradaException(id);
            }
            return this.mapDetalhado(modificacao);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async buscarCompatíveisComEquipamento(equipamentoId) {
        try {
            const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
                where: { id: equipamentoId },
            });
            if (!equipamento) {
                throw new modificacao_exception_1.ModificacaoEquipamentoNaoEncontradoException(equipamentoId);
            }
            const modificacoes = await this.prisma.modificacaoEquipamento.findMany({
                where: {},
                include: {
                    suplemento: {
                        select: { id: true, codigo: true, nome: true },
                    },
                },
            });
            const compatíveis = [];
            for (const mod of modificacoes) {
                const validacao = await this.validarRestricoes(equipamento, mod);
                if (validacao.valido) {
                    compatíveis.push(this.mapDetalhado(mod));
                }
            }
            return compatíveis;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async validarRestricoes(equipamento, modificacao) {
        const erros = [];
        const restricoes = modificacao.restricoes;
        if (!restricoes) {
            return { valido: true, erros: [] };
        }
        if (restricoes.tiposEquipamento?.length) {
            if (!restricoes.tiposEquipamento.includes(equipamento.tipo)) {
                erros.push(`Modificação só aplicável a: ${restricoes.tiposEquipamento.join(', ')}`);
            }
        }
        if (restricoes.excluiEscudos && equipamento.proficienciaProtecao === 'ESCUDO') {
            erros.push('Modificação não aplicável a escudos');
        }
        if (restricoes.tiposProtecao?.length && equipamento.tipoProtecao) {
            if (!restricoes.tiposProtecao.includes(equipamento.tipoProtecao)) {
                erros.push(`Modificação só aplicável a proteções: ${restricoes.tiposProtecao.join(', ')}`);
            }
        }
        if (restricoes.tiposArma?.length && equipamento.tipoArma) {
            if (!restricoes.tiposArma.includes(equipamento.tipoArma)) {
                erros.push(`Modificação só aplicável a armas: ${restricoes.tiposArma.join(', ')}`);
            }
        }
        if (restricoes.apenasAmaldicoados) {
            const complexidade = equipamento.complexidadeMaldicao;
            if (complexidade === client_1.ComplexidadeMaldicao.NENHUMA || !complexidade) {
                erros.push('Modificação só aplicável a equipamentos amaldiçoados');
            }
        }
        if (restricoes.apenasMundanos) {
            const complexidade = equipamento.complexidadeMaldicao;
            if (complexidade && complexidade !== client_1.ComplexidadeMaldicao.NENHUMA) {
                erros.push('Modificação só aplicável a equipamentos não-amaldiçoados');
            }
        }
        if (restricoes.complexidadeMinima) {
            const hierarquia = {
                NENHUMA: 0,
                SIMPLES: 1,
                COMPLEXA: 2,
            };
            const minima = hierarquia[restricoes.complexidadeMinima] || 0;
            const atual = hierarquia[equipamento.complexidadeMaldicao || 'NENHUMA'] || 0;
            if (atual < minima) {
                erros.push(`Requer complexidade mínima: ${restricoes.complexidadeMinima}`);
            }
        }
        if (restricoes.categoriaMinima !== undefined) {
            if (equipamento.categoria > restricoes.categoriaMinima) {
                erros.push(`Requer categoria mínima: ${restricoes.categoriaMinima}`);
            }
        }
        if (restricoes.categoriaMaxima !== undefined) {
            if (equipamento.categoria < restricoes.categoriaMaxima) {
                erros.push(`Requer categoria máxima: ${restricoes.categoriaMaxima}`);
            }
        }
        if (restricoes.proficienciasArma?.length && equipamento.proficienciaArma) {
            if (!restricoes.proficienciasArma.includes(equipamento.proficienciaArma)) {
                erros.push(`Requer proficiência: ${restricoes.proficienciasArma.join(', ')}`);
            }
        }
        if (restricoes.alcancesPermitidos?.length && equipamento.alcance) {
            if (!restricoes.alcancesPermitidos.includes(equipamento.alcance)) {
                erros.push(`Requer alcance: ${restricoes.alcancesPermitidos.join(', ')}`);
            }
        }
        return {
            valido: erros.length === 0,
            erros,
        };
    }
    async validarConflitosModificacoes(modificacaoNova, modificacoesExistentes) {
        const erros = [];
        const restricoes = modificacaoNova.restricoes;
        if (!restricoes) {
            return { valido: true, erros: [] };
        }
        if (restricoes.codigosIncompativeis?.length) {
            const codigosExistentes = modificacoesExistentes.map((m) => m.codigo);
            for (const codigoIncompativel of restricoes.codigosIncompativeis) {
                if (codigosExistentes.includes(codigoIncompativel)) {
                    const incompativel = modificacoesExistentes.find((m) => m.codigo === codigoIncompativel);
                    erros.push(`Incompatível com modificação: ${incompativel?.nome || codigoIncompativel}`);
                }
            }
        }
        if (restricoes.codigosRequeridos?.length) {
            const codigosExistentes = modificacoesExistentes.map((m) => m.codigo);
            for (const codigoRequerido of restricoes.codigosRequeridos) {
                if (!codigosExistentes.includes(codigoRequerido)) {
                    erros.push(`Requer modificação: ${codigoRequerido}`);
                }
            }
        }
        if (restricoes.limiteMaximoGlobal !== undefined) {
            const quantidadeAtual = modificacoesExistentes.filter((m) => m.codigo === modificacaoNova.codigo).length;
            if (quantidadeAtual >= restricoes.limiteMaximoGlobal) {
                erros.push(`Modificação já atingiu o limite máximo de ${restricoes.limiteMaximoGlobal}`);
            }
        }
        return {
            valido: erros.length === 0,
            erros,
        };
    }
    mapDetalhado(modificacao) {
        return {
            id: modificacao.id,
            codigo: modificacao.codigo,
            nome: modificacao.nome,
            descricao: modificacao.descricao,
            tipo: modificacao.tipo,
            incrementoEspacos: modificacao.incrementoEspacos,
            restricoes: modificacao.restricoes,
            efeitosMecanicos: modificacao.efeitosMecanicos,
            fonte: modificacao.fonte,
            suplementoId: modificacao.suplementoId,
            ...(modificacao.equipamentosApplicaveis && {
                equipamentosCompatíveis: modificacao.equipamentosApplicaveis.map((ea) => ({
                    id: ea.equipamento.id,
                    codigo: ea.equipamento.codigo,
                    nome: ea.equipamento.nome,
                    tipo: ea.equipamento.tipo,
                })),
            }),
            ...(modificacao._count && {
                quantidadeUsos: {
                    itensBase: modificacao._count.itensBase || 0,
                    itensCampanha: modificacao._count.itensCampanha || 0,
                    total: (modificacao._count.itensBase || 0) +
                        (modificacao._count.itensCampanha || 0),
                },
            }),
        };
    }
};
exports.ModificacoesService = ModificacoesService;
exports.ModificacoesService = ModificacoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModificacoesService);
//# sourceMappingURL=modificacoes.service.js.map