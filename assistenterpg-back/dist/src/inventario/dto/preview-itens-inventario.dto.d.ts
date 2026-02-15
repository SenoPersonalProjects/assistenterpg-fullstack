export declare class ItemPreviewDto {
    equipamentoId: number;
    quantidade: number;
    equipado: boolean;
    modificacoes?: number[];
    nomeCustomizado?: string | null;
}
export declare class PreviewItensInventarioDto {
    forca: number;
    prestigioBase: number;
    itens: ItemPreviewDto[];
}
