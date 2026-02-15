import { AlinhamentosService } from './alinhamentos.service';
export declare class AlinhamentosController {
    private readonly alinhamentosService;
    constructor(alinhamentosService: AlinhamentosService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        nome: string;
        descricao: string | null;
    }[]>;
}
