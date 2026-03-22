export declare class AdicionarItemInventarioCampanhaDto {
    equipamentoId: number;
    quantidade?: number;
    equipado?: boolean;
    modificacoes?: number[];
    nomeCustomizado?: string | null;
    notas?: string | null;
}
export declare class AtualizarItemInventarioCampanhaDto {
    quantidade?: number;
    equipado?: boolean;
    nomeCustomizado?: string | null;
    notas?: string | null;
}
export declare class AplicarModificacaoInventarioCampanhaDto {
    modificacaoId: number;
}
