declare const DURACAO_MODOS: readonly ["ATE_REMOVER", "RODADAS", "TURNOS_ALVO"];
export type DuracaoCondicaoModo = (typeof DURACAO_MODOS)[number];
export declare class AplicarCondicaoSessaoDto {
    condicaoId: number;
    alvoTipo: 'PERSONAGEM' | 'NPC';
    personagemSessaoId?: number;
    npcSessaoId?: number;
    duracaoModo?: DuracaoCondicaoModo;
    duracaoValor?: number;
    origemDescricao?: string;
    observacao?: string;
}
export {};
