export declare class OrdemIniciativaItemDto {
    tipoParticipante: 'PERSONAGEM' | 'NPC';
    id: number;
}
export declare class AtualizarOrdemIniciativaSessaoDto {
    ordem: OrdemIniciativaItemDto[];
    indiceTurnoAtual?: number;
}
