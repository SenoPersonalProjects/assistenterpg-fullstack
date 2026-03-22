export type HomebrewTrilhaHabilidadeDto = {
    nivel: number;
    [key: string]: unknown;
};
export declare class HomebrewTrilhaDto {
    classeId: number;
    nivelRequisito?: number;
    habilidades: HomebrewTrilhaHabilidadeDto[];
}
