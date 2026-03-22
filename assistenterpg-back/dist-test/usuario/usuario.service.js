"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const usuario_exception_1 = require("src/common/exceptions/usuario.exception");
const database_exception_1 = require("src/common/exceptions/database.exception");
let UsuarioService = class UsuarioService {
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
    async criarUsuario(apelido, email, senha) {
        try {
            const existente = await this.prisma.usuario.findUnique({
                where: { email },
            });
            if (existente) {
                throw new usuario_exception_1.UsuarioEmailDuplicadoException(email);
            }
            const senhaHash = await bcrypt.hash(senha, 10);
            return this.prisma.usuario.create({
                data: {
                    apelido,
                    email,
                    senhaHash,
                },
                select: {
                    id: true,
                    apelido: true,
                    email: true,
                    role: true,
                    emailVerificadoEm: true,
                    criadoEm: true,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarPorEmail(email) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { email },
                select: {
                    id: true,
                    apelido: true,
                    email: true,
                    senhaHash: true,
                    role: true,
                    emailVerificadoEm: true,
                    criadoEm: true,
                    atualizadoEm: true,
                },
            });
            if (!usuario) {
                throw new usuario_exception_1.UsuarioEmailNaoEncontradoException(email);
            }
            return usuario;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarPorEmailOpcional(email) {
        try {
            return await this.prisma.usuario.findUnique({
                where: { email },
                select: {
                    id: true,
                    apelido: true,
                    email: true,
                    senhaHash: true,
                    role: true,
                    emailVerificadoEm: true,
                    criadoEm: true,
                    atualizadoEm: true,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarPorId(id) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id },
                select: {
                    id: true,
                    apelido: true,
                    email: true,
                    role: true,
                    senhaHash: true,
                    emailVerificadoEm: true,
                    criadoEm: true,
                    atualizadoEm: true,
                },
            });
            if (!usuario) {
                throw new usuario_exception_1.UsuarioNaoEncontradoException(id);
            }
            return usuario;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarPorApelido(apelido) {
        try {
            const usuario = await this.prisma.usuario.findFirst({
                where: { apelido },
                select: {
                    id: true,
                    apelido: true,
                    email: true,
                    role: true,
                    emailVerificadoEm: true,
                    criadoEm: true,
                },
            });
            if (!usuario) {
                throw new usuario_exception_1.UsuarioApelidoNaoEncontradoException(apelido);
            }
            return usuario;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async obterEstatisticas(usuarioId) {
        try {
            const [totalCampanhas, totalPersonagens] = await Promise.all([
                this.prisma.campanha.count({
                    where: {
                        OR: [{ donoId: usuarioId }, { membros: { some: { usuarioId } } }],
                    },
                }),
                this.prisma.personagemBase.count({
                    where: { donoId: usuarioId },
                }),
            ]);
            return {
                campanhas: totalCampanhas,
                personagens: totalPersonagens,
                artigosLidos: 0,
            };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async obterPreferencias(usuarioId) {
        try {
            let preferencias = await this.prisma.preferenciaUsuario.findUnique({
                where: { usuarioId },
            });
            if (!preferencias) {
                preferencias = await this.prisma.preferenciaUsuario.create({
                    data: { usuarioId },
                });
            }
            return preferencias;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async atualizarPreferencias(usuarioId, dto) {
        try {
            return this.prisma.preferenciaUsuario.upsert({
                where: { usuarioId },
                update: dto,
                create: { usuarioId, ...dto },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async alterarSenha(usuarioId, dto) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id: usuarioId },
            });
            if (!usuario) {
                throw new usuario_exception_1.UsuarioNaoEncontradoException(usuarioId);
            }
            const senhaValida = await bcrypt.compare(dto.senhaAtual, usuario.senhaHash);
            if (!senhaValida) {
                throw new usuario_exception_1.UsuarioSenhaIncorretaException('alteracao');
            }
            const novaSenhaHash = await bcrypt.hash(dto.novaSenha, 10);
            await this.prisma.usuario.update({
                where: { id: usuarioId },
                data: { senhaHash: novaSenhaHash },
            });
            return { mensagem: 'Senha alterada com sucesso' };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async atualizarSenhaHash(usuarioId, senhaHash) {
        try {
            await this.prisma.usuario.update({
                where: { id: usuarioId },
                data: { senhaHash },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async marcarEmailComoVerificado(usuarioId) {
        try {
            return await this.prisma.usuario.update({
                where: { id: usuarioId },
                data: {
                    emailVerificadoEm: new Date(),
                },
                select: {
                    id: true,
                    email: true,
                    emailVerificadoEm: true,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async exportarDados(usuarioId) {
        try {
            const [usuario, personagens, campanhas, preferencias] = await Promise.all([
                this.prisma.usuario.findUnique({
                    where: { id: usuarioId },
                    select: {
                        id: true,
                        apelido: true,
                        email: true,
                        role: true,
                        emailVerificadoEm: true,
                        criadoEm: true,
                    },
                }),
                this.prisma.personagemBase.findMany({
                    where: { donoId: usuarioId },
                    include: {
                        classe: true,
                        origem: true,
                        cla: true,
                        trilha: true,
                        caminho: true,
                        tecnicaInata: true,
                    },
                }),
                this.prisma.campanha.findMany({
                    where: {
                        OR: [{ donoId: usuarioId }, { membros: { some: { usuarioId } } }],
                    },
                    include: {
                        membros: {
                            include: {
                                usuario: { select: { apelido: true } },
                            },
                        },
                    },
                }),
                this.prisma.preferenciaUsuario.findUnique({
                    where: { usuarioId },
                }),
            ]);
            return {
                exportadoEm: new Date().toISOString(),
                usuario,
                personagens,
                campanhas,
                preferencias,
            };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async excluirConta(usuarioId, senha) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id: usuarioId },
            });
            if (!usuario) {
                throw new usuario_exception_1.UsuarioNaoEncontradoException(usuarioId);
            }
            const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
            if (!senhaValida) {
                throw new usuario_exception_1.UsuarioSenhaIncorretaException('exclusao');
            }
            await this.prisma.usuario.delete({
                where: { id: usuarioId },
            });
            return { mensagem: 'Conta excluida com sucesso' };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
};
exports.UsuarioService = UsuarioService;
exports.UsuarioService = UsuarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuarioService);
//# sourceMappingURL=usuario.service.js.map