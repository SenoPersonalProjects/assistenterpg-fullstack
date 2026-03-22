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
exports.CampanhaConvitesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const campanha_exception_1 = require("src/common/exceptions/campanha.exception");
const campanha_engine_1 = require("./engine/campanha.engine");
const campanha_engine_types_1 = require("./engine/campanha.engine.types");
let CampanhaConvitesService = class CampanhaConvitesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criarConvitePorEmail(campanhaId, donoId, email, papel) {
        const emailConvite = email.trim();
        const emailConviteNormalizado = (0, campanha_engine_1.normalizarEmail)(emailConvite);
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
        if ((0, campanha_engine_1.normalizarEmail)(campanha.dono.email) === emailConviteNormalizado) {
            throw new campanha_exception_1.UsuarioJaMembroCampanhaException(campanha.dono.id, campanhaId);
        }
        const membroExistente = campanha.membros.find((membro) => (0, campanha_engine_1.normalizarEmail)(membro.usuario.email) === emailConviteNormalizado);
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
        const convitePendenteDuplicado = convitesPendentes.some((convite) => (0, campanha_engine_1.normalizarEmail)(convite.email) === emailConviteNormalizado);
        if (convitePendenteDuplicado) {
            throw new campanha_exception_1.ConvitePendenteDuplicadoException(campanhaId, emailConvite);
        }
        for (let tentativa = 1; tentativa <= campanha_engine_types_1.MAX_TENTATIVAS_CODIGO_CONVITE; tentativa += 1) {
            const codigo = (0, campanha_engine_1.gerarCodigoConvite)();
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
                const colisaoCodigo = (0, campanha_engine_1.isUniqueConstraintViolation)(error, ['codigo']);
                if (!colisaoCodigo) {
                    throw error;
                }
                if (tentativa === campanha_engine_types_1.MAX_TENTATIVAS_CODIGO_CONVITE) {
                    throw new campanha_exception_1.ConviteCodigoIndisponivelException(campanhaId, campanha_engine_types_1.MAX_TENTATIVAS_CODIGO_CONVITE);
                }
            }
        }
        throw new campanha_exception_1.ConviteCodigoIndisponivelException(campanhaId, campanha_engine_types_1.MAX_TENTATIVAS_CODIGO_CONVITE);
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
            if ((0, campanha_engine_1.normalizarEmail)(usuario.email) !== (0, campanha_engine_1.normalizarEmail)(convite.email)) {
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
            const membroCriado = await tx.membroCampanha
                .create({
                data: {
                    campanhaId: convite.campanhaId,
                    usuarioId,
                    papel: papelConvite,
                },
            })
                .catch((error) => {
                const conflitoMembro = (0, campanha_engine_1.isUniqueConstraintViolation)(error, [
                    'campanhaId',
                    'usuarioId',
                ]);
                if (conflitoMembro) {
                    throw new campanha_exception_1.UsuarioJaMembroCampanhaException(usuarioId, convite.campanhaId);
                }
                throw error;
            });
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
        if ((0, campanha_engine_1.normalizarEmail)(usuario.email) !== (0, campanha_engine_1.normalizarEmail)(convite.email)) {
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
exports.CampanhaConvitesService = CampanhaConvitesService;
exports.CampanhaConvitesService = CampanhaConvitesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampanhaConvitesService);
//# sourceMappingURL=campanha.convites.service.js.map