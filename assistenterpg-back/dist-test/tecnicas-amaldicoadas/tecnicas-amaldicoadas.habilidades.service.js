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
exports.TecnicasAmaldicoadasHabilidadesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tecnica_amaldicoada_exception_1 = require("src/common/exceptions/tecnica-amaldicoada.exception");
const tecnicas_amaldicoadas_engine_1 = require("./engine/tecnicas-amaldicoadas.engine");
const tecnicas_amaldicoadas_errors_1 = require("./tecnicas-amaldicoadas.errors");
let TecnicasAmaldicoadasHabilidadesService = class TecnicasAmaldicoadasHabilidadesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
                    requisitos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.requisitos),
                    execucao: dto.execucao,
                    area: dto.area ?? null,
                    alcance: dto.alcance ?? null,
                    alvo: dto.alvo ?? null,
                    duracao: dto.duracao ?? null,
                    resistencia: dto.resistencia ?? null,
                    dtResistencia: dto.dtResistencia ?? null,
                    custoPE: dto.custoPE ?? 0,
                    custoEA: dto.custoEA ?? 0,
                    custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
                    custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
                    testesExigidos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.testesExigidos),
                    criticoValor: dto.criticoValor ?? null,
                    criticoMultiplicador: dto.criticoMultiplicador ?? null,
                    danoFlat: dto.danoFlat ?? null,
                    danoFlatTipo: dto.danoFlatTipo ?? null,
                    dadosDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau ?? false,
                    grauTipoGrauCodigo: dto.grauTipoGrauCodigo ?? null,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA ?? 0,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE ?? 0,
                    escalonamentoTipo: dto.escalonamentoTipo ?? 'OUTRO',
                    escalonamentoEfeito: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.escalonamentoEfeito),
                    escalonamentoDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.escalonamentoDano),
                    efeito: dto.efeito,
                    ordem: dto.ordem ?? 0,
                },
                include: {
                    variacoes: true,
                },
            });
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
                    requisitos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.requisitos),
                    execucao: dto.execucao,
                    area: dto.area,
                    alcance: dto.alcance,
                    alvo: dto.alvo,
                    duracao: dto.duracao,
                    resistencia: dto.resistencia,
                    dtResistencia: dto.dtResistencia,
                    custoPE: dto.custoPE,
                    custoEA: dto.custoEA,
                    custoSustentacaoEA: dto.custoSustentacaoEA,
                    custoSustentacaoPE: dto.custoSustentacaoPE,
                    testesExigidos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.testesExigidos),
                    criticoValor: dto.criticoValor,
                    criticoMultiplicador: dto.criticoMultiplicador,
                    danoFlat: dto.danoFlat,
                    danoFlatTipo: dto.danoFlatTipo,
                    dadosDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau,
                    grauTipoGrauCodigo: dto.grauTipoGrauCodigo,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE,
                    escalonamentoTipo: dto.escalonamentoTipo,
                    escalonamentoEfeito: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.escalonamentoEfeito),
                    escalonamentoDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.escalonamentoDano),
                    efeito: dto.efeito,
                    ordem: dto.ordem,
                },
                include: {
                    variacoes: true,
                },
            });
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
};
exports.TecnicasAmaldicoadasHabilidadesService = TecnicasAmaldicoadasHabilidadesService;
exports.TecnicasAmaldicoadasHabilidadesService = TecnicasAmaldicoadasHabilidadesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TecnicasAmaldicoadasHabilidadesService);
//# sourceMappingURL=tecnicas-amaldicoadas.habilidades.service.js.map