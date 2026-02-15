import { PrismaService } from '../prisma/prisma.service';
import { CreateProficienciaDto } from './dto/create-proficiencia.dto';
import { UpdateProficienciaDto } from './dto/update-proficiencia.dto';
export declare class ProficienciasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProficienciaDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
        tipo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
        tipo: string;
        categoria: string;
        subtipo: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
        tipo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    update(id: number, dto: UpdateProficienciaDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
        tipo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    remove(id: number): Promise<{
        sucesso: boolean;
    }>;
}
