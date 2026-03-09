import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    private readonly usuarioService;
    constructor(authService: AuthService, usuarioService: UsuarioService);
    register(dto: RegisterDto): Promise<{
        id: number;
        apelido: string;
        email: string;
        criadoEm: Date;
        role: import("@prisma/client").$Enums.RoleUsuario;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        usuario: {
            id: number;
            email: string;
            apelido: string;
            role: import("@prisma/client").$Enums.RoleUsuario;
        };
    }>;
}
