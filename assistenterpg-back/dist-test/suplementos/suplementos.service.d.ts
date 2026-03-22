import { PrismaService } from '../prisma/prisma.service';
import { CreateSuplementoDto } from './dto/create-suplemento.dto';
import { UpdateSuplementoDto } from './dto/update-suplemento.dto';
import { FiltrarSuplementosDto } from './dto/filtrar-suplementos.dto';
import { SuplementoCatalogoDto } from './dto/suplemento-catalogo.dto';
export declare class SuplementosService {
    private prisma;
    constructor(prisma: PrismaService);
    private tratarErroPrisma;
    private mapearTags;
    findAll(filtros: FiltrarSuplementosDto, usuarioId?: number): Promise<SuplementoCatalogoDto[]>;
    findOne(id: number, usuarioId?: number): Promise<SuplementoCatalogoDto>;
    findByCodigo(codigo: string, usuarioId?: number): Promise<SuplementoCatalogoDto>;
    create(dto: CreateSuplementoDto): Promise<SuplementoCatalogoDto>;
    update(id: number, dto: UpdateSuplementoDto): Promise<SuplementoCatalogoDto>;
    remove(id: number): Promise<void>;
    findSuplementosAtivos(usuarioId: number): Promise<SuplementoCatalogoDto[]>;
    ativarSuplemento(usuarioId: number, suplementoId: number): Promise<void>;
    desativarSuplemento(usuarioId: number, suplementoId: number): Promise<void>;
    private mapToDto;
}
