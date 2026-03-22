import { JwtService } from '@nestjs/jwt';
import { RoleUsuario } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { AuthTokenService } from './auth-token.service';
import { AuthMailService } from './auth-mail.service';
type UsuarioAutenticavel = {
    id: number;
    email: string;
    apelido: string;
    role: RoleUsuario;
    emailVerificadoEm: Date | null;
};
export declare class AuthService {
    private readonly usuarioService;
    private readonly jwtService;
    private readonly authTokenService;
    private readonly authMailService;
    private readonly logger;
    constructor(usuarioService: UsuarioService, jwtService: JwtService, authTokenService: AuthTokenService, authMailService: AuthMailService);
    register(dto: RegisterDto): Promise<{
        id: number;
        email: string;
        apelido: string;
        emailVerificadoEm: Date | null;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
    }>;
    validarUsuario(email: string, senha: string): Promise<UsuarioAutenticavel>;
    login(usuario: {
        id: number;
        email: string;
        apelido: string;
        role: RoleUsuario;
        emailVerificadoEm?: Date | null;
    }): Promise<{
        access_token: string;
        usuario: {
            id: number;
            email: string;
            apelido: string;
            role: import("@prisma/client").$Enums.RoleUsuario;
            emailVerificado: boolean;
        };
    }>;
    solicitarRecuperacaoSenha(email: string): Promise<{
        mensagem: string;
    }>;
    redefinirSenha(token: string, novaSenha: string): Promise<{
        mensagem: string;
    }>;
    verificarEmail(token: string): Promise<{
        mensagem: string;
    }>;
    reenviarVerificacaoEmail(email: string): Promise<{
        mensagem: string;
    }>;
    private enviarEmailVerificacao;
    private montarLinkFront;
    private obterResetTokenTtlMinutos;
    private obterVerificacaoTokenTtlMinutos;
    private normalizarEmail;
}
export {};
