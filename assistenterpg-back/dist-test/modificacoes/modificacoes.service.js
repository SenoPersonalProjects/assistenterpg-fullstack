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
const modificacao_exception_1 = require("src/common/exceptions/modificacao.exception");
const database_exception_1 = require("src/common/exceptions/database.exception");
const equipamentoCompativelSelect = client_1.Prisma.validator()({
    id: true,
    codigo: true,
    nome: true,
    tipo: true,
});
const equipamentoRestricoesSelect = client_1.Prisma.validator()({
    id: true,
    tipo: true,
    categoria: true,
    complexidadeMaldicao: true,
    proficienciaProtecao: true,
    tipoProtecao: true,
    tipoArma: true,
    proficienciaArma: true,
    alcance: true,
});
const modificacaoComEquipamentosInclude = client_1.Prisma.validator()({
    equipamentosApplicaveis: {
        include: {
            equipamento: {
                select: equipamentoCompativelSelect,
            },
        },
    },
});
const modificacaoDetalhadaInclude = client_1.Prisma.validator()({
    suplemento: {
        select: {
            id: true,
            codigo: true,
            nome: true,
        },
    },
    equipamentosApplicaveis: {
        include: {
            equipamento: {
                select: equipamentoCompativelSelect,
            },
        },
    },
    _count: {
        select: {
            itensBase: true,
            itensCampanha: true,
        },
    },
});
const complexidadeHierarquia = {
    NENHUMA: 0,
    SIMPLES: 1,
    COMPLEXA: 2,
};
let ModificacoesService = class ModificacoesService {
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
    normalizarJsonParaPersistir(value) {
        if (value === undefined) {
            return undefined;
        }
        if (value === null) {
            return client_1.Prisma.JsonNull;
        }
        return value;
    }
    async validarFonteSuplemento(fonte, suplementoId) {
        if (suplementoId) {
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { id: suplementoId },
                select: { id: true },
            });
            if (!suplemento) {
                throw new modificacao_exception_1.ModificacaoSuplementoNaoEncontradoException(suplementoId);
            }
            if (fonte !== client_1.TipoFonte.SUPLEMENTO) {
                throw new modificacao_exception_1.ModificacaoFonteInvalidaException();
            }
            return;
        }
        if (fonte === client_1.TipoFonte.SUPLEMENTO) {
            throw new modificacao_exception_1.ModificacaoFonteInvalidaException();
        }
    }
    parseRestricoes(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        return value;
    }
    categoriaParaNumero(categoria) {
        switch (categoria) {
            case client_1.CategoriaEquipamento.CATEGORIA_0:
                return 0;
            case client_1.CategoriaEquipamento.CATEGORIA_1:
                return 1;
            case client_1.CategoriaEquipamento.CATEGORIA_2:
                return 2;
            case client_1.CategoriaEquipamento.CATEGORIA_3:
                return 3;
            case client_1.CategoriaEquipamento.CATEGORIA_4:
                return 4;
            case client_1.CategoriaEquipamento.ESPECIAL:
                return 0;
            default:
                return 0;
        }
    }
    async create(createDto) {
        try {
            const existenteCodigo = await this.prisma.modificacaoEquipamento.findUnique({
                where: { codigo: createDto.codigo },
            });
            if (existenteCodigo) {
                throw new modificacao_exception_1.ModificacaoCodigoDuplicadoException(createDto.codigo);
            }
            const suplementoIdFinal = createDto.suplementoId ?? null;
            const fonteFinal = createDto.fonte ??
                (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : client_1.TipoFonte.SISTEMA_BASE);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            if (createDto.equipamentosCompatíveisIds?.length) {
                const equipamentosExistentes = await this.prisma.equipamentoCatalogo.findMany({
                    where: { id: { in: createDto.equipamentosCompatíveisIds } },
                    select: { id: true },
                });
                if (equipamentosExistentes.length !==
                    createDto.equipamentosCompatíveisIds.length) {
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
                    restricoes: this.normalizarJsonParaPersistir(createDto.restricoes),
                    efeitosMecanicos: this.normalizarJsonParaPersistir(createDto.efeitosMecanicos),
                    fonte: fonteFinal,
                    suplementoId: suplementoIdFinal,
                    ...(createDto.equipamentosCompatíveisIds?.length && {
                        equipamentosApplicaveis: {
                            create: createDto.equipamentosCompatíveisIds.map((equipamentoId) => ({
                                equipamentoId,
                            })),
                        },
                    }),
                },
                include: modificacaoComEquipamentosInclude,
            });
            return this.mapDetalhado(modificacao);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async update(id, updateDto) {
        try {
            const modificacaoAtual = await this.prisma.modificacaoEquipamento.findUnique({
                where: { id },
                select: {
                    id: true,
                    fonte: true,
                    suplementoId: true,
                },
            });
            if (!modificacaoAtual) {
                throw new modificacao_exception_1.ModificacaoNaoEncontradaException(id);
            }
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
            const suplementoIdFinal = updateDto.suplementoId !== undefined
                ? updateDto.suplementoId
                : modificacaoAtual.suplementoId;
            const fonteFinal = updateDto.fonte ??
                (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : modificacaoAtual.fonte);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            if (updateDto.equipamentosCompatíveisIds?.length) {
                const equipamentosExistentes = await this.prisma.equipamentoCatalogo.findMany({
                    where: { id: { in: updateDto.equipamentosCompatíveisIds } },
                    select: { id: true },
                });
                if (equipamentosExistentes.length !==
                    updateDto.equipamentosCompatíveisIds.length) {
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
                        restricoes: this.normalizarJsonParaPersistir(updateDto.restricoes),
                    }),
                    ...(updateDto.efeitosMecanicos !== undefined && {
                        efeitosMecanicos: this.normalizarJsonParaPersistir(updateDto.efeitosMecanicos),
                    }),
                    ...(fonteFinal !== modificacaoAtual.fonte && { fonte: fonteFinal }),
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
                include: modificacaoComEquipamentosInclude,
            });
            return this.mapDetalhado(modificacao);
        }
        catch (error) {
            this.tratarErroPrisma(error);
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
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async listar(filtros) {
        try {
            const { tipo, fontes, suplementoId, busca, pagina = 1, limite = 50, } = filtros;
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
                    { nome: { contains: busca } },
                    { descricao: { contains: busca } },
                    { codigo: { contains: busca } },
                ];
            }
            const [total, modificacoes] = await Promise.all([
                this.prisma.modificacaoEquipamento.count({ where }),
                this.prisma.modificacaoEquipamento.findMany({
                    where,
                    skip: (pagina - 1) * limite,
                    take: limite,
                    orderBy: [{ tipo: 'asc' }, { nome: 'asc' }],
                    include: modificacaoDetalhadaInclude,
                }),
            ]);
            return {
                dados: modificacoes.map((modificacao) => this.mapDetalhado(modificacao)),
                paginacao: {
                    pagina,
                    limite,
                    total,
                    totalPaginas: Math.ceil(total / limite),
                },
            };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarPorId(id) {
        try {
            const modificacao = await this.prisma.modificacaoEquipamento.findUnique({
                where: { id },
                include: modificacaoDetalhadaInclude,
            });
            if (!modificacao) {
                throw new modificacao_exception_1.ModificacaoNaoEncontradaException(id);
            }
            return this.mapDetalhado(modificacao);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarCompatíveisComEquipamento(equipamentoId) {
        try {
            const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
                where: { id: equipamentoId },
                select: equipamentoRestricoesSelect,
            });
            if (!equipamento) {
                throw new modificacao_exception_1.ModificacaoEquipamentoNaoEncontradoException(equipamentoId);
            }
            const modificacoes = await this.prisma.modificacaoEquipamento.findMany({
                where: {
                    OR: [
                        {
                            equipamentosApplicaveis: {
                                some: { equipamentoId },
                            },
                        },
                        {
                            equipamentosApplicaveis: {
                                none: {},
                            },
                        },
                    ],
                },
                include: {
                    suplemento: {
                        select: { id: true, codigo: true, nome: true },
                    },
                },
            });
            const compatíveis = [];
            for (const mod of modificacoes) {
                const validacao = this.validarRestricoes(equipamento, mod);
                if (validacao.valido) {
                    compatíveis.push(this.mapDetalhado(mod));
                }
            }
            return compatíveis;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    validarRestricoes(equipamento, modificacao) {
        const erros = [];
        const restricoes = this.parseRestricoes(modificacao.restricoes);
        if (!restricoes) {
            return { valido: true, erros: [] };
        }
        if (restricoes.tiposEquipamento?.length) {
            if (!restricoes.tiposEquipamento.includes(equipamento.tipo)) {
                erros.push(`Modificação só aplicável a: ${restricoes.tiposEquipamento.join(', ')}`);
            }
        }
        if (restricoes.excluiEscudos &&
            equipamento.proficienciaProtecao === client_1.ProficienciaProtecao.ESCUDO) {
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
            const minima = complexidadeHierarquia[restricoes.complexidadeMinima];
            const atual = complexidadeHierarquia[equipamento.complexidadeMaldicao];
            if (atual < minima) {
                erros.push(`Requer complexidade mínima: ${restricoes.complexidadeMinima}`);
            }
        }
        if (restricoes.categoriaMinima !== undefined) {
            const categoriaEquipamento = this.categoriaParaNumero(equipamento.categoria);
            if (categoriaEquipamento > restricoes.categoriaMinima) {
                erros.push(`Requer categoria mínima: ${restricoes.categoriaMinima}`);
            }
        }
        if (restricoes.categoriaMaxima !== undefined) {
            const categoriaEquipamento = this.categoriaParaNumero(equipamento.categoria);
            if (categoriaEquipamento < restricoes.categoriaMaxima) {
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
    validarConflitosModificacoes(modificacaoNova, modificacoesExistentes) {
        const erros = [];
        const restricoes = this.parseRestricoes(modificacaoNova.restricoes);
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
        const restricoes = this.parseRestricoes(modificacao.restricoes);
        return {
            id: modificacao.id,
            codigo: modificacao.codigo,
            nome: modificacao.nome,
            descricao: modificacao.descricao,
            tipo: modificacao.tipo,
            incrementoEspacos: modificacao.incrementoEspacos,
            restricoes,
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