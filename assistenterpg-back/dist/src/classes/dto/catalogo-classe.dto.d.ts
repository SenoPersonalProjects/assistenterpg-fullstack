import { HabilidadeCatalogoDto } from 'src/habilidades/dto/catalogo-habilidade.dto';
export declare class ClassePericiaCatalogoDto {
    id: number;
    tipo: string;
    grupoEscolha: number | null;
    pericia: {
        id: number;
        codigo: string;
        nome: string;
        descricao: string | null;
    };
}
export declare class ClasseProficienciaCatalogoDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tipo: string;
    categoria: string;
    subtipo: string | null;
}
export declare class ClasseCatalogoDto {
    id: number;
    nome: string;
    descricao: string | null;
    fonte: string;
    suplementoId: number | null;
    periciasLivresBase: number;
    pericias: ClassePericiaCatalogoDto[];
    proficiencias: ClasseProficienciaCatalogoDto[];
    habilidadesIniciais: HabilidadeCatalogoDto[];
}
