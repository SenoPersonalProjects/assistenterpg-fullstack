import { ProficienciasService } from './proficiencias.service';
import { CreateProficienciaDto } from './dto/create-proficiencia.dto';
import { UpdateProficienciaDto } from './dto/update-proficiencia.dto';
export declare class ProficienciasController {
    private readonly proficienciasService;
    constructor(proficienciasService: ProficienciasService);
    create(dto: CreateProficienciaDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        tipo: string;
        codigo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        tipo: string;
        codigo: string;
        categoria: string;
        subtipo: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        tipo: string;
        codigo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    update(id: number, dto: UpdateProficienciaDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        tipo: string;
        codigo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    remove(id: number): Promise<{
        sucesso: boolean;
    }>;
}
