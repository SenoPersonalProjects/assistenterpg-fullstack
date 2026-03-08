// lib/types/inventario.types.ts
/**
 * Types relacionados a inventário, equipamentos e modificações
 */

import type { ItemInventarioPayload } from './personagem.types';
import type { TipoFonte } from './homebrew-enums';

/* ============================================================================ */
/* EQUIPAMENTOS */
/* ============================================================================ */

export type DanoDetalhadoDto = {
  empunhadura: string | null;
  tipoDano: string;
  rolagem: string;
  valorFlat: number;
};

export type ReducaoDanoDetalhadoDto = {
  tipoReducao: string;
  valor: number;
};

export type EquipamentoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  fonte?: TipoFonte;
  suplementoId?: number | null;
  tipo: string;
  categoria: string;
  espacos: number;
  complexidadeMaldicao?: string | null;
  descricao?: string | null;
  peso?: number | null;
  valor?: number | null;
  requisitos?: unknown;
  proficienciaArma?: string | null;
  proficienciaProtecao?: string | null;
  alcance?: string | null;
  tipoAcessorio?: string | null;

  tipoArma?: string | null;
  subtipoDistancia?: string | null;
  tipoProtecao?: string | null;

  tipoUso?: string | null;
  tipoAmaldicoado?: string | null;
  efeito?: string | null;

  armaAmaldicoada?: unknown;
  protecaoAmaldicoada?: unknown;
  artefatoAmaldicoado?: unknown;
};

export type EquipamentoResumoDto = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  fonte?: TipoFonte;
  suplementoId?: number | null;
  tipo: string;
  categoria: string;
  espacos: number;
  complexidadeMaldicao: string;
  proficienciaArma?: string | null;
  proficienciaProtecao?: string | null;
  alcance?: string | null;
  tipoAcessorio?: string | null;

  tipoArma?: string | null;
  subtipoDistancia?: string | null;

  tipoUso?: string | null;
  tipoAmaldicoado?: string | null;
  efeito?: string | null;

  armaAmaldicoada?: {
    id: number;
    tipoBase: string;
  } | null;

  protecaoAmaldicoada?: {
    id: number;
    tipoBase: string;
    bonusDefesa: number;
  } | null;

  artefatoAmaldicoado?: {
    id: number;
    tipoBase: string;
  } | null;
};

export type EquipamentoDetalhadoDto = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  fonte?: TipoFonte;
  suplementoId?: number | null;
  tipo: string;
  categoria: string;
  espacos: number;
  complexidadeMaldicao: string;

  proficienciaArma?: string | null;
  empunhaduras?: string[] | null;
  tipoArma?: string | null;
  subtipoDistancia?: string | null;
  agil?: boolean;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  alcance?: string | null;
  tipoMunicaoCodigo?: string | null;
  habilidadeEspecial?: string | null;
  danos?: DanoDetalhadoDto[];

  proficienciaProtecao?: string | null;
  tipoProtecao?: string | null;
  bonusDefesa?: number;
  penalidadeCarga?: number;
  reducoesDano?: ReducaoDanoDetalhadoDto[];

  duracaoCenas?: number | null;
  recuperavel?: boolean | null;

  tipoAcessorio?: string | null;
  periciaBonificada?: string | null;
  bonusPericia?: number;
  requereEmpunhar?: boolean;
  maxVestimentas?: number;

  tipoExplosivo?: string | null;
  efeito?: string | null;

  tipoUso?: string | null;
  tipoAmaldicoado?: string | null;
  efeitoMaldicao?: string | null;
  requerFerramentasAmaldicoadas?: boolean;

  armaAmaldicoada?: {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string | null;
  } | null;

  protecaoAmaldicoada?: {
    tipoBase: string;
    bonusDefesa: number;
    penalidadeCarga: number;
    proficienciaRequerida: boolean;
    efeito: string | null;
  } | null;

  artefatoAmaldicoado?: {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string | null;
    custoUso: string | null;
    manutencao: string | null;
  } | null;

  modificacoesDisponiveis?: ModificacaoDisponivelDto[];
};

/* ============================================================================ */
/* MODIFICAÇÕES */
/* ============================================================================ */

export type ModificacaoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  tipo: string;
  descricao: string | null;
  incrementoEspacos: number;
  apenasAmaldicoadas: boolean;
  requerComplexidade?: string | null;
  efeitosMecanicos?: unknown;
  requisitos?: unknown;
  fonte?: TipoFonte;
  suplementoId?: number | null;
};

export type ModificacaoDisponivelDto = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  incrementoEspacos: number;
};

export type ModificacaoItemDto = {
  id: number;
  nome: string;
  descricao: string | null;
  codigo: string;
  tipo: string;
  incrementoEspacos: number;
  apenasAmaldicoadas: boolean;
  requerComplexidade?: string | null;
  efeitosMecanicos?: unknown;
};

/* ============================================================================ */
/* ITENS DE INVENTÁRIO */
/* ============================================================================ */

export type ItemInventarioDto = {
  id: number;
  equipamentoId: number;
  quantidade: number;
  equipado: boolean;

  espacosCalculados: number;

  categoriaCalculada?: string;

  nomeCustomizado: string | null;
  notas: string | null;

  equipamento: EquipamentoResumoDto;

  modificacoes: ModificacaoItemDto[];
};

export type ItemInventarioPreviewDto = {
  equipamentoId: number;
  quantidade: number;
  equipado: boolean;

  categoriaCalculada: string;
  espacosCalculados: number;

  nomeCustomizado?: string | null;

  modificacoes: Array<{
    id: number;
    nome: string;
    codigo: string;
    tipo: string;
    incrementoEspacos: number;
  }>;

  equipamento: {
    id: number;
    nome: string;
    codigo: string;
    tipo: string;
    categoria: string;
    espacos: number;
  };
};

/* ============================================================================ */
/* STATS E INVENTÁRIO COMPLETO */
/* ============================================================================ */

export type StatsEquipadosDto = {
  defesaTotal: number;
  penalidadeCarga: number;
  danosTotais: Array<{
    tipoDano: string;
    empunhadura: string | null;
    rolagem: string;
    flat: number;
  }>;
  reducoesDano: Array<{
    tipoReducao: string;
    valor: number;
  }>;
};

export type InventarioCompletoDto = {
  espacos: {
    espacosTotal: number;
    espacosOcupados: number;
    espacosDisponiveis: number;
    sobrecarregado: boolean;
  };
  grauXama: {
    grauAtual: string;
    prestigioMinimoRequisito: number;
  };
  resumoPorCategoria: Array<{
    categoria: string;
    quantidadeItens: number;
    quantidadeTotal: number;
    limiteGrauXama: number;
    podeAdicionarMais: boolean;
  }>;
  podeAdicionarCategoria0: boolean;
  statsEquipados: StatsEquipadosDto;
};

/* ============================================================================ */
/* FILTROS E PAYLOADS */
/* ============================================================================ */

export type FiltrarEquipamentosDto = {
  tipo?: string;
  complexidadeMaldicao?: string;
  proficienciaArma?: string;
  proficienciaProtecao?: string;
  alcance?: string;
  tipoAcessorio?: string;
  categoria?: string;
  apenasAmaldicoados?: boolean;
  fontes?: TipoFonte[];
  suplementoId?: number;
  busca?: string;
  pagina?: number;
  limite?: number;
};

export type FiltrarModificacoesDto = {
  tipo?: string;
  apenasAmaldicoadas?: boolean;
  requerComplexidade?: string;
  fontes?: TipoFonte[];
  suplementoId?: number;
  busca?: string;
  pagina?: number;
  limite?: number;
};

export type AdicionarItemDto = {
  personagemBaseId: number;
  equipamentoId: number;
  quantidade?: number;
  equipado?: boolean;
  nomeCustomizado?: string;
  notas?: string;
  modificacoes?: number[];
  ignorarLimitesGrauXama?: boolean;
};

export type PreviewItemDto = {
  personagemBaseId: number;
  equipamentoId: number;
  quantidade?: number;
  equipado?: boolean;
  modificacoes?: number[];
};

export type AtualizarItemDto = {
  quantidade?: number;
  equipado?: boolean;
  nomeCustomizado?: string;
  notas?: string;
};

export type AplicarModificacaoDto = {
  itemId: number;
  modificacaoId: number;
};

export type RemoverModificacaoDto = {
  itemId: number;
  modificacaoId: number;
};

export type PreviewAdicionarItemResponse = {
  espacos: {
    espacosTotal: number;
    espacosOcupados: number;
    espacosDisponiveis: number;
    sobrecarregado: boolean;
  };
  grauXama: {
    valido: boolean;
    erros: string[];
    grauAtual: string;
    limitesAtuais: Record<string, number>;
    itensPorCategoriaAtual: Record<string, number>;
  };
  stats: Partial<StatsEquipadosDto>;
};

export type PreviewItensInventarioPayload = {
  forca: number;
  prestigioBase: number;
  itens: ItemInventarioPayload[];
};

export type PreviewItensInventarioResponse = {
  itens: ItemInventarioPreviewDto[];

  espacosBase: number;
  espacosExtra: number;
  espacosTotal: number;
  espacosOcupados: number;
  sobrecarregado: boolean;

  grauXama: {
    grau: string;
    limitesPorCategoria: Record<string, number>;
  };

  itensPorCategoria: Record<string, number>;
};
