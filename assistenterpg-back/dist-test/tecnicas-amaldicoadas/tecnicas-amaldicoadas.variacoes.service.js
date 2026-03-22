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
exports.TecnicasAmaldicoadasVariacoesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tecnica_amaldicoada_exception_1 = require("src/common/exceptions/tecnica-amaldicoada.exception");
const tecnicas_amaldicoadas_engine_1 = require("./engine/tecnicas-amaldicoadas.engine");
const tecnicas_amaldicoadas_errors_1 = require("./tecnicas-amaldicoadas.errors");
let TecnicasAmaldicoadasVariacoesService = class TecnicasAmaldicoadasVariacoesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
                    custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
                    custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
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
                    dadosDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau ?? null,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA ?? null,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE ?? null,
                    escalonamentoTipo: dto.escalonamentoTipo ?? null,
                    escalonamentoEfeito: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.escalonamentoEfeito),
                    escalonamentoDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.escalonamentoDano),
                    efeitoAdicional: dto.efeitoAdicional ?? null,
                    requisitos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.requisitos),
                    ordem: dto.ordem ?? 0,
                },
            });
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
                    custoSustentacaoEA: dto.custoSustentacaoEA,
                    custoSustentacaoPE: dto.custoSustentacaoPE,
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
                    dadosDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE,
                    escalonamentoTipo: dto.escalonamentoTipo,
                    escalonamentoEfeito: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.escalonamentoEfeito),
                    escalonamentoDano: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.escalonamentoDano),
                    efeitoAdicional: dto.efeitoAdicional,
                    requisitos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.requisitos),
                    ordem: dto.ordem,
                },
            });
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
};
exports.TecnicasAmaldicoadasVariacoesService = TecnicasAmaldicoadasVariacoesService;
exports.TecnicasAmaldicoadasVariacoesService = TecnicasAmaldicoadasVariacoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TecnicasAmaldicoadasVariacoesService);
//# sourceMappingURL=tecnicas-amaldicoadas.variacoes.service.js.map