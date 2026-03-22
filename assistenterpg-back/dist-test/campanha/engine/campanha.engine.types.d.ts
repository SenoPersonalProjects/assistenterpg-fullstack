import { CampoModificadorPersonagemCampanha } from '@prisma/client';
export declare const MAX_TENTATIVAS_CODIGO_CONVITE = 5;
export type PapelCampanha = 'MESTRE' | 'JOGADOR' | 'OBSERVADOR';
export type PrismaUniqueErrorLike = {
    code?: string;
    meta?: {
        target?: string | string[];
    };
};
export type CampoPersonagemCampanhaNumerico = 'pvMax' | 'peMax' | 'eaMax' | 'sanMax' | 'defesaBase' | 'defesaEquipamento' | 'defesaOutros' | 'esquiva' | 'bloqueio' | 'deslocamento' | 'limitePeEaPorTurno' | 'prestigioGeral' | 'prestigioCla';
export type CampoRecursoAtual = 'pvAtual' | 'peAtual' | 'eaAtual' | 'sanAtual';
export type FiltrosListarModificadoresCampanha = {
    sessaoId?: number;
    cenaId?: number;
};
export type ConfigCampoModificador = {
    campoBanco: CampoPersonagemCampanhaNumerico;
    campoRecursoAtual?: CampoRecursoAtual;
    minimo?: number;
};
export declare const CONFIG_MODIFICADOR_CAMPO: Record<CampoModificadorPersonagemCampanha, ConfigCampoModificador>;
