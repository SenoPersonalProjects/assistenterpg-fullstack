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
exports.CampanhaPersonagensService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const campanha_exception_1 = require("src/common/exceptions/campanha.exception");
const personagem_exception_1 = require("src/common/exceptions/personagem.exception");
const campanha_access_service_1 = require("./campanha.access.service");
const campanha_inventario_service_1 = require("./campanha.inventario.service");
const campanha_mapper_1 = require("./campanha.mapper");
const campanha_persistence_1 = require("./campanha.persistence");
const campanha_engine_1 = require("./engine/campanha.engine");
let CampanhaPersonagensService = class CampanhaPersonagensService {
    prisma;
    accessService;
    inventarioService;
    mapper;
    persistence;
    constructor(prisma, accessService, inventarioService, mapper, persistence) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.inventarioService = inventarioService;
        this.mapper = mapper;
        this.persistence = persistence;
    }
    async listarPersonagensCampanha(campanhaId, usuarioId) {
        await this.accessService.garantirAcesso(campanhaId, usuarioId);
        const personagens = await this.persistence.listarPersonagensCampanha(campanhaId);
        return personagens.map((personagem) => this.mapper.mapearPersonagemCampanhaResposta(personagem));
    }
    async listarPersonagensBaseDisponiveisParaAssociacao(campanhaId, usuarioId) {
        const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
        const idsDonosPermitidos = acesso.ehMestre
            ? [
                acesso.campanha.donoId,
                ...acesso.campanha.membros.map((membro) => membro.usuarioId),
            ]
            : [usuarioId];
        const idsDonosUnicos = Array.from(new Set(idsDonosPermitidos));
        const personagensJaAssociados = await this.prisma.personagemCampanha.findMany({
            where: { campanhaId },
            select: { personagemBaseId: true },
        });
        const idsPersonagensJaAssociados = personagensJaAssociados.map((personagem) => personagem.personagemBaseId);
        const personagensBase = await this.prisma.personagemBase.findMany({
            where: {
                donoId: { in: idsDonosUnicos },
                ...(idsPersonagensJaAssociados.length > 0
                    ? { id: { notIn: idsPersonagensJaAssociados } }
                    : {}),
            },
            select: {
                id: true,
                nome: true,
                nivel: true,
                donoId: true,
                dono: {
                    select: {
                        id: true,
                        apelido: true,
                    },
                },
            },
            orderBy: [{ nome: 'asc' }, { id: 'asc' }],
        });
        return personagensBase.map((personagem) => ({
            id: personagem.id,
            nome: personagem.nome,
            nivel: personagem.nivel,
            donoId: personagem.donoId,
            dono: {
                id: personagem.dono.id,
                apelido: personagem.dono.apelido,
            },
        }));
    }
    async vincularPersonagemBase(campanhaId, solicitanteId, personagemBaseId) {
        const acesso = await this.accessService.garantirAcesso(campanhaId, solicitanteId);
        const personagemBase = await this.prisma.personagemBase.findUnique({
            where: { id: personagemBaseId },
            select: {
                id: true,
                donoId: true,
                nome: true,
                nivel: true,
                claId: true,
                origemId: true,
                classeId: true,
                trilhaId: true,
                caminhoId: true,
                pvMaximo: true,
                peMaximo: true,
                eaMaximo: true,
                sanMaximo: true,
                limitePeEaPorTurno: true,
                prestigioBase: true,
                prestigioClaBase: true,
                defesaBase: true,
                defesaEquipamento: true,
                defesaOutros: true,
                esquiva: true,
                bloqueio: true,
                deslocamento: true,
                turnosMorrendo: true,
                turnosEnlouquecendo: true,
                espacosInventarioBase: true,
                espacosInventarioExtra: true,
                espacosOcupados: true,
                sobrecarregado: true,
                tecnicaInataId: true,
                resistencias: {
                    select: {
                        resistenciaTipoId: true,
                        valor: true,
                    },
                },
            },
        });
        if (!personagemBase) {
            throw new personagem_exception_1.PersonagemBaseNaoEncontradoException(personagemBaseId);
        }
        const donoParticipaDaCampanha = personagemBase.donoId === acesso.campanha.donoId ||
            acesso.campanha.membros.some((membro) => membro.usuarioId === personagemBase.donoId);
        if (!donoParticipaDaCampanha) {
            throw new campanha_exception_1.CampanhaPersonagemAssociacaoNegadaException(campanhaId, solicitanteId, personagemBaseId);
        }
        const solicitanteEhDonoDoPersonagem = personagemBase.donoId === solicitanteId;
        if (!acesso.ehMestre && !solicitanteEhDonoDoPersonagem) {
            throw new campanha_exception_1.CampanhaPersonagemAssociacaoNegadaException(campanhaId, solicitanteId, personagemBaseId);
        }
        const donoEhMestreNaCampanha = personagemBase.donoId === acesso.campanha.donoId ||
            acesso.campanha.membros.some((membro) => membro.usuarioId === personagemBase.donoId &&
                membro.papel === 'MESTRE');
        const deveAplicarLimitePorUsuario = !donoEhMestreNaCampanha;
        if (deveAplicarLimitePorUsuario) {
            const personagemExistenteDoDono = await this.prisma.personagemCampanha.findFirst({
                where: {
                    campanhaId,
                    donoId: personagemBase.donoId,
                },
                select: { id: true },
            });
            if (personagemExistenteDoDono) {
                throw new campanha_exception_1.CampanhaPersonagemLimiteUsuarioException(campanhaId, personagemBase.donoId);
            }
        }
        const personagemCampanhaId = await this.prisma.$transaction(async (tx) => {
            if (deveAplicarLimitePorUsuario) {
                const personagemExistenteDoDono = await tx.personagemCampanha.findFirst({
                    where: {
                        campanhaId,
                        donoId: personagemBase.donoId,
                    },
                    select: { id: true },
                });
                if (personagemExistenteDoDono) {
                    throw new campanha_exception_1.CampanhaPersonagemLimiteUsuarioException(campanhaId, personagemBase.donoId);
                }
            }
            let personagemCriado;
            try {
                personagemCriado = await tx.personagemCampanha.create({
                    data: {
                        campanhaId,
                        personagemBaseId: personagemBase.id,
                        donoId: personagemBase.donoId,
                        nome: personagemBase.nome,
                        nivel: personagemBase.nivel,
                        claId: personagemBase.claId,
                        origemId: personagemBase.origemId,
                        classeId: personagemBase.classeId,
                        trilhaId: personagemBase.trilhaId,
                        caminhoId: personagemBase.caminhoId,
                        pvMax: personagemBase.pvMaximo,
                        pvAtual: personagemBase.pvMaximo,
                        peMax: personagemBase.peMaximo,
                        peAtual: personagemBase.peMaximo,
                        eaMax: personagemBase.eaMaximo,
                        eaAtual: personagemBase.eaMaximo,
                        sanMax: personagemBase.sanMaximo,
                        sanAtual: personagemBase.sanMaximo,
                        limitePeEaPorTurno: personagemBase.limitePeEaPorTurno,
                        prestigioGeral: personagemBase.prestigioBase,
                        prestigioCla: personagemBase.prestigioClaBase,
                        defesaBase: personagemBase.defesaBase,
                        defesaEquipamento: personagemBase.defesaEquipamento,
                        defesaOutros: personagemBase.defesaOutros,
                        esquiva: personagemBase.esquiva,
                        bloqueio: personagemBase.bloqueio,
                        deslocamento: personagemBase.deslocamento,
                        turnosMorrendo: personagemBase.turnosMorrendo,
                        turnosEnlouquecendo: personagemBase.turnosEnlouquecendo,
                        espacosInventarioBase: personagemBase.espacosInventarioBase,
                        espacosInventarioExtra: personagemBase.espacosInventarioExtra,
                        espacosOcupados: personagemBase.espacosOcupados,
                        sobrecarregado: personagemBase.sobrecarregado,
                        tecnicaInataId: personagemBase.tecnicaInataId,
                    },
                    select: {
                        id: true,
                    },
                });
            }
            catch (error) {
                const conflitoDono = (0, campanha_engine_1.isUniqueConstraintViolation)(error, [
                    'campanhaId',
                    'donoId',
                ]);
                const conflitoPersonagemBase = (0, campanha_engine_1.isUniqueConstraintViolation)(error, [
                    'campanhaId',
                    'personagemBaseId',
                ]);
                if ((conflitoDono && deveAplicarLimitePorUsuario) ||
                    conflitoPersonagemBase) {
                    throw new campanha_exception_1.CampanhaPersonagemLimiteUsuarioException(campanhaId, personagemBase.donoId);
                }
                throw error;
            }
            if (personagemBase.resistencias.length > 0) {
                await tx.personagemCampanhaResistencia.createMany({
                    data: personagemBase.resistencias.map((resistencia) => ({
                        personagemCampanhaId: personagemCriado.id,
                        resistenciaTipoId: resistencia.resistenciaTipoId,
                        valor: resistencia.valor,
                    })),
                });
            }
            await tx.personagemCampanhaHistorico.create({
                data: {
                    personagemCampanhaId: personagemCriado.id,
                    campanhaId,
                    criadoPorId: solicitanteId,
                    tipo: 'VINCULO_PERSONAGEM_BASE',
                    descricao: 'Personagem-base associado a campanha',
                    dados: {
                        personagemBaseId: personagemBase.id,
                        donoId: personagemBase.donoId,
                    },
                },
            });
            const itensInventarioBase = await tx.inventarioItemBase.findMany({
                where: { personagemBaseId: personagemBase.id },
                include: {
                    modificacoes: true,
                },
            });
            for (const itemBase of itensInventarioBase) {
                const itemCriado = await tx.inventarioItemCampanha.create({
                    data: {
                        personagemCampanhaId: personagemCriado.id,
                        equipamentoId: itemBase.equipamentoId,
                        quantidade: itemBase.quantidade,
                        equipado: itemBase.equipado,
                        categoriaCalculada: itemBase.categoriaCalculada,
                        nomeCustomizado: itemBase.nomeCustomizado,
                        notas: itemBase.notas,
                    },
                    select: { id: true },
                });
                if (itemBase.modificacoes.length > 0) {
                    await tx.inventarioItemCampanhaModificacao.createMany({
                        data: itemBase.modificacoes.map((mod) => ({
                            itemId: itemCriado.id,
                            modificacaoId: mod.modificacaoId,
                        })),
                    });
                }
            }
            return personagemCriado.id;
        });
        await this.inventarioService.recalcularEstadoInventarioCampanha(personagemCampanhaId);
        const personagemCampanha = await this.persistence.buscarPersonagemCampanhaDetalhe(personagemCampanhaId);
        if (!personagemCampanha) {
            throw new campanha_exception_1.PersonagemCampanhaNaoEncontradoException(personagemCampanhaId, campanhaId);
        }
        return this.mapper.mapearPersonagemCampanhaResposta(personagemCampanha);
    }
    async desassociarPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId) {
        const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
        const personagem = await this.prisma.personagemCampanha.findUnique({
            where: { id: personagemCampanhaId },
            select: {
                id: true,
                campanhaId: true,
                personagemBaseId: true,
                donoId: true,
            },
        });
        if (!personagem || personagem.campanhaId !== campanhaId) {
            throw new campanha_exception_1.PersonagemCampanhaNaoEncontradoException(personagemCampanhaId, campanhaId);
        }
        const podeRemover = acesso.ehMestre || personagem.donoId === usuarioId;
        if (!podeRemover) {
            throw new campanha_exception_1.CampanhaPersonagemEdicaoNegadaException(campanhaId, personagemCampanhaId, usuarioId);
        }
        const participacaoEmSessao = await this.prisma.personagemSessao.findFirst({
            where: {
                personagemCampanhaId,
            },
            select: {
                id: true,
                sessaoId: true,
            },
        });
        if (participacaoEmSessao) {
            throw new campanha_exception_1.CampanhaPersonagemDesassociacaoNegadaException(campanhaId, personagemCampanhaId, participacaoEmSessao.sessaoId);
        }
        await this.prisma.personagemCampanha.delete({
            where: {
                id: personagemCampanhaId,
            },
        });
        return {
            id: personagemCampanhaId,
            campanhaId,
            personagemBaseId: personagem.personagemBaseId,
            message: 'Personagem desassociado com sucesso',
        };
    }
    async atualizarRecursosPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto) {
        const contexto = await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
        const antes = {
            pvAtual: contexto.personagem.pvAtual,
            peAtual: contexto.personagem.peAtual,
            eaAtual: contexto.personagem.eaAtual,
            sanAtual: contexto.personagem.sanAtual,
        };
        const depois = {
            pvAtual: dto.pvAtual == null
                ? contexto.personagem.pvAtual
                : (0, campanha_engine_1.clamp)(dto.pvAtual, 0, contexto.personagem.pvMax),
            peAtual: dto.peAtual == null
                ? contexto.personagem.peAtual
                : (0, campanha_engine_1.clamp)(dto.peAtual, 0, contexto.personagem.peMax),
            eaAtual: dto.eaAtual == null
                ? contexto.personagem.eaAtual
                : (0, campanha_engine_1.clamp)(dto.eaAtual, 0, contexto.personagem.eaMax),
            sanAtual: dto.sanAtual == null
                ? contexto.personagem.sanAtual
                : (0, campanha_engine_1.clamp)(dto.sanAtual, 0, contexto.personagem.sanMax),
        };
        const atualizado = await this.prisma.$transaction(async (tx) => {
            const personagem = await tx.personagemCampanha.update({
                where: { id: personagemCampanhaId },
                data: {
                    pvAtual: depois.pvAtual,
                    peAtual: depois.peAtual,
                    eaAtual: depois.eaAtual,
                    sanAtual: depois.sanAtual,
                },
                select: campanha_mapper_1.PERSONAGEM_CAMPANHA_DETALHE_SELECT,
            });
            await tx.personagemCampanhaHistorico.create({
                data: {
                    personagemCampanhaId,
                    campanhaId,
                    criadoPorId: usuarioId,
                    tipo: 'ATUALIZACAO_RECURSOS',
                    descricao: 'Recursos atuais da ficha foram atualizados manualmente',
                    dados: {
                        antes,
                        depois,
                    },
                },
            });
            return personagem;
        });
        return this.mapper.mapearPersonagemCampanhaResposta(atualizado);
    }
    async listarHistoricoPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId) {
        await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, false);
        const historico = await this.prisma.personagemCampanhaHistorico.findMany({
            where: {
                campanhaId,
                personagemCampanhaId,
            },
            include: {
                criadoPor: {
                    select: {
                        id: true,
                        apelido: true,
                    },
                },
            },
            orderBy: { criadoEm: 'desc' },
            take: 200,
        });
        return historico;
    }
};
exports.CampanhaPersonagensService = CampanhaPersonagensService;
exports.CampanhaPersonagensService = CampanhaPersonagensService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        campanha_access_service_1.CampanhaAccessService,
        campanha_inventario_service_1.CampanhaInventarioService,
        campanha_mapper_1.CampanhaMapper,
        campanha_persistence_1.CampanhaPersistence])
], CampanhaPersonagensService);
//# sourceMappingURL=campanha.personagens.service.js.map