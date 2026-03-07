// src/inventario/dto/inventario-completo.dto.ts
import {
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  TipoEquipamento,
} from '@prisma/client';

export class EquipamentoBaseDto {
  id: number;
  codigo: string;
  nome: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  complexidadeMaldicao: ComplexidadeMaldicao;
}

export class ModificacaoItemDto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  incrementoEspacos: number;
}

export class ItemInventarioDto {
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

/**
 * ✅ NOVO: Stats dos itens equipados
 */
export class StatsEquipadosDto {
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

export class InventarioCompletoDto {
  personagemBaseId: number;

  // Espaços
  espacosTotal: number;
  espacosOcupados: number;
  espacosDisponiveis: number;
  sobrecarregado: boolean;

  // Itens
  itens: ItemInventarioDto[];

  // ✅ NOVO: Stats equipados (calculados no backend)
  statsEquipados: StatsEquipadosDto;
}
