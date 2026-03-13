import { CreatePersonagemBaseDto } from './create-personagem-base.dto';
export declare class ReferenciaCatalogoDto {
    id?: number;
    nome?: string;
    codigo?: string;
}
export declare class ReferenciaPoderGenericoDto {
    index: number;
    habilidadeId?: number;
    habilidadeNome?: string;
}
export declare class ReferenciaPassivaDto {
    index: number;
    passivaId?: number;
    codigo?: string;
    nome?: string;
}
export declare class ReferenciaModificacaoItemDto {
    index: number;
    modificacaoId?: number;
    codigo?: string;
    nome?: string;
}
export declare class ReferenciaItemInventarioDto {
    index: number;
    equipamentoId?: number;
    equipamentoCodigo?: string;
    equipamentoNome?: string;
    modificacoes?: ReferenciaModificacaoItemDto[];
}
export declare class ReferenciasImportacaoPersonagemDto {
    personagemIdOriginal?: number;
    cla?: ReferenciaCatalogoDto;
    origem?: ReferenciaCatalogoDto;
    classe?: ReferenciaCatalogoDto;
    trilha?: ReferenciaCatalogoDto;
    caminho?: ReferenciaCatalogoDto;
    alinhamento?: ReferenciaCatalogoDto;
    tecnicaInata?: ReferenciaCatalogoDto;
    poderesGenericos?: ReferenciaPoderGenericoDto[];
    passivas?: ReferenciaPassivaDto[];
    itensInventario?: ReferenciaItemInventarioDto[];
}
export declare class ImportarPersonagemBaseDto {
    schema?: string;
    schemaVersion?: number;
    exportadoEm?: string;
    nomeSobrescrito?: string;
    personagem: CreatePersonagemBaseDto;
    referencias?: ReferenciasImportacaoPersonagemDto;
}
