import { HabilidadeCatalogoDto } from "src/habilidades/dto/catalogo-habilidade.dto";
export declare class OrigemPericiaCatalogoDto {
    id: number;
    tipo: 'FIXA' | 'ESCOLHA';
    grupoEscolha: number | null;
    pericia: {
        id: number;
        codigo: string;
        nome: string;
        descricao: string | null;
        atributoBase: string;
        somenteTreinada: boolean;
        penalizaPorCarga: boolean;
        precisaKit: boolean;
    };
}
export declare class OrigemCatalogoDto {
    id: number;
    nome: string;
    descricao: string | null;
    requisitosTexto: string | null;
    requerGrandeCla: boolean;
    requerTecnicaHeriditaria: boolean;
    bloqueiaTecnicaHeriditaria: boolean;
    pericias: OrigemPericiaCatalogoDto[];
    habilidadesIniciais: HabilidadeCatalogoDto[];
}
