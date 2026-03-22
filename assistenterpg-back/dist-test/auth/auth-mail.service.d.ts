type EnviarRecuperacaoInput = {
    email: string;
    apelido: string;
    linkRecuperacao: string;
    expiraEm: Date;
};
type EnviarVerificacaoInput = {
    email: string;
    apelido: string;
    linkVerificacao: string;
    expiraEm: Date;
};
export declare class AuthMailService {
    private readonly logger;
    private transporter;
    enviarRecuperacaoSenha(input: EnviarRecuperacaoInput): Promise<void>;
    enviarVerificacaoEmail(input: EnviarVerificacaoInput): Promise<void>;
    private enviarEmail;
    private obterModo;
    private getTransporter;
    private getRemetenteFormatado;
    private enviarEmailResend;
    private formatarDataHora;
    private escapeHtml;
    private renderTemplate;
}
export {};
