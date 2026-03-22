import type { CampoModificadorPersonagemCampanha } from './personagem-campanha-campo-modificador.const';
export declare class AplicarModificadorPersonagemCampanhaDto {
    campo: CampoModificadorPersonagemCampanha;
    valor: number;
    nome: string;
    descricao?: string;
    sessaoId?: number;
    cenaId?: number;
}
