import { CondicoesService } from './condicoes.service';
import { CreateCondicaoDto } from './dto/create-condicao.dto';
import { UpdateCondicaoDto } from './dto/update-condicao.dto';
export declare class CondicoesController {
    private readonly condicoesService;
    constructor(condicoesService: CondicoesService);
    create(createCondicaoDto: CreateCondicaoDto): Promise<{
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
    update(id: number, updateCondicaoDto: UpdateCondicaoDto): Promise<{
        id: number;
        nome: string;
        descricao: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
