declare const PAPEIS_CAMPANHA: readonly ["MESTRE", "JOGADOR", "OBSERVADOR"];
type PapelCampanha = (typeof PAPEIS_CAMPANHA)[number];
export declare class CreateConviteDto {
    email: string;
    papel: PapelCampanha;
}
export {};
