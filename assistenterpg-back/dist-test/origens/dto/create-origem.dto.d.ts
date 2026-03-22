import { TipoFonte } from '@prisma/client';
export declare class OrigemPericiaDto {
    periciaId: number;
    tipo: 'FIXA' | 'ESCOLHA';
    grupoEscolha?: number;
}
export declare class CreateOrigemDto {
    nome: string;
    descricao?: string;
    requisitosTexto?: string;
    requerGrandeCla?: boolean;
    requerTecnicaHeriditaria?: boolean;
    bloqueiaTecnicaHeriditaria?: boolean;
    fonte?: TipoFonte;
    suplementoId?: number;
    pericias?: OrigemPericiaDto[];
    habilidadesIds?: number[];
}
