declare const TIPOS_CENA: readonly ["LIVRE", "INVESTIGACAO", "FURTIVIDADE", "COMBATE", "PERSEGUICAO", "BASE", "OUTRA"];
export type TipoCenaSessao = (typeof TIPOS_CENA)[number];
export declare class AtualizarCenaSessaoDto {
    tipo: TipoCenaSessao;
    nome?: string;
    limitesCategoriaAtivo?: boolean;
}
export {};
