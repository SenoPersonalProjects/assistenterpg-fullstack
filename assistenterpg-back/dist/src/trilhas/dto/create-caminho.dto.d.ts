export declare class HabilidadeCaminhoDto {
    habilidadeId: number;
    nivelConcedido: number;
}
export declare class CreateCaminhoDto {
    trilhaId: number;
    nome: string;
    descricao?: string;
    habilidades?: HabilidadeCaminhoDto[];
}
