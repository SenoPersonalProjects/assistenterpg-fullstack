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
exports.TecnicasAmaldicoadasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const tecnica_amaldicoada_exception_1 = require("../common/exceptions/tecnica-amaldicoada.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
let TecnicasAmaldicoadasService = class TecnicasAmaldicoadasService {
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
                throw new tecnica_amaldicoada_exception_1.TecnicaSuplementoNaoEncontradoException(suplementoId);
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
    async findAllTecnicas(filtros) {
        try {
            const where = {};
            if (filtros.nome) {
                where.nome = { contains: filtros.nome };
            }
            if (filtros.codigo) {
                where.codigo = filtros.codigo;
            }
            if (filtros.tipo) {
                where.tipo = filtros.tipo;
            }
            if (filtros.hereditaria !== undefined) {
                where.hereditaria = filtros.hereditaria;
            }
            if (filtros.fonte) {
                where.fonte = filtros.fonte;
            }
            if (filtros.suplementoId) {
                where.suplementoId = filtros.suplementoId;
            }
            if (filtros.claId || filtros.claNome) {
                where.clas = {
                    some: filtros.claId
                        ? { claId: filtros.claId }
                        : { cla: { nome: filtros.claNome } },
                };
            }
            const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
                where,
                include: {
                    clas: filtros.incluirClas !== false
                        ? {
                            include: {
                                cla: {
                                    select: {
                                        id: true,
                                        nome: true,
                                        grandeCla: true,
                                    },
                                },
                            },
                        }
                        : false,
                    habilidades: filtros.incluirHabilidades
                        ? {
                            include: {
                                variacoes: {
                                    orderBy: { ordem: 'asc' },
                                },
                            },
                            orderBy: { ordem: 'asc' },
                        }
                        : false,
                    suplemento: true,
                },
                orderBy: { nome: 'asc' },
            });
            return tecnicas.map((t) => this.mapTecnicaToDto(t));
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findOneTecnica(id) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id },
                include: {
                    clas: {
                        include: {
                            cla: {
                                select: {
                                    id: true,
                                    nome: true,
                                    grandeCla: true,
                                },
                            },
                        },
                    },
                    habilidades: {
                        include: {
                            variacoes: {
                                orderBy: { ordem: 'asc' },
                            },
                        },
                        orderBy: { ordem: 'asc' },
                    },
                    suplemento: true,
                },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(id);
            }
            return this.mapTecnicaToDto(tecnica);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findTecnicaByCodigo(codigo) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { codigo },
                include: {
                    clas: {
                        include: {
                            cla: {
                                select: {
                                    id: true,
                                    nome: true,
                                    grandeCla: true,
                                },
                            },
                        },
                    },
                    habilidades: {
                        include: {
                            variacoes: {
                                orderBy: { ordem: 'asc' },
                            },
                        },
                        orderBy: { ordem: 'asc' },
                    },
                    suplemento: true,
                },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(codigo);
            }
            return this.mapTecnicaToDto(tecnica);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async createTecnica(dto) {
        try {
            const existe = await this.prisma.tecnicaAmaldicoada.findFirst({
                where: {
                    OR: [{ codigo: dto.codigo }, { nome: dto.nome }],
                },
            });
            if (existe) {
                throw new tecnica_amaldicoada_exception_1.TecnicaCodigoOuNomeDuplicadoException(dto.codigo, dto.nome);
            }
            if (dto.hereditaria && dto.tipo !== client_1.TipoTecnicaAmaldicoada.INATA) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoInataHereditariaException(dto.tipo);
            }
            if (dto.hereditaria &&
                (!dto.clasHereditarios || dto.clasHereditarios.length === 0)) {
                throw new tecnica_amaldicoada_exception_1.TecnicaHereditariaSemClaException();
            }
            const suplementoIdFinal = dto.suplementoId ?? null;
            const fonteFinal = dto.fonte ??
                (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : client_1.TipoFonte.SISTEMA_BASE);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            const tecnica = await this.prisma.tecnicaAmaldicoada.create({
                data: {
                    codigo: dto.codigo,
                    nome: dto.nome,
                    descricao: dto.descricao,
                    tipo: dto.tipo,
                    hereditaria: dto.hereditaria ?? false,
                    linkExterno: dto.linkExterno ?? null,
                    fonte: fonteFinal,
                    suplementoId: suplementoIdFinal,
                    requisitos: dto.requisitos ?? null,
                },
            });
            if (dto.hereditaria &&
                dto.clasHereditarios &&
                dto.clasHereditarios.length > 0) {
                await this.vincularClas(tecnica.id, dto.clasHereditarios);
            }
            return this.findOneTecnica(tecnica.id);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async updateTecnica(id, dto) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(id);
            }
            const tipoFinal = dto.tipo ?? tecnica.tipo;
            const hereditariaFinal = dto.hereditaria ?? tecnica.hereditaria;
            if (hereditariaFinal && tipoFinal === client_1.TipoTecnicaAmaldicoada.NAO_INATA) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoInataHereditariaException(tipoFinal);
            }
            const suplementoIdFinal = dto.suplementoId !== undefined
                ? dto.suplementoId
                : tecnica.suplementoId;
            const fonteFinal = dto.fonte ?? (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : tecnica.fonte);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            const shouldUpdateClas = dto.clasHereditarios !== undefined;
            if (shouldUpdateClas) {
                if (hereditariaFinal &&
                    (!dto.clasHereditarios || dto.clasHereditarios.length === 0)) {
                    throw new tecnica_amaldicoada_exception_1.TecnicaHereditariaSemClaException(id);
                }
                await this.prisma.tecnicaCla.deleteMany({ where: { tecnicaId: id } });
                if (hereditariaFinal &&
                    dto.clasHereditarios &&
                    dto.clasHereditarios.length > 0) {
                    await this.vincularClas(id, dto.clasHereditarios);
                }
            }
            await this.prisma.tecnicaAmaldicoada.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    tipo: dto.tipo,
                    hereditaria: dto.hereditaria,
                    linkExterno: dto.linkExterno,
                    fonte: fonteFinal,
                    ...(dto.suplementoId !== undefined && {
                        suplementoId: dto.suplementoId,
                    }),
                    requisitos: dto.requisitos,
                },
            });
            return this.findOneTecnica(id);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async removeTecnica(id) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            personagensBaseComInata: true,
                            personagensCampanhaComInata: true,
                            personagensBaseAprendeu: true,
                            personagensCampanhaAprendeu: true,
                        },
                    },
                },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(id);
            }
            const detalhesUso = {
                personagensBaseComInata: tecnica._count.personagensBaseComInata,
                personagensCampanhaComInata: tecnica._count.personagensCampanhaComInata,
                personagensBaseAprendeu: tecnica._count.personagensBaseAprendeu,
                personagensCampanhaAprendeu: tecnica._count.personagensCampanhaAprendeu,
            };
            const totalUso = Object.values(detalhesUso).reduce((acc, val) => acc + val, 0);
            if (totalUso > 0) {
                throw new tecnica_amaldicoada_exception_1.TecnicaEmUsoException(id, totalUso, detalhesUso);
            }
            await this.prisma.tecnicaAmaldicoada.delete({ where: { id } });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findTecnicasByCla(claId) {
        try {
            const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
                where: {
                    hereditaria: true,
                    clas: {
                        some: { claId },
                    },
                },
                include: {
                    clas: {
                        include: {
                            cla: {
                                select: {
                                    id: true,
                                    nome: true,
                                    grandeCla: true,
                                },
                            },
                        },
                    },
                    habilidades: {
                        include: {
                            variacoes: {
                                orderBy: { ordem: 'asc' },
                            },
                        },
                        orderBy: { ordem: 'asc' },
                    },
                    suplemento: true,
                },
                orderBy: { nome: 'asc' },
            });
            return tecnicas.map((t) => this.mapTecnicaToDto(t));
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findAllHabilidades(tecnicaId) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id: tecnicaId },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(tecnicaId);
            }
            return this.prisma.habilidadeTecnica.findMany({
                where: { tecnicaId },
                include: {
                    variacoes: {
                        orderBy: { ordem: 'asc' },
                    },
                },
                orderBy: { ordem: 'asc' },
            });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findOneHabilidade(id) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id },
                include: {
                    tecnica: {
                        select: {
                            id: true,
                            codigo: true,
                            nome: true,
                        },
                    },
                    variacoes: {
                        orderBy: { ordem: 'asc' },
                    },
                },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(id);
            }
            return habilidade;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async createHabilidade(dto) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id: dto.tecnicaId },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(dto.tecnicaId);
            }
            const existe = await this.prisma.habilidadeTecnica.findUnique({
                where: { codigo: dto.codigo },
            });
            if (existe) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeCodigoDuplicadoException(dto.codigo);
            }
            return this.prisma.habilidadeTecnica.create({
                data: {
                    tecnicaId: dto.tecnicaId,
                    codigo: dto.codigo,
                    nome: dto.nome,
                    descricao: dto.descricao,
                    requisitos: dto.requisitos ?? null,
                    execucao: dto.execucao,
                    area: dto.area ?? null,
                    alcance: dto.alcance ?? null,
                    alvo: dto.alvo ?? null,
                    duracao: dto.duracao ?? null,
                    resistencia: dto.resistencia ?? null,
                    dtResistencia: dto.dtResistencia ?? null,
                    custoPE: dto.custoPE ?? 0,
                    custoEA: dto.custoEA ?? 0,
                    testesExigidos: dto.testesExigidos ?? null,
                    criticoValor: dto.criticoValor ?? null,
                    criticoMultiplicador: dto.criticoMultiplicador ?? null,
                    danoFlat: dto.danoFlat ?? null,
                    danoFlatTipo: dto.danoFlatTipo ?? null,
                    dadosDano: dto.dadosDano ?? null,
                    escalonaPorGrau: dto.escalonaPorGrau ?? false,
                    grauTipoGrauCodigo: dto.grauTipoGrauCodigo ?? null,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA ?? 0,
                    escalonamentoDano: dto.escalonamentoDano ?? null,
                    efeito: dto.efeito,
                    ordem: dto.ordem ?? 0,
                },
                include: {
                    variacoes: true,
                },
            });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async updateHabilidade(id, dto) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(id);
            }
            return this.prisma.habilidadeTecnica.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    requisitos: dto.requisitos,
                    execucao: dto.execucao,
                    area: dto.area,
                    alcance: dto.alcance,
                    alvo: dto.alvo,
                    duracao: dto.duracao,
                    resistencia: dto.resistencia,
                    dtResistencia: dto.dtResistencia,
                    custoPE: dto.custoPE,
                    custoEA: dto.custoEA,
                    testesExigidos: dto.testesExigidos,
                    criticoValor: dto.criticoValor,
                    criticoMultiplicador: dto.criticoMultiplicador,
                    danoFlat: dto.danoFlat,
                    danoFlatTipo: dto.danoFlatTipo,
                    dadosDano: dto.dadosDano,
                    escalonaPorGrau: dto.escalonaPorGrau,
                    grauTipoGrauCodigo: dto.grauTipoGrauCodigo,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA,
                    escalonamentoDano: dto.escalonamentoDano,
                    efeito: dto.efeito,
                    ordem: dto.ordem,
                },
                include: {
                    variacoes: true,
                },
            });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async removeHabilidade(id) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(id);
            }
            await this.prisma.habilidadeTecnica.delete({ where: { id } });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findAllVariacoes(habilidadeTecnicaId) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id: habilidadeTecnicaId },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(habilidadeTecnicaId);
            }
            return this.prisma.variacaoHabilidade.findMany({
                where: { habilidadeTecnicaId },
                orderBy: { ordem: 'asc' },
            });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async findOneVariacao(id) {
        try {
            const variacao = await this.prisma.variacaoHabilidade.findUnique({
                where: { id },
                include: {
                    habilidadeTecnica: {
                        select: {
                            id: true,
                            codigo: true,
                            nome: true,
                            tecnica: {
                                select: {
                                    id: true,
                                    codigo: true,
                                    nome: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!variacao) {
                throw new tecnica_amaldicoada_exception_1.VariacaoHabilidadeNaoEncontradaException(id);
            }
            return variacao;
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async createVariacao(dto) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id: dto.habilidadeTecnicaId },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(dto.habilidadeTecnicaId);
            }
            return this.prisma.variacaoHabilidade.create({
                data: {
                    habilidadeTecnicaId: dto.habilidadeTecnicaId,
                    nome: dto.nome,
                    descricao: dto.descricao,
                    substituiCustos: dto.substituiCustos ?? false,
                    custoPE: dto.custoPE ?? null,
                    custoEA: dto.custoEA ?? null,
                    execucao: dto.execucao ?? null,
                    area: dto.area ?? null,
                    alcance: dto.alcance ?? null,
                    alvo: dto.alvo ?? null,
                    duracao: dto.duracao ?? null,
                    resistencia: dto.resistencia ?? null,
                    dtResistencia: dto.dtResistencia ?? null,
                    criticoValor: dto.criticoValor ?? null,
                    criticoMultiplicador: dto.criticoMultiplicador ?? null,
                    danoFlat: dto.danoFlat ?? null,
                    danoFlatTipo: dto.danoFlatTipo ?? null,
                    dadosDano: dto.dadosDano ?? null,
                    escalonaPorGrau: dto.escalonaPorGrau ?? null,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA ?? null,
                    escalonamentoDano: dto.escalonamentoDano ?? null,
                    efeitoAdicional: dto.efeitoAdicional ?? null,
                    requisitos: dto.requisitos ?? null,
                    ordem: dto.ordem ?? 0,
                },
            });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async updateVariacao(id, dto) {
        try {
            const variacao = await this.prisma.variacaoHabilidade.findUnique({
                where: { id },
            });
            if (!variacao) {
                throw new tecnica_amaldicoada_exception_1.VariacaoHabilidadeNaoEncontradaException(id);
            }
            return this.prisma.variacaoHabilidade.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    substituiCustos: dto.substituiCustos,
                    custoPE: dto.custoPE,
                    custoEA: dto.custoEA,
                    execucao: dto.execucao,
                    area: dto.area,
                    alcance: dto.alcance,
                    alvo: dto.alvo,
                    duracao: dto.duracao,
                    resistencia: dto.resistencia,
                    dtResistencia: dto.dtResistencia,
                    criticoValor: dto.criticoValor,
                    criticoMultiplicador: dto.criticoMultiplicador,
                    danoFlat: dto.danoFlat,
                    danoFlatTipo: dto.danoFlatTipo,
                    dadosDano: dto.dadosDano,
                    escalonaPorGrau: dto.escalonaPorGrau,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA,
                    escalonamentoDano: dto.escalonamentoDano,
                    efeitoAdicional: dto.efeitoAdicional,
                    requisitos: dto.requisitos,
                    ordem: dto.ordem,
                },
            });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async removeVariacao(id) {
        try {
            const variacao = await this.prisma.variacaoHabilidade.findUnique({
                where: { id },
            });
            if (!variacao) {
                throw new tecnica_amaldicoada_exception_1.VariacaoHabilidadeNaoEncontradaException(id);
            }
            await this.prisma.variacaoHabilidade.delete({ where: { id } });
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async vincularClas(tecnicaId, claNomes) {
        for (const nome of claNomes) {
            const cla = await this.prisma.cla.findUnique({ where: { nome } });
            if (!cla) {
                throw new tecnica_amaldicoada_exception_1.TecnicaClaNaoEncontradoException(nome);
            }
            await this.prisma.tecnicaCla.create({
                data: {
                    tecnicaId,
                    claId: cla.id,
                },
            });
        }
    }
    mapTecnicaToDto(tecnica) {
        return {
            id: tecnica.id,
            codigo: tecnica.codigo,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            tipo: tecnica.tipo,
            hereditaria: tecnica.hereditaria,
            linkExterno: tecnica.linkExterno,
            fonte: tecnica.fonte,
            suplementoId: tecnica.suplementoId,
            requisitos: tecnica.requisitos,
            clasHereditarios: tecnica.clas?.map((tc) => tc.cla) ?? [],
            habilidades: tecnica.habilidades ?? [],
            criadoEm: tecnica.criadoEm,
            atualizadoEm: tecnica.atualizadoEm,
        };
    }
};
exports.TecnicasAmaldicoadasService = TecnicasAmaldicoadasService;
exports.TecnicasAmaldicoadasService = TecnicasAmaldicoadasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TecnicasAmaldicoadasService);
//# sourceMappingURL=tecnicas-amaldicoadas.service.js.map