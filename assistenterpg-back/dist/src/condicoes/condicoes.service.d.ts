import { PrismaService } from '../prisma/prisma.service';
import { CreateCondicaoDto } from './dto/create-condicao.dto';
import { UpdateCondicaoDto } from './dto/update-condicao.dto';
export declare class CondicoesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateCondicaoDto): Promise<{
        id: number;
        nome: string;
        descricao: string;
    }>;
    findAll(): Promise<({
        _count: {
            condicoesPersonagemSessao: number;
        };
    } & {
        id: number;
        nome: string;
        descricao: string;
    })[]>;
    findOne(id: number): Promise<{
        _count: {
            condicoesPersonagemSessao: number;
        };
    } & {
        id: number;
        nome: string;
        descricao: string;
    }>;
    update(id: number, updateDto: UpdateCondicaoDto): Promise<{
        id: number;
        nome: string;
        descricao: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
