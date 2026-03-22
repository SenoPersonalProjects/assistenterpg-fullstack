import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsuarioService } from '../usuario/usuario.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usuarioService;
    constructor(usuarioService: UsuarioService, configService: ConfigService);
    validate(payload: {
        sub: number;
        email: string;
    }): Promise<{
        id: number;
        email: string;
        apelido: string;
        role: import("@prisma/client").$Enums.RoleUsuario;
    }>;
}
export {};
