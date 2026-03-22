import { PrismaService } from '../prisma/prisma.service';
import { TecnicasAmaldicoadasMapper } from './tecnicas-amaldicoadas.mapper';
import { TecnicasAmaldicoadasPersistence } from './tecnicas-amaldicoadas.persistence';
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';
import { TecnicaDetalhadaDto } from './dto/tecnica-detalhada.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { TecnicasAmaldicoadasValidationsService } from './tecnicas-amaldicoadas.validations.service';
import { TecnicasAmaldicoadasClasService } from './tecnicas-amaldicoadas.clas.service';
export declare class TecnicasAmaldicoadasCrudService {
    private readonly prisma;
    private readonly mapper;
    private readonly persistence;
    private readonly validationsService;
    private readonly clasService;
    constructor(prisma: PrismaService, mapper: TecnicasAmaldicoadasMapper, persistence: TecnicasAmaldicoadasPersistence, validationsService: TecnicasAmaldicoadasValidationsService, clasService: TecnicasAmaldicoadasClasService);
    findAllTecnicas(filtros: FiltrarTecnicasDto): Promise<TecnicaDetalhadaDto[]>;
    findOneTecnica(id: number): Promise<TecnicaDetalhadaDto>;
    findTecnicaByCodigo(codigo: string): Promise<TecnicaDetalhadaDto>;
    createTecnica(dto: CreateTecnicaDto): Promise<TecnicaDetalhadaDto>;
    updateTecnica(id: number, dto: UpdateTecnicaDto): Promise<TecnicaDetalhadaDto>;
    removeTecnica(id: number): Promise<void>;
    findTecnicasByCla(claId: number): Promise<TecnicaDetalhadaDto[]>;
}
