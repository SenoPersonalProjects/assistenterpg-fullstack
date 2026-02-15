import { PrismaService } from '../prisma/prisma.service';
export declare class PericiasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
