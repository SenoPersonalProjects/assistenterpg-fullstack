export declare class CreateArtigoDto {
    codigo: string;
    titulo: string;
    resumo?: string;
    conteudo: string;
    subcategoriaId: number;
    ordem?: number;
    tags?: string[];
    palavrasChave?: string;
    nivelDificuldade?: 'iniciante' | 'intermediario' | 'avancado';
    artigosRelacionados?: string[];
    ativo?: boolean;
    destaque?: boolean;
}
