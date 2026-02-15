import { CategoriaEquipamento, ComplexidadeMaldicao, TipoEquipamento } from '@prisma/client';
export declare class EquipamentoBaseDto {
    id: number;
    codigo: string;
    nome: string;
    tipo: TipoEquipamento;
    categoria: CategoriaEquipamento;
    espacos: number;
    complexidadeMaldicao: ComplexidadeMaldicao;
}
export declare class ModificacaoItemDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    incrementoEspacos: number;
}
export declare class ItemInventarioDto {
    id: number;
    equipamentoId: number;
    equipamento: EquipamentoBaseDto;
    quantidade: number;
    equipado: boolean;
    categoriaCalculada: CategoriaEquipamento;
    espacosCalculados: number;
    nomeCustomizado?: string | null;
    notas?: string | null;
    modificacoes: ModificacaoItemDto[];
}
export declare class StatsEquipadosDto {
    defesaTotal: number;
    danosTotais: Array<{
        tipoDano: string;
        empunhadura?: string | null;
        rolagem: string;
        flat: number;
    }>;
    reducoesDano: Array<{
        tipoReducao: string;
        valor: number;
    }>;
    penalidadeCarga: number;
}
export declare class InventarioCompletoDto {
    personagemBaseId: number;
    espacosTotal: number;
    espacosOcupados: number;
    espacosDisponiveis: number;
    sobrecarregado: boolean;
    itens: ItemInventarioDto[];
    statsEquipados: StatsEquipadosDto;
}
