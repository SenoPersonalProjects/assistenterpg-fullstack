import { PrismaService } from '../prisma/prisma.service';
import { CreateClasseDto } from './dto/create-classe.dto';
import { UpdateClasseDto } from './dto/update-classe.dto';
import { ClasseCatalogoDto } from './dto/catalogo-classe.dto';
export declare class ClassesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClasseDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        periciasLivresBase: number;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    }>;
    private mapToCatalogo;
    findAll(): Promise<ClasseCatalogoDto[]>;
    findOne(id: number): Promise<ClasseCatalogoDto>;
    findTrilhas(id: number): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        classeId: number;
    }[]>;
    update(id: number, dto: UpdateClasseDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        periciasLivresBase: number;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    }>;
    remove(id: number): Promise<{
        sucesso: boolean;
    }>;
}
