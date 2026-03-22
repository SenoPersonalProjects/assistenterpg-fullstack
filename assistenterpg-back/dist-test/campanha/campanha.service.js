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
const campanha_exception_1 = require("src/common/exceptions/campanha.exception");
const campanha_access_service_1 = require("./campanha.access.service");
const campanha_personagens_service_1 = require("./campanha.personagens.service");
const campanha_modificadores_service_1 = require("./campanha.modificadores.service");
const campanha_convites_service_1 = require("./campanha.convites.service");
const campanha_inventario_service_1 = require("./campanha.inventario.service");
let CampanhaService = class CampanhaService {
    prisma;
    accessService;
    personagensService;
    modificadoresService;
    convitesService;
    inventarioService;
    constructor(prisma, accessService, personagensService, modificadoresService, convitesService, inventarioService) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.personagensService = personagensService;
        this.modificadoresService = modificadoresService;
        this.convitesService = convitesService;
        this.inventarioService = inventarioService;
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
        await this.accessService.garantirAcesso(campanhaId, usuarioId);
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
        return this.personagensService.listarPersonagensCampanha(campanhaId, usuarioId);
    }
    async listarPersonagensBaseDisponiveisParaAssociacao(campanhaId, usuarioId) {
        return this.personagensService.listarPersonagensBaseDisponiveisParaAssociacao(campanhaId, usuarioId);
    }
    async vincularPersonagemBase(campanhaId, solicitanteId, personagemBaseId) {
        return this.personagensService.vincularPersonagemBase(campanhaId, solicitanteId, personagemBaseId);
    }
    async desassociarPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId) {
        return this.personagensService.desassociarPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId);
    }
    async atualizarRecursosPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto) {
        return this.personagensService.atualizarRecursosPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto);
    }
    async listarModificadoresPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, incluirInativos = false, filtros = {}) {
        return this.modificadoresService.listarModificadoresPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, incluirInativos, filtros);
    }
    async aplicarModificadorPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto) {
        return this.modificadoresService.aplicarModificadorPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto);
    }
    async desfazerModificadorPersonagemCampanha(campanhaId, personagemCampanhaId, modificadorId, usuarioId, motivo) {
        return this.modificadoresService.desfazerModificadorPersonagemCampanha(campanhaId, personagemCampanhaId, modificadorId, usuarioId, motivo);
    }
    async listarHistoricoPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId) {
        return this.personagensService.listarHistoricoPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId);
    }
    async buscarInventarioPersonagemCampanha(campanhaId, personagemCampanhaId, usuarioId) {
        return this.inventarioService.buscarInventarioCampanha(campanhaId, personagemCampanhaId, usuarioId);
    }
    async adicionarItemInventarioCampanha(campanhaId, personagemCampanhaId, usuarioId, dto) {
        return this.inventarioService.adicionarItemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto);
    }
    async atualizarItemInventarioCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, dto) {
        return this.inventarioService.atualizarItemCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, dto);
    }
    async removerItemInventarioCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId) {
        return this.inventarioService.removerItemCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId);
    }
    async aplicarModificacaoInventarioCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, dto) {
        return this.inventarioService.aplicarModificacaoCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, dto);
    }
    async removerModificacaoInventarioCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, modificacaoId) {
        return this.inventarioService.removerModificacaoCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, modificacaoId);
    }
    async criarConvitePorEmail(campanhaId, donoId, email, papel) {
        return this.convitesService.criarConvitePorEmail(campanhaId, donoId, email, papel);
    }
    async listarConvitesPendentesPorUsuario(usuarioId) {
        return this.convitesService.listarConvitesPendentesPorUsuario(usuarioId);
    }
    async aceitarConvite(codigo, usuarioId) {
        return this.convitesService.aceitarConvite(codigo, usuarioId);
    }
    async recusarConvite(codigo, usuarioId) {
        return this.convitesService.recusarConvite(codigo, usuarioId);
    }
};
exports.CampanhaService = CampanhaService;
exports.CampanhaService = CampanhaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        campanha_access_service_1.CampanhaAccessService,
        campanha_personagens_service_1.CampanhaPersonagensService,
        campanha_modificadores_service_1.CampanhaModificadoresService,
        campanha_convites_service_1.CampanhaConvitesService,
        campanha_inventario_service_1.CampanhaInventarioService])
], CampanhaService);
//# sourceMappingURL=campanha.service.js.map