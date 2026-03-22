import { SuplementosService } from './suplementos.service';
import { CreateSuplementoDto } from './dto/create-suplemento.dto';
import { UpdateSuplementoDto } from './dto/update-suplemento.dto';
import { FiltrarSuplementosDto } from './dto/filtrar-suplementos.dto';
export declare class SuplementosController {
    private readonly suplementosService;
    constructor(suplementosService: SuplementosService);
    findAll(req: {
        user: {
            id: number;
        };
    }, filtros: FiltrarSuplementosDto): Promise<import("./dto/suplemento-catalogo.dto").SuplementoCatalogoDto[]>;
    findOne(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<import("./dto/suplemento-catalogo.dto").SuplementoCatalogoDto>;
    findByCodigo(req: {
        user: {
            id: number;
        };
    }, codigo: string): Promise<import("./dto/suplemento-catalogo.dto").SuplementoCatalogoDto>;
    findMeusSuplemetos(req: {
        user: {
            id: number;
        };
    }): Promise<import("./dto/suplemento-catalogo.dto").SuplementoCatalogoDto[]>;
    ativarSuplemento(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        message: string;
    }>;
    desativarSuplemento(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        message: string;
    }>;
    create(dto: CreateSuplementoDto): Promise<import("./dto/suplemento-catalogo.dto").SuplementoCatalogoDto>;
    update(id: number, dto: UpdateSuplementoDto): Promise<import("./dto/suplemento-catalogo.dto").SuplementoCatalogoDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
