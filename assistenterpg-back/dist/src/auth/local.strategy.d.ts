import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(email: string, senha: string): Promise<{
        id: number;
        email: string;
        apelido: string;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
}
export {};
