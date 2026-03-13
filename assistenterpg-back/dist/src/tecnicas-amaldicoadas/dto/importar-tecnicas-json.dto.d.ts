export declare class ImportarTecnicasJsonDto {
    schema?: string;
    schemaVersion?: number;
    modo?: 'UPSERT';
    tecnicas: unknown[];
    substituirHabilidadesAusentes?: boolean;
    substituirVariacoesAusentes?: boolean;
}
