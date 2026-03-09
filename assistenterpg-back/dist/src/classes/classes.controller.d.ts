import { ClassesService } from './classes.service';
import { CreateClasseDto } from './dto/create-classe.dto';
import { UpdateClasseDto } from './dto/update-classe.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    create(dto: CreateClasseDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        periciasLivresBase: number;
        fonte: import("@prisma/client").$Enums.TipoFonte;
        suplementoId: number | null;
    }>;
    findAll(): Promise<import("./dto/catalogo-classe.dto").ClasseCatalogoDto[]>;
    findOne(id: number): Promise<import("./dto/catalogo-classe.dto").ClasseCatalogoDto>;
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
