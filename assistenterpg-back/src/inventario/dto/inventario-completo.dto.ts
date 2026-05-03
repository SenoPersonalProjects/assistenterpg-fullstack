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

export class ItemInventarioEstadoDto {
  periciaCodigo?: string | null;
  funcoesAdicionaisPericias?: string[];
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
  estado?: ItemInventarioEstadoDto | null;

  modificacoes: ModificacaoItemDto[];
}

export class ItemSessaoInventarioDto {
  id: number;
  campanhaId: number;
  sessaoId: number | null;
  cenaId: number | null;
  personagemCampanhaId: number | null;
  nome: string;
  descricao: string | null;
  descricaoOculta?: boolean;
  tipo: string;
  categoria: CategoriaEquipamento;
  peso: number;
  descricaoRevelada: boolean;
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
  itensSessao: ItemSessaoInventarioDto[];

  // ✅ NOVO: Stats equipados (calculados no backend)
  statsEquipados: StatsEquipadosDto;
}
