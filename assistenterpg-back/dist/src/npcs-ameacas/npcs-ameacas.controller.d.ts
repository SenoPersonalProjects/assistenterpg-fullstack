import { CreateNpcAmeacaDto } from './dto/create-npc-ameaca.dto';
import { ListarNpcsAmeacasDto } from './dto/listar-npcs-ameacas.dto';
import { UpdateNpcAmeacaDto } from './dto/update-npc-ameaca.dto';
import { NpcsAmeacasService } from './npcs-ameacas.service';
export declare class NpcsAmeacasController {
    private readonly npcsAmeacasService;
    constructor(npcsAmeacasService: NpcsAmeacasService);
    criar(req: {
        user: {
            id: number;
        };
    }, dto: CreateNpcAmeacaDto): Promise<{
        donoId: number;
        agilidade: number;
        forca: number;
        intelecto: number;
        presenca: number;
        vigor: number;
        percepcao: number;
        iniciativa: number;
        fortitude: number;
        reflexos: number;
        vontade: number;
        luta: number;
        jujutsu: number;
        percepcaoDados: number;
        iniciativaDados: number;
        fortitudeDados: number;
        reflexosDados: number;
        vontadeDados: number;
        lutaDados: number;
        jujutsuDados: number;
        machucado: number | null;
        deslocamentoMetros: number;
        periciasEspeciais: import("@prisma/client/runtime/library").JsonObject[];
        resistencias: string[];
        vulnerabilidades: string[];
        passivas: import("@prisma/client/runtime/library").JsonObject[];
        acoes: import("@prisma/client/runtime/library").JsonObject[];
        usoTatico: string | null;
        id: number;
        nome: string;
        descricao: string | null;
        fichaTipo: import("@prisma/client").$Enums.TipoFichaNpcAmeaca;
        tipo: import("@prisma/client").$Enums.TipoNpcAmeaca;
        tamanho: import("@prisma/client").$Enums.TamanhoNpcAmeaca;
        vd: number;
        defesa: number;
        pontosVida: number;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    listarMeus(req: {
        user: {
            id: number;
        };
    }, query: ListarNpcsAmeacasDto): Promise<{
        items: {
            id: number;
            nome: string;
            descricao: string | null;
            fichaTipo: import("@prisma/client").$Enums.TipoFichaNpcAmeaca;
            tipo: import("@prisma/client").$Enums.TipoNpcAmeaca;
            tamanho: import("@prisma/client").$Enums.TamanhoNpcAmeaca;
            vd: number;
            defesa: number;
            pontosVida: number;
            criadoEm: Date;
            atualizadoEm: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    buscarPorId(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        donoId: number;
        agilidade: number;
        forca: number;
        intelecto: number;
        presenca: number;
        vigor: number;
        percepcao: number;
        iniciativa: number;
        fortitude: number;
        reflexos: number;
        vontade: number;
        luta: number;
        jujutsu: number;
        percepcaoDados: number;
        iniciativaDados: number;
        fortitudeDados: number;
        reflexosDados: number;
        vontadeDados: number;
        lutaDados: number;
        jujutsuDados: number;
        machucado: number | null;
        deslocamentoMetros: number;
        periciasEspeciais: import("@prisma/client/runtime/library").JsonObject[];
        resistencias: string[];
        vulnerabilidades: string[];
        passivas: import("@prisma/client/runtime/library").JsonObject[];
        acoes: import("@prisma/client/runtime/library").JsonObject[];
        usoTatico: string | null;
        id: number;
        nome: string;
        descricao: string | null;
        fichaTipo: import("@prisma/client").$Enums.TipoFichaNpcAmeaca;
        tipo: import("@prisma/client").$Enums.TipoNpcAmeaca;
        tamanho: import("@prisma/client").$Enums.TamanhoNpcAmeaca;
        vd: number;
        defesa: number;
        pontosVida: number;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    atualizar(req: {
        user: {
            id: number;
        };
    }, id: number, dto: UpdateNpcAmeacaDto): Promise<{
        donoId: number;
        agilidade: number;
        forca: number;
        intelecto: number;
        presenca: number;
        vigor: number;
        percepcao: number;
        iniciativa: number;
        fortitude: number;
        reflexos: number;
        vontade: number;
        luta: number;
        jujutsu: number;
        percepcaoDados: number;
        iniciativaDados: number;
        fortitudeDados: number;
        reflexosDados: number;
        vontadeDados: number;
        lutaDados: number;
        jujutsuDados: number;
        machucado: number | null;
        deslocamentoMetros: number;
        periciasEspeciais: import("@prisma/client/runtime/library").JsonObject[];
        resistencias: string[];
        vulnerabilidades: string[];
        passivas: import("@prisma/client/runtime/library").JsonObject[];
        acoes: import("@prisma/client/runtime/library").JsonObject[];
        usoTatico: string | null;
        id: number;
        nome: string;
        descricao: string | null;
        fichaTipo: import("@prisma/client").$Enums.TipoFichaNpcAmeaca;
        tipo: import("@prisma/client").$Enums.TipoNpcAmeaca;
        tamanho: import("@prisma/client").$Enums.TamanhoNpcAmeaca;
        vd: number;
        defesa: number;
        pontosVida: number;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    remover(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        message: string;
        id: number;
    }>;
}
