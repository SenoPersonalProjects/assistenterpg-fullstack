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
exports.CampanhaModificadoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const campanha_exception_1 = require("src/common/exceptions/campanha.exception");
const campanha_access_service_1 = require("./campanha.access.service");
const campanha_contexto_service_1 = require("./campanha.contexto.service");
const campanha_mapper_1 = require("./campanha.mapper");
const campanha_engine_1 = require("./engine/campanha.engine");
const campanha_engine_types_1 = require("./engine/campanha.engine.types");
let CampanhaModificadoresService = class CampanhaModificadoresService {
    prisma;
    accessService;
    contextoService;
    mapper;
    constructor(prisma, accessService, contextoService, mapper) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.contextoService = contextoService;
        this.mapper = mapper;
    }
    async listarModificadoresPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, incluirInativos = false, filtros = {}) {
        await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, false);
        const contexto = await this.contextoService.validarContextoSessaoCena(campanhaId, filtros.sessaoId, filtros.cenaId);
        const modificadores = await this.prisma.personagemCampanhaModificador.findMany({
            where: {
                campanhaId,
                personagemCampanhaId,
                ...(contexto.sessaoId !== null
                    ? { sessaoId: contexto.sessaoId }
                    : {}),
                ...(contexto.cenaId !== null ? { cenaId: contexto.cenaId } : {}),
                ...(incluirInativos ? {} : { ativo: true }),
            },
            include: {
                criadoPor: {
                    select: {
                        id: true,
                        apelido: true,
                    },
                },
                desfeitoPor: {
                    select: {
                        id: true,
                        apelido: true,
                    },
                },
            },
            orderBy: [{ ativo: 'desc' }, { criadoEm: 'desc' }],
        });
        return modificadores.map((modificador) => ({
            id: modificador.id,
            campanhaId: modificador.campanhaId,
            personagemCampanhaId: modificador.personagemCampanhaId,
            sessaoId: modificador.sessaoId,
            cenaId: modificador.cenaId,
            campo: modificador.campo,
            valor: modificador.valor,
            nome: modificador.nome,
            descricao: modificador.descricao,
            ativo: modificador.ativo,
            criadoEm: modificador.criadoEm,
            criadoPorId: modificador.criadoPorId,
            criadoPor: modificador.criadoPor,
            desfeitoEm: modificador.desfeitoEm,
            desfeitoPorId: modificador.desfeitoPorId,
            desfeitoPor: modificador.desfeitoPor,
            motivoDesfazer: modificador.motivoDesfazer,
        }));
    }
    async aplicarModificadorPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto) {
        const contextoPersonagem = await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
        const contextoSessaoCena = await this.contextoService.validarContextoSessaoCena(campanhaId, dto.sessaoId, dto.cenaId);
        const configCampo = campanha_engine_types_1.CONFIG_MODIFICADOR_CAMPO[dto.campo];
        const valorAtualCampo = (0, campanha_engine_1.lerCampoNumerico)(contextoPersonagem.personagem, configCampo.campoBanco);
        const valorCalculado = valorAtualCampo + dto.valor;
        const valorFinal = configCampo.minimo === undefined
            ? valorCalculado
            : Math.max(configCampo.minimo, valorCalculado);
        const dataAtualizacao = {
            [configCampo.campoBanco]: valorFinal,
        };
        if (configCampo.campoRecursoAtual) {
            const recursoAtual = (0, campanha_engine_1.lerCampoNumerico)(contextoPersonagem.personagem, configCampo.campoRecursoAtual);
            const recursoAjustado = (0, campanha_engine_1.clamp)(recursoAtual, 0, valorFinal);
            dataAtualizacao[configCampo.campoRecursoAtual] = recursoAjustado;
        }
        const resultado = await this.prisma.$transaction(async (tx) => {
            const modificador = await tx.personagemCampanhaModificador.create({
                data: {
                    campanhaId,
                    personagemCampanhaId,
                    sessaoId: contextoSessaoCena.sessaoId,
                    cenaId: contextoSessaoCena.cenaId,
                    campo: dto.campo,
                    valor: dto.valor,
                    nome: dto.nome.trim(),
                    descricao: dto.descricao?.trim() || null,
                    criadoPorId: usuarioId,
                },
            });
            const personagem = await tx.personagemCampanha.update({
                where: { id: personagemCampanhaId },
                data: dataAtualizacao,
                select: campanha_mapper_1.PERSONAGEM_CAMPANHA_DETALHE_SELECT,
            });
            await tx.personagemCampanhaHistorico.create({
                data: {
                    personagemCampanhaId,
                    campanhaId,
                    criadoPorId: usuarioId,
                    tipo: 'MODIFICADOR_APLICADO',
                    descricao: `Modificador aplicado em ${dto.campo}`,
                    dados: {
                        modificadorId: modificador.id,
                        campo: dto.campo,
                        valor: dto.valor,
                        nome: dto.nome,
                        sessaoId: contextoSessaoCena.sessaoId,
                        cenaId: contextoSessaoCena.cenaId,
                        valorAntes: valorAtualCampo,
                        valorDepois: valorFinal,
                    },
                },
            });
            return { modificador, personagem };
        });
        return {
            modificador: resultado.modificador,
            personagem: this.mapper.mapearPersonagemCampanhaResposta(resultado.personagem),
        };
    }
    async desfazerModificadorPersonagemCampanha(campanhaId, personagemCampanhaId, modificadorId, usuarioId, motivo) {
        const contexto = await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
        const modificador = await this.prisma.personagemCampanhaModificador.findFirst({
            where: {
                id: modificadorId,
                campanhaId,
                personagemCampanhaId,
            },
        });
        if (!modificador) {
            throw new campanha_exception_1.CampanhaModificadorNaoEncontradoException(modificadorId, personagemCampanhaId);
        }
        if (!modificador.ativo) {
            throw new campanha_exception_1.CampanhaModificadorJaDesfeitoException(modificadorId, personagemCampanhaId);
        }
        const configCampo = campanha_engine_types_1.CONFIG_MODIFICADOR_CAMPO[modificador.campo];
        const valorAtualCampo = (0, campanha_engine_1.lerCampoNumerico)(contexto.personagem, configCampo.campoBanco);
        const valorCalculado = valorAtualCampo - modificador.valor;
        const valorFinal = configCampo.minimo === undefined
            ? valorCalculado
            : Math.max(configCampo.minimo, valorCalculado);
        const dataAtualizacao = {
            [configCampo.campoBanco]: valorFinal,
        };
        if (configCampo.campoRecursoAtual) {
            const recursoAtual = (0, campanha_engine_1.lerCampoNumerico)(contexto.personagem, configCampo.campoRecursoAtual);
            const recursoAjustado = (0, campanha_engine_1.clamp)(recursoAtual, 0, valorFinal);
            dataAtualizacao[configCampo.campoRecursoAtual] = recursoAjustado;
        }
        const resultado = await this.prisma.$transaction(async (tx) => {
            const modificadorAtualizado = await tx.personagemCampanhaModificador.update({
                where: { id: modificadorId },
                data: {
                    ativo: false,
                    desfeitoEm: new Date(),
                    desfeitoPorId: usuarioId,
                    motivoDesfazer: motivo?.trim() || null,
                },
                include: {
                    criadoPor: {
                        select: {
                            id: true,
                            apelido: true,
                        },
                    },
                    desfeitoPor: {
                        select: {
                            id: true,
                            apelido: true,
                        },
                    },
                },
            });
            const personagem = await tx.personagemCampanha.update({
                where: { id: personagemCampanhaId },
                data: dataAtualizacao,
                select: campanha_mapper_1.PERSONAGEM_CAMPANHA_DETALHE_SELECT,
            });
            await tx.personagemCampanhaHistorico.create({
                data: {
                    personagemCampanhaId,
                    campanhaId,
                    criadoPorId: usuarioId,
                    tipo: 'MODIFICADOR_DESFEITO',
                    descricao: `Modificador desfeito em ${modificador.campo}`,
                    dados: {
                        modificadorId: modificador.id,
                        campo: modificador.campo,
                        valor: modificador.valor,
                        sessaoId: modificador.sessaoId,
                        cenaId: modificador.cenaId,
                        valorAntes: valorAtualCampo,
                        valorDepois: valorFinal,
                        motivo: motivo?.trim() || null,
                    },
                },
            });
            return { modificador: modificadorAtualizado, personagem };
        });
        return {
            modificador: resultado.modificador,
            personagem: this.mapper.mapearPersonagemCampanhaResposta(resultado.personagem),
        };
    }
};
exports.CampanhaModificadoresService = CampanhaModificadoresService;
exports.CampanhaModificadoresService = CampanhaModificadoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        campanha_access_service_1.CampanhaAccessService,
        campanha_contexto_service_1.CampanhaContextoService,
        campanha_mapper_1.CampanhaMapper])
], CampanhaModificadoresService);
//# sourceMappingURL=campanha.modificadores.service.js.map