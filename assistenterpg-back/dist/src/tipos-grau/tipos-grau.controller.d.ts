import { TiposGrauService } from './tipos-grau.service';
import { CreateTipoGrauDto } from './dto/create-tipo-grau.dto';
import { UpdateTipoGrauDto } from './dto/update-tipo-grau.dto';
export declare class TiposGrauController {
    private readonly tiposGrauService;
    constructor(tiposGrauService: TiposGrauService);
    create(dto: CreateTipoGrauDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
    }>;
    findAll(): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
    }>;
    update(id: number, dto: UpdateTipoGrauDto): Promise<{
        id: number;
        nome: string;
        descricao: string | null;
        codigo: string;
    }>;
    remove(id: number): Promise<{
        sucesso: boolean;
    }>;
}
