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
exports.CampanhaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const campanha_exception_1 = require("../common/exceptions/campanha.exception");
const personagem_exception_1 = require("../common/exceptions/personagem.exception");
const MAX_TENTATIVAS_CODIGO_CONVITE = 5;
const CONFIG_MODIFICADOR_CAMPO = {
    PV_MAX: {
        campoBanco: 'pvMax',
        campoRecursoAtual: 'pvAtual',
        minimo: 0,
    },
    PE_MAX: {
        campoBanco: 'peMax',
        campoRecursoAtual: 'peAtual',
        minimo: 0,
    },
    EA_MAX: {
        campoBanco: 'eaMax',
        campoRecursoAtual: 'eaAtual',
        minimo: 0,
    },
    SAN_MAX: {
        campoBanco: 'sanMax',
        campoRecursoAtual: 'sanAtual',
        minimo: 0,
    },
    DEFESA_BASE: {
        campoBanco: 'defesaBase',
        minimo: 0,
    },
    DEFESA_EQUIPAMENTO: {
        campoBanco: 'defesaEquipamento',
    },
    DEFESA_OUTROS: {
        campoBanco: 'defesaOutros',
    },
    ESQUIVA: {
        campoBanco: 'esquiva',
    },
    BLOQUEIO: {
        campoBanco: 'bloqueio',
    },
    DESLOCAMENTO: {
        campoBanco: 'deslocamento',
        minimo: 0,
    },
    LIMITE_PE_EA_POR_TURNO: {
        campoBanco: 'limitePeEaPorTurno',
        minimo: 0,
    },
    PRESTIGIO_GERAL: {
        campoBanco: 'prestigioGeral',
    },
    PRESTIGIO_CLA: {
        campoBanco: 'prestigioCla',
    },
};
const PERSONAGEM_CAMPANHA_DETALHE_SELECT = {
    id: true,
    campanhaId: true,
    personagemBaseId: true,
    donoId: true,
    nome: true,
    nivel: true,
    pvMax: true,
    pvAtual: true,
    peMax: true,
    peAtual: true,
    eaMax: true,
    eaAtual: true,
    sanMax: true,
    sanAtual: true,
    limitePeEaPorTurno: true,
    prestigioGeral: true,
    prestigioCla: true,
    defesaBase: true,
    defesaEquipamento: true,
    defesaOutros: true,
    esquiva: true,
    bloqueio: true,
    deslocamento: true,
    turnosMorrendo: true,
    turnosEnlouquecendo: true,
    personagemBase: {
        select: {
            id: true,
            nome: true,
        },
    },
    dono: {
        select: {
            id: true,
            apelido: true,
        },
    },
    modificadores: {
        where: {
            ativo: true,
        },
        orderBy: {
            criadoEm: 'desc',
        },
        select: {
            id: true,
            campo: true,
            valor: true,
            nome: true,
            descricao: true,
            criadoEm: true,
            criadoPorId: true,
        },
    },
};
let CampanhaService = class CampanhaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criarCampanha(donoId, dto) {
        return this.prisma.campanha.create({
            data: {
                nome: dto.nome,
                descricao: dto.descricao ?? '',
                status: 'ATIVA',
                donoId,
            },
            include: {
                dono: {
                    select: { id: true, apelido: true, email: true },
                },
                _count: {
                    select: { membros: true, personagens: true, sessoes: true },
                },
            },
        });
    }
    async listarMinhasCampanhas(usuarioId, page, limit) {
        const where = {
            OR: [
                { donoId: usuarioId },
                {
                    membros: {
                        some: { usuarioId },
                    },
                },
            ],
        };
        const include = {
            dono: {
                select: { id: true, apelido: true },
            },
            _count: {
                select: { membros: true, personagens: true, sessoes: true },
            },
        };
        const orderBy = {
            criadoEm: 'desc',
        };
        if (!page || !limit) {
            return this.prisma.campanha.findMany({
                where,
                include,
                orderBy,
            });
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.campanha.findMany({
                where,
                include,
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.campanha.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async buscarPorIdParaUsuario(id, usuarioId) {
        const campanha = await this.prisma.campanha.findUnique({
            where: { id },
            include: {
                dono: { select: { id: true, apelido: true } },
                membros: {
                    include: {
                        usuario: { select: { id: true, apelido: true } },
                    },
                },
                _count: {
                    select: { personagens: true, sessoes: true },
                },
            },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(id);
        }
        const ehDono = campanha.donoId === usuarioId;
        const ehMembro = campanha.membros.some((m) => m.usuarioId === usuarioId);
        if (!ehDono && !ehMembro) {
            throw new campanha_exception_1.CampanhaAcessoNegadoException(id, usuarioId);
        }
        return campanha;
    }
    async excluirCampanha(campanhaId, usuarioId) {
        const campanha = await this.prisma.campanha.findUnique({
            where: { id: campanhaId },
            select: { donoId: true },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(campanhaId);
        }
        if (campanha.donoId !== usuarioId) {
            throw new campanha_exception_1.CampanhaApenasDonoException('excluir a campanha');
        }
        await this.prisma.campanha.delete({
            where: { id: campanhaId },
        });
        return {
            message: 'Campanha excluida com sucesso',
            id: campanhaId,
        };
    }
    async listarMembros(campanhaId, usuarioId) {
        await this.garantirAcesso(campanhaId, usuarioId);
        return this.prisma.membroCampanha.findMany({
            where: { campanhaId },
            include: {
                usuario: {
                    select: { id: true, apelido: true, email: true },
                },
            },
            orderBy: { entrouEm: 'asc' },
        });
    }
    async adicionarMembro(campanhaId, solicitanteId, dados) {
        const campanha = await this.prisma.campanha.findUnique({
            where: { id: campanhaId },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(campanhaId);
        }
        if (campanha.donoId !== solicitanteId) {
            throw new campanha_exception_1.CampanhaApenasDonoException('gerenciar membros');
        }
        return this.prisma.membroCampanha.create({
            data: {
                campanhaId,
                usuarioId: dados.usuarioId,
                papel: dados.papel,
            },
            include: {
                usuario: { select: { id: true, apelido: true, email: true } },
            },
        });
    }
    async listarPersonagensCampanha(campanhaId, usuarioId) {
        await this.garantirAcesso(campanhaId, usuarioId);
        const personagens = await this.prisma.personagemCampanha.findMany({
            where: { campanhaId },
            select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
            orderBy: [{ nome: 'asc' }, { id: 'asc' }],
        });
        return personagens.map((personagem) => this.mapearPersonagemCampanhaResposta(personagem));
    }
    async listarPersonagensBaseDisponiveisParaAssociacao(campanhaId, usuarioId) {
        const acesso = await this.garantirAcesso(campanhaId, usuarioId);
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
        const acesso = await this.garantirAcesso(campanhaId, solicitanteId);
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
                const conflitoDono = this.isUniqueConstraintViolation(error, [
                    'campanhaId',
                    'donoId',
                ]);
                const conflitoPersonagemBase = this.isUniqueConstraintViolation(error, [
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
            return personagemCriado.id;
        });
        const personagemCampanha = await this.prisma.personagemCampanha.findUnique({
            where: {
                id: personagemCampanhaId,
            },
            select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
        });
        if (!personagemCampanha) {
            throw new campanha_exception_1.PersonagemCampanhaNaoEncontradoException(personagemCampanhaId, campanhaId);
        }
        return this.mapearPersonagemCampanhaResposta(personagemCampanha);
    }
    async atualizarRecursosPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto) {
        const contexto = await this.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
        const antes = {
            pvAtual: contexto.personagem.pvAtual,
            peAtual: contexto.personagem.peAtual,
            eaAtual: contexto.personagem.eaAtual,
            sanAtual: contexto.personagem.sanAtual,
        };
        const depois = {
            pvAtual: dto.pvAtual === undefined
                ? contexto.personagem.pvAtual
                : this.clamp(dto.pvAtual, 0, contexto.personagem.pvMax),
            peAtual: dto.peAtual === undefined
                ? contexto.personagem.peAtual
                : this.clamp(dto.peAtual, 0, contexto.personagem.peMax),
            eaAtual: dto.eaAtual === undefined
                ? contexto.personagem.eaAtual
                : this.clamp(dto.eaAtual, 0, contexto.personagem.eaMax),
            sanAtual: dto.sanAtual === undefined
                ? contexto.personagem.sanAtual
                : this.clamp(dto.sanAtual, 0, contexto.personagem.sanMax),
        };
        const houveMudanca = antes.pvAtual !== depois.pvAtual ||
            antes.peAtual !== depois.peAtual ||
            antes.eaAtual !== depois.eaAtual ||
            antes.sanAtual !== depois.sanAtual;
        if (!houveMudanca) {
            const personagem = await this.prisma.personagemCampanha.findUnique({
                where: { id: personagemCampanhaId },
                select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
            });
            if (!personagem) {
                throw new campanha_exception_1.PersonagemCampanhaNaoEncontradoException(personagemCampanhaId, campanhaId);
            }
            return this.mapearPersonagemCampanhaResposta(personagem);
        }
        const atualizado = await this.prisma.$transaction(async (tx) => {
            const personagem = await tx.personagemCampanha.update({
                where: { id: personagemCampanhaId },
                data: {
                    pvAtual: depois.pvAtual,
                    peAtual: depois.peAtual,
                    eaAtual: depois.eaAtual,
                    sanAtual: depois.sanAtual,
                },
                select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
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
        return this.mapearPersonagemCampanhaResposta(atualizado);
    }
    async listarModificadoresPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, incluirInativos = false) {
        await this.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, false);
        const modificadores = await this.prisma.personagemCampanhaModificador.findMany({
            where: {
                campanhaId,
                personagemCampanhaId,
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
        const contexto = await this.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
        const configCampo = CONFIG_MODIFICADOR_CAMPO[dto.campo];
        const valorAtualCampo = this.lerCampoNumerico(contexto.personagem, configCampo.campoBanco);
        const valorCalculado = valorAtualCampo + dto.valor;
        const valorFinal = configCampo.minimo === undefined
            ? valorCalculado
            : Math.max(configCampo.minimo, valorCalculado);
        const dataAtualizacao = {
            [configCampo.campoBanco]: valorFinal,
        };
        if (configCampo.campoRecursoAtual) {
            const recursoAtual = this.lerCampoNumerico(contexto.personagem, configCampo.campoRecursoAtual);
            const recursoAjustado = this.clamp(recursoAtual, 0, valorFinal);
            dataAtualizacao[configCampo.campoRecursoAtual] = recursoAjustado;
        }
        const resultado = await this.prisma.$transaction(async (tx) => {
            const modificador = await tx.personagemCampanhaModificador.create({
                data: {
                    campanhaId,
                    personagemCampanhaId,
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
                select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
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
                        valorAntes: valorAtualCampo,
                        valorDepois: valorFinal,
                    },
                },
            });
            return { modificador, personagem };
        });
        return {
            modificador: resultado.modificador,
            personagem: this.mapearPersonagemCampanhaResposta(resultado.personagem),
        };
    }
    async desfazerModificadorPersonagemCampanha(campanhaId, personagemCampanhaId, modificadorId, usuarioId, motivo) {
        const contexto = await this.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
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
        const configCampo = CONFIG_MODIFICADOR_CAMPO[modificador.campo];
        const valorAtualCampo = this.lerCampoNumerico(contexto.personagem, configCampo.campoBanco);
        const valorCalculado = valorAtualCampo - modificador.valor;
        const valorFinal = configCampo.minimo === undefined
            ? valorCalculado
            : Math.max(configCampo.minimo, valorCalculado);
        const dataAtualizacao = {
            [configCampo.campoBanco]: valorFinal,
        };
        if (configCampo.campoRecursoAtual) {
            const recursoAtual = this.lerCampoNumerico(contexto.personagem, configCampo.campoRecursoAtual);
            const recursoAjustado = this.clamp(recursoAtual, 0, valorFinal);
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
                select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
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
            personagem: this.mapearPersonagemCampanhaResposta(resultado.personagem),
        };
    }
    async listarHistoricoPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId) {
        await this.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, false);
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
    async garantirAcesso(campanhaId, usuarioId) {
        const campanha = await this.prisma.campanha.findUnique({
            where: { id: campanhaId },
            select: {
                id: true,
                donoId: true,
                membros: {
                    select: {
                        usuarioId: true,
                        papel: true,
                    },
                },
            },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(campanhaId);
        }
        const ehDono = campanha.donoId === usuarioId;
        const membroAtual = campanha.membros.find((m) => m.usuarioId === usuarioId);
        if (!ehDono && !membroAtual) {
            throw new campanha_exception_1.CampanhaAcessoNegadoException(campanhaId, usuarioId);
        }
        const ehMestre = ehDono || membroAtual?.papel === 'MESTRE';
        return {
            campanha,
            ehDono,
            ehMestre,
            papel: membroAtual?.papel ?? null,
        };
    }
    async obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, exigirPermissaoEdicao) {
        const acesso = await this.garantirAcesso(campanhaId, usuarioId);
        const personagem = await this.prisma.personagemCampanha.findUnique({
            where: { id: personagemCampanhaId },
            select: {
                id: true,
                campanhaId: true,
                donoId: true,
                pvMax: true,
                pvAtual: true,
                peMax: true,
                peAtual: true,
                eaMax: true,
                eaAtual: true,
                sanMax: true,
                sanAtual: true,
                defesaBase: true,
                defesaEquipamento: true,
                defesaOutros: true,
                esquiva: true,
                bloqueio: true,
                deslocamento: true,
                limitePeEaPorTurno: true,
                prestigioGeral: true,
                prestigioCla: true,
            },
        });
        if (!personagem || personagem.campanhaId !== campanhaId) {
            throw new campanha_exception_1.PersonagemCampanhaNaoEncontradoException(personagemCampanhaId, campanhaId);
        }
        if (exigirPermissaoEdicao) {
            const podeEditar = acesso.ehMestre || personagem.donoId === usuarioId;
            if (!podeEditar) {
                throw new campanha_exception_1.CampanhaPersonagemEdicaoNegadaException(campanhaId, personagemCampanhaId, usuarioId);
            }
        }
        return {
            acesso,
            personagem,
        };
    }
    mapearPersonagemCampanhaResposta(personagem) {
        return {
            id: personagem.id,
            campanhaId: personagem.campanhaId,
            personagemBaseId: personagem.personagemBaseId,
            donoId: personagem.donoId,
            nome: personagem.nome,
            nivel: personagem.nivel,
            recursos: {
                pvAtual: personagem.pvAtual,
                pvMax: personagem.pvMax,
                peAtual: personagem.peAtual,
                peMax: personagem.peMax,
                eaAtual: personagem.eaAtual,
                eaMax: personagem.eaMax,
                sanAtual: personagem.sanAtual,
                sanMax: personagem.sanMax,
            },
            defesa: {
                base: personagem.defesaBase,
                equipamento: personagem.defesaEquipamento,
                outros: personagem.defesaOutros,
                total: personagem.defesaBase +
                    personagem.defesaEquipamento +
                    personagem.defesaOutros,
            },
            atributos: {
                limitePeEaPorTurno: personagem.limitePeEaPorTurno,
                prestigioGeral: personagem.prestigioGeral,
                prestigioCla: personagem.prestigioCla,
                deslocamento: personagem.deslocamento,
                esquiva: personagem.esquiva,
                bloqueio: personagem.bloqueio,
                turnosMorrendo: personagem.turnosMorrendo,
                turnosEnlouquecendo: personagem.turnosEnlouquecendo,
            },
            personagemBase: personagem.personagemBase,
            dono: personagem.dono,
            modificadoresAtivos: personagem.modificadores,
        };
    }
    lerCampoNumerico(personagem, campo) {
        const valor = personagem[campo];
        if (typeof valor !== 'number' || Number.isNaN(valor))
            return 0;
        return valor;
    }
    clamp(valor, minimo, maximo) {
        return Math.max(minimo, Math.min(maximo, valor));
    }
    normalizarEmail(email) {
        return email.trim().toLowerCase();
    }
    gerarCodigoConvite() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    isUniqueConstraintViolation(error, campos) {
        const prismaError = error;
        if (prismaError?.code !== 'P2002')
            return false;
        const target = prismaError?.meta?.target;
        const targetValues = Array.isArray(target)
            ? target.map((value) => String(value))
            : typeof target === 'string'
                ? [target]
                : [];
        if (targetValues.length === 0)
            return false;
        return campos.every((campo) => targetValues.some((targetValue) => targetValue === campo || targetValue.includes(campo)));
    }
    async criarConvitePorEmail(campanhaId, donoId, email, papel) {
        const emailConvite = email.trim();
        const emailConviteNormalizado = this.normalizarEmail(emailConvite);
        const campanha = await this.prisma.campanha.findUnique({
            where: { id: campanhaId },
            include: {
                dono: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                membros: {
                    select: {
                        usuarioId: true,
                        usuario: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(campanhaId);
        }
        if (campanha.donoId !== donoId) {
            throw new campanha_exception_1.CampanhaApenasDonoException('enviar convites');
        }
        if (this.normalizarEmail(campanha.dono.email) === emailConviteNormalizado) {
            throw new campanha_exception_1.UsuarioJaMembroCampanhaException(campanha.dono.id, campanhaId);
        }
        const membroExistente = campanha.membros.find((membro) => this.normalizarEmail(membro.usuario.email) === emailConviteNormalizado);
        if (membroExistente) {
            throw new campanha_exception_1.UsuarioJaMembroCampanhaException(membroExistente.usuarioId, campanhaId);
        }
        const convitesPendentes = await this.prisma.conviteCampanha.findMany({
            where: {
                campanhaId,
                status: 'PENDENTE',
            },
            select: {
                email: true,
            },
        });
        const convitePendenteDuplicado = convitesPendentes.some((convite) => this.normalizarEmail(convite.email) === emailConviteNormalizado);
        if (convitePendenteDuplicado) {
            throw new campanha_exception_1.ConvitePendenteDuplicadoException(campanhaId, emailConvite);
        }
        for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_CODIGO_CONVITE; tentativa += 1) {
            const codigo = this.gerarCodigoConvite();
            try {
                return await this.prisma.conviteCampanha.create({
                    data: {
                        campanhaId,
                        email: emailConvite,
                        papel,
                        codigo,
                        status: 'PENDENTE',
                    },
                });
            }
            catch (error) {
                const colisaoCodigo = this.isUniqueConstraintViolation(error, [
                    'codigo',
                ]);
                if (!colisaoCodigo) {
                    throw error;
                }
                if (tentativa === MAX_TENTATIVAS_CODIGO_CONVITE) {
                    throw new campanha_exception_1.ConviteCodigoIndisponivelException(campanhaId, MAX_TENTATIVAS_CODIGO_CONVITE);
                }
            }
        }
        throw new campanha_exception_1.ConviteCodigoIndisponivelException(campanhaId, MAX_TENTATIVAS_CODIGO_CONVITE);
    }
    async listarConvitesPendentesPorUsuario(usuarioId) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: { email: true },
        });
        if (!usuario) {
            throw new campanha_exception_1.UsuarioNaoEncontradoException(usuarioId);
        }
        return this.prisma.conviteCampanha.findMany({
            where: {
                email: usuario.email,
                status: 'PENDENTE',
            },
            include: {
                campanha: {
                    select: { id: true, nome: true, dono: { select: { apelido: true } } },
                },
            },
            orderBy: { criadoEm: 'desc' },
        });
    }
    async aceitarConvite(codigo, usuarioId) {
        const codigoConvite = codigo.trim();
        return this.prisma.$transaction(async (tx) => {
            const convite = await tx.conviteCampanha.findUnique({
                where: { codigo: codigoConvite },
                select: {
                    id: true,
                    campanhaId: true,
                    email: true,
                    papel: true,
                    status: true,
                },
            });
            if (!convite) {
                throw new campanha_exception_1.ConviteNaoEncontradoException(codigoConvite);
            }
            if (convite.status !== 'PENDENTE') {
                throw new campanha_exception_1.ConviteInvalidoOuUtilizadoException(codigoConvite, convite.status);
            }
            const usuario = await tx.usuario.findUnique({
                where: { id: usuarioId },
                select: {
                    email: true,
                },
            });
            if (!usuario) {
                throw new campanha_exception_1.UsuarioNaoEncontradoException(usuarioId);
            }
            if (this.normalizarEmail(usuario.email) !==
                this.normalizarEmail(convite.email)) {
                throw new campanha_exception_1.ConviteNaoPertenceUsuarioException(convite.email, usuario.email);
            }
            const jaMembro = await tx.membroCampanha.findUnique({
                where: {
                    campanhaId_usuarioId: {
                        campanhaId: convite.campanhaId,
                        usuarioId,
                    },
                },
                select: {
                    id: true,
                },
            });
            if (jaMembro) {
                throw new campanha_exception_1.UsuarioJaMembroCampanhaException(usuarioId, convite.campanhaId);
            }
            const papelConvite = convite.papel === 'MESTRE' || convite.papel === 'OBSERVADOR'
                ? convite.papel
                : 'JOGADOR';
            let membroCriado;
            try {
                membroCriado = await tx.membroCampanha.create({
                    data: {
                        campanhaId: convite.campanhaId,
                        usuarioId,
                        papel: papelConvite,
                    },
                });
            }
            catch (error) {
                const conflitoMembro = this.isUniqueConstraintViolation(error, [
                    'campanhaId',
                    'usuarioId',
                ]);
                if (conflitoMembro) {
                    throw new campanha_exception_1.UsuarioJaMembroCampanhaException(usuarioId, convite.campanhaId);
                }
                throw error;
            }
            await tx.conviteCampanha.update({
                where: { id: convite.id },
                data: {
                    status: 'ACEITO',
                    respondidoEm: new Date(),
                },
            });
            return membroCriado;
        });
    }
    async recusarConvite(codigo, usuarioId) {
        const codigoConvite = codigo.trim();
        const convite = await this.prisma.conviteCampanha.findUnique({
            where: { codigo: codigoConvite },
        });
        if (!convite) {
            throw new campanha_exception_1.ConviteNaoEncontradoException(codigoConvite);
        }
        if (convite.status !== 'PENDENTE') {
            throw new campanha_exception_1.ConviteInvalidoOuUtilizadoException(codigoConvite, convite.status);
        }
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
        });
        if (!usuario) {
            throw new campanha_exception_1.UsuarioNaoEncontradoException(usuarioId);
        }
        if (this.normalizarEmail(usuario.email) !==
            this.normalizarEmail(convite.email)) {
            throw new campanha_exception_1.ConviteNaoPertenceUsuarioException(convite.email, usuario.email);
        }
        return this.prisma.conviteCampanha.update({
            where: { id: convite.id },
            data: {
                status: 'RECUSADO',
                respondidoEm: new Date(),
            },
        });
    }
};
exports.CampanhaService = CampanhaService;
exports.CampanhaService = CampanhaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampanhaService);
//# sourceMappingURL=campanha.service.js.map