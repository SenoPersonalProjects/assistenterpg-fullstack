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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const auth_exception_1 = require("../common/exceptions/auth.exception");
const usuario_service_1 = require("../usuario/usuario.service");
const auth_token_service_1 = require("./auth-token.service");
const auth_mail_service_1 = require("./auth-mail.service");
const MENSAGEM_RECUPERACAO = 'Se o email existir, enviaremos as instrucoes de recuperacao.';
const MENSAGEM_REENVIO_VERIFICACAO = 'Se o email existir e ainda nao estiver verificado, enviaremos um novo link de verificacao.';
let AuthService = AuthService_1 = class AuthService {
    usuarioService;
    jwtService;
    authTokenService;
    authMailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usuarioService, jwtService, authTokenService, authMailService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
        this.authTokenService = authTokenService;
        this.authMailService = authMailService;
    }
    async register(dto) {
        const email = this.normalizarEmail(dto.email);
        const usuario = await this.usuarioService.criarUsuario(dto.apelido, email, dto.senha);
        await this.enviarEmailVerificacao(usuario.id, usuario.email, usuario.apelido);
        return usuario;
    }
    async validarUsuario(email, senha) {
        let usuario;
        try {
            usuario = await this.usuarioService.buscarPorEmail(this.normalizarEmail(email));
        }
        catch {
            throw new auth_exception_1.CredenciaisInvalidasException();
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
        if (!senhaValida) {
            throw new auth_exception_1.CredenciaisInvalidasException();
        }
        if (!usuario.emailVerificadoEm) {
            throw new auth_exception_1.AuthEmailNaoVerificadoException();
        }
        const { senhaHash, ...usuarioSemSenha } = usuario;
        void senhaHash;
        return usuarioSemSenha;
    }
    async login(usuario) {
        const payload = { sub: usuario.id, email: usuario.email };
        const token = await this.jwtService.signAsync(payload);
        return {
            access_token: token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                apelido: usuario.apelido,
                role: usuario.role,
                emailVerificado: Boolean(usuario.emailVerificadoEm),
            },
        };
    }
    async solicitarRecuperacaoSenha(email) {
        const emailNormalizado = this.normalizarEmail(email);
        const usuario = await this.usuarioService.buscarPorEmailOpcional(emailNormalizado);
        if (!usuario) {
            return { mensagem: MENSAGEM_RECUPERACAO };
        }
        await this.authTokenService.invalidarTokensAtivos(usuario.id, client_1.TipoTokenAuth.RECUPERACAO_SENHA);
        const { token, expiraEm } = await this.authTokenService.gerarToken(usuario.id, client_1.TipoTokenAuth.RECUPERACAO_SENHA, this.obterResetTokenTtlMinutos());
        const linkRecuperacao = this.montarLinkFront('/auth/reset-password', token);
        try {
            await this.authMailService.enviarRecuperacaoSenha({
                email: usuario.email,
                apelido: usuario.apelido,
                linkRecuperacao,
                expiraEm,
            });
        }
        catch (error) {
            this.logger.error(`Falha ao enviar email de recuperacao para usuarioId=${usuario.id}`, error instanceof Error ? error.stack : undefined);
        }
        return { mensagem: MENSAGEM_RECUPERACAO };
    }
    async redefinirSenha(token, novaSenha) {
        const tokenConsumido = await this.authTokenService.consumirToken(token, client_1.TipoTokenAuth.RECUPERACAO_SENHA);
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await this.usuarioService.atualizarSenhaHash(tokenConsumido.usuarioId, novaSenhaHash);
        await this.authTokenService.invalidarTokensAtivos(tokenConsumido.usuarioId, client_1.TipoTokenAuth.RECUPERACAO_SENHA);
        return { mensagem: 'Senha redefinida com sucesso.' };
    }
    async verificarEmail(token) {
        const tokenConsumido = await this.authTokenService.consumirToken(token, client_1.TipoTokenAuth.VERIFICACAO_EMAIL);
        await this.usuarioService.marcarEmailComoVerificado(tokenConsumido.usuarioId);
        await this.authTokenService.invalidarTokensAtivos(tokenConsumido.usuarioId, client_1.TipoTokenAuth.VERIFICACAO_EMAIL);
        return { mensagem: 'Email verificado com sucesso.' };
    }
    async reenviarVerificacaoEmail(email) {
        const emailNormalizado = this.normalizarEmail(email);
        const usuario = await this.usuarioService.buscarPorEmailOpcional(emailNormalizado);
        if (!usuario || usuario.emailVerificadoEm) {
            return { mensagem: MENSAGEM_REENVIO_VERIFICACAO };
        }
        await this.enviarEmailVerificacao(usuario.id, usuario.email, usuario.apelido);
        return { mensagem: MENSAGEM_REENVIO_VERIFICACAO };
    }
    async enviarEmailVerificacao(usuarioId, email, apelido) {
        await this.authTokenService.invalidarTokensAtivos(usuarioId, client_1.TipoTokenAuth.VERIFICACAO_EMAIL);
        const { token, expiraEm } = await this.authTokenService.gerarToken(usuarioId, client_1.TipoTokenAuth.VERIFICACAO_EMAIL, this.obterVerificacaoTokenTtlMinutos());
        const linkVerificacao = this.montarLinkFront('/auth/verify-email', token);
        try {
            await this.authMailService.enviarVerificacaoEmail({
                email,
                apelido,
                linkVerificacao,
                expiraEm,
            });
        }
        catch (error) {
            this.logger.error(`Falha ao enviar email de verificacao para usuarioId=${usuarioId}`, error instanceof Error ? error.stack : undefined);
        }
    }
    montarLinkFront(path, token) {
        const base = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(/\/$/, '');
        return `${base}${path}?token=${encodeURIComponent(token)}`;
    }
    obterResetTokenTtlMinutos() {
        const valor = Number(process.env.AUTH_RESET_TOKEN_TTL_MINUTES ?? 30);
        return Number.isFinite(valor) && valor > 0 ? valor : 30;
    }
    obterVerificacaoTokenTtlMinutos() {
        const valor = Number(process.env.AUTH_VERIFY_TOKEN_TTL_MINUTES ?? 1440);
        return Number.isFinite(valor) && valor > 0 ? valor : 1440;
    }
    normalizarEmail(email) {
        return email.trim().toLowerCase();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService,
        jwt_1.JwtService,
        auth_token_service_1.AuthTokenService,
        auth_mail_service_1.AuthMailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map