import { PericiasService } from './pericias.service';
export declare class PericiasController {
    private readonly periciasService;
    constructor(periciasService: PericiasService);
    findAll(): Promise<{
        id: number;
        nome: string;
        descricao: string;
        codigo: string;
        atributoBase: import("@prisma/client").$Enums.AtributoBase;
        somenteTreinada: boolean;
        penalizaPorCarga: boolean;
        precisaKit: boolean;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nome: string;
        descricao: string;
        codigo: string;
        atributoBase: import("@prisma/client").$Enums.AtributoBase;
        somenteTreinada: boolean;
        penalizaPorCarga: boolean;
        precisaKit: boolean;
    }>;
}
