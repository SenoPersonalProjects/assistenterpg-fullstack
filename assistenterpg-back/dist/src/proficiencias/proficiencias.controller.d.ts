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
    findOne(id: string): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
        tipo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    update(id: string, dto: UpdateProficienciaDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
        tipo: string;
        categoria: string;
        subtipo: string | null;
    }>;
    remove(id: string): Promise<{
        sucesso: boolean;
    }>;
}
