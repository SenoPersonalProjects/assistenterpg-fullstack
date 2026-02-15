export declare class EquipamentoResumoDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tipo: string;
    categoria: number;
    espacos: number;
    complexidadeMaldicao: string;
    proficienciaArma?: string | null;
    proficienciaProtecao?: string | null;
    alcance?: string | null;
    tipoAcessorio?: string | null;
    tipoArma?: string | null;
    subtipoDistancia?: string | null;
    tipoUso?: string | null;
    tipoAmaldicoado?: string | null;
    efeito?: string | null;
    armaAmaldicoada?: {
        id: number;
        tipoBase: string;
    } | null;
    protecaoAmaldicoada?: {
        id: number;
        tipoBase: string;
        bonusDefesa: number;
    } | null;
    artefatoAmaldicoado?: {
        id: number;
        tipoBase: string;
    } | null;
}
