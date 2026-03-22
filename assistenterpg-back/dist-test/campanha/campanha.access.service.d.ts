import { PrismaService } from '../prisma/prisma.service';
export declare class CampanhaAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    garantirAcesso(campanhaId: number, usuarioId: number): Promise<{
        campanha: {
            id: number;
            membros: {
                usuarioId: number;
                papel: string;
            }[];
            donoId: number;
        };
        ehDono: boolean;
        ehMestre: boolean;
        papel: string | null;
    }>;
    obterPersonagemCampanhaComPermissao(campanhaId: number, personagemCampanhaId: number, usuarioId: number, exigirPermissaoEdicao: boolean): Promise<{
        acesso: {
            campanha: {
                id: number;
                membros: {
                    usuarioId: number;
                    papel: string;
                }[];
                donoId: number;
            };
            ehDono: boolean;
            ehMestre: boolean;
            papel: string | null;
        };
        personagem: {
            id: number;
            donoId: number;
            defesaBase: number;
            defesaEquipamento: number;
            defesaOutros: number;
            deslocamento: number;
            limitePeEaPorTurno: number;
            bloqueio: number;
            esquiva: number;
            campanhaId: number;
            pvAtual: number;
            peAtual: number;
            eaAtual: number;
            sanAtual: number;
            pvMax: number;
            peMax: number;
            eaMax: number;
            sanMax: number;
            prestigioGeral: number;
            prestigioCla: number | null;
        };
    }>;
}
