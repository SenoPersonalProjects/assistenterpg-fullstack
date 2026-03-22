import { CreateTecnicaDto } from '../dto/create-tecnica.dto';
import { CreateHabilidadeTecnicaDto } from '../dto/create-habilidade-tecnica.dto';
import { CreateVariacaoHabilidadeDto } from '../dto/create-variacao.dto';
export type RegistroJson = Record<string, unknown>;
export type VariacaoImportNormalizada = Omit<CreateVariacaoHabilidadeDto, 'habilidadeTecnicaId'> & {
    id?: number;
};
export type HabilidadeImportNormalizada = Omit<CreateHabilidadeTecnicaDto, 'tecnicaId'> & {
    id?: number;
    variacoes: VariacaoImportNormalizada[];
};
export type TecnicaImportNormalizada = CreateTecnicaDto & {
    id?: number;
    habilidades: HabilidadeImportNormalizada[];
};
export type ImportacaoTecnicasResumo = {
    schema: string;
    schemaVersion: number;
    modo: 'UPSERT';
    totalRecebido: number;
    tecnicas: {
        criadas: number;
        atualizadas: number;
    };
    habilidades: {
        criadas: number;
        atualizadas: number;
        removidas: number;
    };
    variacoes: {
        criadas: number;
        atualizadas: number;
        removidas: number;
    };
    avisos: string[];
};
export declare const TECNICAS_JSON_SCHEMA = "tecnicas-amaldicoadas.import-export";
export declare const TECNICAS_JSON_SCHEMA_VERSION = 1;
