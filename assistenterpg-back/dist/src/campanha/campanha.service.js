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
            message: 'Campanha excluída com sucesso',
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
    async garantirAcesso(campanhaId, usuarioId) {
        const campanha = await this.prisma.campanha.findUnique({
            where: { id: campanhaId },
            include: {
                membros: { select: { usuarioId: true } },
            },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(campanhaId);
        }
        const ehDono = campanha.donoId === usuarioId;
        const ehMembro = campanha.membros.some((m) => m.usuarioId === usuarioId);
        if (!ehDono && !ehMembro) {
            throw new campanha_exception_1.CampanhaAcessoNegadoException(campanhaId, usuarioId);
        }
    }
    gerarCodigoConvite() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    async criarConvitePorEmail(campanhaId, donoId, email, papel) {
        const campanha = await this.prisma.campanha.findUnique({
            where: { id: campanhaId },
            include: { dono: true },
        });
        if (!campanha) {
            throw new campanha_exception_1.CampanhaNaoEncontradaException(campanhaId);
        }
        if (campanha.donoId !== donoId) {
            throw new campanha_exception_1.CampanhaApenasDonoException('enviar convites');
        }
        const codigo = this.gerarCodigoConvite();
        return this.prisma.conviteCampanha.create({
            data: {
                campanhaId,
                email,
                papel,
                codigo,
                status: 'PENDENTE',
            },
        });
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
        const convite = await this.prisma.conviteCampanha.findUnique({
            where: { codigo },
            include: { campanha: true },
        });
        if (!convite) {
            throw new campanha_exception_1.ConviteNaoEncontradoException(codigo);
        }
        if (convite.status !== 'PENDENTE') {
            throw new campanha_exception_1.ConviteInvalidoOuUtilizadoException(codigo, convite.status);
        }
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
        });
        if (!usuario) {
            throw new campanha_exception_1.UsuarioNaoEncontradoException(usuarioId);
        }
        if (usuario.email !== convite.email) {
            throw new campanha_exception_1.ConviteNaoPertenceUsuarioException(convite.email, usuario.email);
        }
        const jaMembro = await this.prisma.membroCampanha.findUnique({
            where: {
                campanhaId_usuarioId: {
                    campanhaId: convite.campanhaId,
                    usuarioId,
                },
            },
        });
        if (jaMembro) {
            throw new campanha_exception_1.UsuarioJaMembroCampanhaException(usuarioId, convite.campanhaId);
        }
        const papelConvite = convite.papel === 'MESTRE' || convite.papel === 'OBSERVADOR'
            ? convite.papel
            : 'JOGADOR';
        const membro = await this.prisma.membroCampanha.create({
            data: {
                campanhaId: convite.campanhaId,
                usuarioId,
                papel: papelConvite,
            },
        });
        await this.prisma.conviteCampanha.update({
            where: { id: convite.id },
            data: {
                status: 'ACEITO',
                respondidoEm: new Date(),
            },
        });
        return membro;
    }
    async recusarConvite(codigo, usuarioId) {
        const convite = await this.prisma.conviteCampanha.findUnique({
            where: { codigo },
        });
        if (!convite) {
            throw new campanha_exception_1.ConviteNaoEncontradoException(codigo);
        }
        if (convite.status !== 'PENDENTE') {
            throw new campanha_exception_1.ConviteInvalidoOuUtilizadoException(codigo, convite.status);
        }
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
        });
        if (!usuario) {
            throw new campanha_exception_1.UsuarioNaoEncontradoException(usuarioId);
        }
        if (usuario.email !== convite.email) {
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