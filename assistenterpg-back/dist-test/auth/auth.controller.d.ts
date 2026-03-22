import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: number;
        email: string;
        apelido: string;
        emailVerificadoEm: Date | null;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        usuario: {
            id: number;
            email: string;
            apelido: string;
            role: import("@prisma/client").$Enums.RoleUsuario;
            emailVerificado: boolean;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        mensagem: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        mensagem: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        mensagem: string;
    }>;
    resendVerificationEmail(dto: ResendVerificationEmailDto): Promise<{
        mensagem: string;
    }>;
}
