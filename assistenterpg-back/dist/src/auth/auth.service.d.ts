import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import { RoleUsuario } from '@prisma/client';
export declare class AuthService {
    private readonly usuarioService;
    private readonly jwtService;
    constructor(usuarioService: UsuarioService, jwtService: JwtService);
    validarUsuario(email: string, senha: string): Promise<{
        id: number;
        email: string;
        apelido: string;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    login(usuario: {
        id: number;
        email: string;
        apelido: string;
        role: RoleUsuario;
    }): Promise<{
        access_token: string;
        usuario: {
            id: number;
            email: string;
            apelido: string;
            role: import("@prisma/client").$Enums.RoleUsuario;
        };
    }>;
}
