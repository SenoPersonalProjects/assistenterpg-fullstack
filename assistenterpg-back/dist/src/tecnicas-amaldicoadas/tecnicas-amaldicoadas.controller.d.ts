import { TecnicasAmaldicoadasService } from './tecnicas-amaldicoadas.service';
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';
import { CreateHabilidadeTecnicaDto } from './dto/create-habilidade-tecnica.dto';
import { UpdateHabilidadeTecnicaDto } from './dto/update-habilidade-tecnica.dto';
import { CreateVariacaoHabilidadeDto } from './dto/create-variacao.dto';
import { UpdateVariacaoHabilidadeDto } from './dto/update-variacao.dto';
export declare class TecnicasAmaldicoadasController {
    private readonly service;
    constructor(service: TecnicasAmaldicoadasService);
    findAllTecnicas(filtros: FiltrarTecnicasDto): Promise<import("./dto/tecnica-detalhada.dto").TecnicaDetalhadaDto[]>;
    findTecnicaByCodigo(codigo: string): Promise<import("./dto/tecnica-detalhada.dto").TecnicaDetalhadaDto>;
    findTecnicasByCla(claId: number): Promise<import("./dto/tecnica-detalhada.dto").TecnicaDetalhadaDto[]>;
    findOneTecnica(id: number): Promise<import("./dto/tecnica-detalhada.dto").TecnicaDetalhadaDto>;
    createTecnica(req: {
        user: {
            id: number;
        };
    }, dto: CreateTecnicaDto): Promise<import("./dto/tecnica-detalhada.dto").TecnicaDetalhadaDto>;
    updateTecnica(req: {
        user: {
            id: number;
        };
    }, id: number, dto: UpdateTecnicaDto): Promise<import("./dto/tecnica-detalhada.dto").TecnicaDetalhadaDto>;
    removeTecnica(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        sucesso: boolean;
    }>;
    findAllHabilidades(tecnicaId: number): Promise<({
        variacoes: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            requisitos: import("@prisma/client/runtime/library").JsonValue | null;
            ordem: number;
            criticoValor: number | null;
            criticoMultiplicador: number | null;
            alcance: string | null;
            execucao: import("@prisma/client").$Enums.TipoExecucao | null;
            area: import("@prisma/client").$Enums.AreaEfeito | null;
            alvo: string | null;
            duracao: string | null;
            resistencia: string | null;
            dtResistencia: string | null;
            custoPE: number | null;
            custoEA: number | null;
            danoFlat: number | null;
            danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
            dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
            escalonaPorGrau: boolean | null;
            escalonamentoCustoEA: number | null;
            escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
            habilidadeTecnicaId: number;
            substituiCustos: boolean;
            efeitoAdicional: string | null;
        }[];
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        codigo: string;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        efeito: string;
        tecnicaId: number;
        execucao: import("@prisma/client").$Enums.TipoExecucao;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number;
        custoEA: number;
        testesExigidos: import("@prisma/client/runtime/library").JsonValue | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean;
        grauTipoGrauCodigo: string | null;
        escalonamentoCustoEA: number;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOneHabilidade(id: number): Promise<{
        tecnica: {
            id: number;
            nome: string;
            codigo: string;
        };
        variacoes: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            requisitos: import("@prisma/client/runtime/library").JsonValue | null;
            ordem: number;
            criticoValor: number | null;
            criticoMultiplicador: number | null;
            alcance: string | null;
            execucao: import("@prisma/client").$Enums.TipoExecucao | null;
            area: import("@prisma/client").$Enums.AreaEfeito | null;
            alvo: string | null;
            duracao: string | null;
            resistencia: string | null;
            dtResistencia: string | null;
            custoPE: number | null;
            custoEA: number | null;
            danoFlat: number | null;
            danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
            dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
            escalonaPorGrau: boolean | null;
            escalonamentoCustoEA: number | null;
            escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
            habilidadeTecnicaId: number;
            substituiCustos: boolean;
            efeitoAdicional: string | null;
        }[];
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        codigo: string;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        efeito: string;
        tecnicaId: number;
        execucao: import("@prisma/client").$Enums.TipoExecucao;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number;
        custoEA: number;
        testesExigidos: import("@prisma/client/runtime/library").JsonValue | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean;
        grauTipoGrauCodigo: string | null;
        escalonamentoCustoEA: number;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createHabilidade(req: {
        user: {
            id: number;
        };
    }, dto: CreateHabilidadeTecnicaDto): Promise<{
        variacoes: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            requisitos: import("@prisma/client/runtime/library").JsonValue | null;
            ordem: number;
            criticoValor: number | null;
            criticoMultiplicador: number | null;
            alcance: string | null;
            execucao: import("@prisma/client").$Enums.TipoExecucao | null;
            area: import("@prisma/client").$Enums.AreaEfeito | null;
            alvo: string | null;
            duracao: string | null;
            resistencia: string | null;
            dtResistencia: string | null;
            custoPE: number | null;
            custoEA: number | null;
            danoFlat: number | null;
            danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
            dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
            escalonaPorGrau: boolean | null;
            escalonamentoCustoEA: number | null;
            escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
            habilidadeTecnicaId: number;
            substituiCustos: boolean;
            efeitoAdicional: string | null;
        }[];
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        codigo: string;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        efeito: string;
        tecnicaId: number;
        execucao: import("@prisma/client").$Enums.TipoExecucao;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number;
        custoEA: number;
        testesExigidos: import("@prisma/client/runtime/library").JsonValue | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean;
        grauTipoGrauCodigo: string | null;
        escalonamentoCustoEA: number;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateHabilidade(req: {
        user: {
            id: number;
        };
    }, id: number, dto: UpdateHabilidadeTecnicaDto): Promise<{
        variacoes: {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            descricao: string;
            requisitos: import("@prisma/client/runtime/library").JsonValue | null;
            ordem: number;
            criticoValor: number | null;
            criticoMultiplicador: number | null;
            alcance: string | null;
            execucao: import("@prisma/client").$Enums.TipoExecucao | null;
            area: import("@prisma/client").$Enums.AreaEfeito | null;
            alvo: string | null;
            duracao: string | null;
            resistencia: string | null;
            dtResistencia: string | null;
            custoPE: number | null;
            custoEA: number | null;
            danoFlat: number | null;
            danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
            dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
            escalonaPorGrau: boolean | null;
            escalonamentoCustoEA: number | null;
            escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
            habilidadeTecnicaId: number;
            substituiCustos: boolean;
            efeitoAdicional: string | null;
        }[];
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        codigo: string;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        efeito: string;
        tecnicaId: number;
        execucao: import("@prisma/client").$Enums.TipoExecucao;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number;
        custoEA: number;
        testesExigidos: import("@prisma/client/runtime/library").JsonValue | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean;
        grauTipoGrauCodigo: string | null;
        escalonamentoCustoEA: number;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    removeHabilidade(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        sucesso: boolean;
    }>;
    findAllVariacoes(habilidadeId: number): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        execucao: import("@prisma/client").$Enums.TipoExecucao | null;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number | null;
        custoEA: number | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean | null;
        escalonamentoCustoEA: number | null;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
        habilidadeTecnicaId: number;
        substituiCustos: boolean;
        efeitoAdicional: string | null;
    }[]>;
    findOneVariacao(id: number): Promise<{
        habilidadeTecnica: {
            id: number;
            nome: string;
            codigo: string;
            tecnica: {
                id: number;
                nome: string;
                codigo: string;
            };
        };
    } & {
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        execucao: import("@prisma/client").$Enums.TipoExecucao | null;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number | null;
        custoEA: number | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean | null;
        escalonamentoCustoEA: number | null;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
        habilidadeTecnicaId: number;
        substituiCustos: boolean;
        efeitoAdicional: string | null;
    }>;
    createVariacao(req: {
        user: {
            id: number;
        };
    }, dto: CreateVariacaoHabilidadeDto): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        execucao: import("@prisma/client").$Enums.TipoExecucao | null;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number | null;
        custoEA: number | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean | null;
        escalonamentoCustoEA: number | null;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
        habilidadeTecnicaId: number;
        substituiCustos: boolean;
        efeitoAdicional: string | null;
    }>;
    updateVariacao(req: {
        user: {
            id: number;
        };
    }, id: number, dto: UpdateVariacaoHabilidadeDto): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        nome: string;
        descricao: string;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        ordem: number;
        criticoValor: number | null;
        criticoMultiplicador: number | null;
        alcance: string | null;
        execucao: import("@prisma/client").$Enums.TipoExecucao | null;
        area: import("@prisma/client").$Enums.AreaEfeito | null;
        alvo: string | null;
        duracao: string | null;
        resistencia: string | null;
        dtResistencia: string | null;
        custoPE: number | null;
        custoEA: number | null;
        danoFlat: number | null;
        danoFlatTipo: import("@prisma/client").$Enums.TipoDano | null;
        dadosDano: import("@prisma/client/runtime/library").JsonValue | null;
        escalonaPorGrau: boolean | null;
        escalonamentoCustoEA: number | null;
        escalonamentoDano: import("@prisma/client/runtime/library").JsonValue | null;
        habilidadeTecnicaId: number;
        substituiCustos: boolean;
        efeitoAdicional: string | null;
    }>;
    removeVariacao(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        sucesso: boolean;
    }>;
}
