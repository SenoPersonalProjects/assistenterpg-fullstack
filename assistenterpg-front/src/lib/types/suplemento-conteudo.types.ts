import type {
  TipoFonte,
  TipoEquipamento,
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  ProficienciaArma,
  EmpunhaduraArma,
  TipoArma,
  SubtipoArmaDistancia,
  AlcanceArma,
  ProficienciaProtecao,
  TipoProtecao,
  TipoAcessorio,
  TipoExplosivo,
  TipoUsoEquipamento,
  TipoAmaldicoado,
  TipoTecnicaAmaldicoada,
  TipoExecucao,
  AreaEfeito,
  TipoDano,
} from './homebrew-enums';
import type {
  ClasseCatalogo,
  ClaCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  OrigemCatalogo,
  HabilidadeCatalogo,
  ProficienciaCatalogo,
  TipoGrauCatalogo,
  TecnicaAmaldicoadaCatalogo,
  TipoHabilidadeCatalogo,
} from './catalogo.types';
import type { EquipamentoDetalhadoDto, EquipamentoResumoDto } from './inventario.types';

export type ConteudoComFonte = {
  fonte?: TipoFonte;
  suplementoId?: number | null;
};

export type PericiaOrigemPayload = {
  periciaId: number;
  tipo: 'FIXA' | 'ESCOLHA';
  grupoEscolha?: number | null;
};

export type HabilidadeVinculadaPayload = {
  habilidadeId: number;
  nivelConcedido: number;
  caminhoId?: number;
};

export type EfeitoGrauPayload = {
  tipoGrauCodigo: string;
  valor?: number;
  escalonamentoPorNivel?: unknown;
};

export type CreateClassePayload = ConteudoComFonte & {
  nome: string;
  descricao?: string | null;
};

export type UpdateClassePayload = Partial<CreateClassePayload>;

export type CreateClaPayload = ConteudoComFonte & {
  nome: string;
  descricao?: string | null;
  grandeCla: boolean;
  tecnicasHereditariasIds?: number[];
};

export type UpdateClaPayload = Partial<CreateClaPayload>;

export type CreateTrilhaPayload = ConteudoComFonte & {
  classeId: number;
  nome: string;
  descricao?: string | null;
  requisitos?: unknown;
  habilidades?: HabilidadeVinculadaPayload[];
};

export type UpdateTrilhaPayload = Partial<CreateTrilhaPayload>;

export type CreateCaminhoPayload = ConteudoComFonte & {
  trilhaId: number;
  nome: string;
  descricao?: string | null;
  habilidades?: Array<Omit<HabilidadeVinculadaPayload, 'caminhoId'>>;
};

export type UpdateCaminhoPayload = Partial<CreateCaminhoPayload>;

export type CreateOrigemPayload = ConteudoComFonte & {
  nome: string;
  descricao?: string | null;
  requisitosTexto?: string | null;
  requerGrandeCla?: boolean;
  requerTecnicaHeriditaria?: boolean;
  bloqueiaTecnicaHeriditaria?: boolean;
  pericias?: PericiaOrigemPayload[];
  habilidadesIds?: number[];
};

export type UpdateOrigemPayload = Partial<CreateOrigemPayload>;

export type CreateHabilidadePayload = ConteudoComFonte & {
  nome: string;
  descricao?: string | null;
  tipo: TipoHabilidadeCatalogo;
  origem?: string | null;
  requisitos?: unknown;
  mecanicasEspeciais?: unknown;
  efeitosGrau?: EfeitoGrauPayload[];
};

export type UpdateHabilidadePayload = Partial<CreateHabilidadePayload>;

export type CreateEquipamentoPayload = ConteudoComFonte & {
  codigo: string;
  nome: string;
  tipo: TipoEquipamento;
  descricao?: string;
  categoria?: CategoriaEquipamento;
  espacos?: number;
  complexidadeMaldicao?: ComplexidadeMaldicao;
  tipoUso?: TipoUsoEquipamento;
  tipoAmaldicoado?: TipoAmaldicoado;
  efeito?: string;
  efeitoMaldicao?: string;
  requerFerramentasAmaldicoadas?: boolean;
  proficienciaArma?: ProficienciaArma;
  empunhaduras?: EmpunhaduraArma[];
  tipoArma?: TipoArma;
  subtipoDistancia?: SubtipoArmaDistancia;
  agil?: boolean;
  criticoValor?: number;
  criticoMultiplicador?: number;
  alcance?: AlcanceArma;
  tipoMunicaoCodigo?: string;
  habilidadeEspecial?: string;
  proficienciaProtecao?: ProficienciaProtecao;
  tipoProtecao?: TipoProtecao;
  bonusDefesa?: number;
  penalidadeCarga?: number;
  duracaoCenas?: number;
  recuperavel?: boolean;
  tipoAcessorio?: TipoAcessorio;
  periciaBonificada?: string;
  bonusPericia?: number;
  requereEmpunhar?: boolean;
  maxVestimentas?: number;
  tipoExplosivo?: TipoExplosivo;
};

export type UpdateEquipamentoPayload = Partial<CreateEquipamentoPayload>;

export type CreateProficienciaPayload = {
  codigo: string;
  nome: string;
  descricao?: string | null;
  tipo: string;
  categoria: string;
  subtipo?: string | null;
};

export type UpdateProficienciaPayload = Partial<CreateProficienciaPayload>;

export type CreateTipoGrauPayload = {
  codigo: string;
  nome: string;
  descricao?: string | null;
};

export type UpdateTipoGrauPayload = Partial<CreateTipoGrauPayload>;

export type CondicaoCatalogo = {
  id: number;
  nome: string;
  descricao: string;
  _count?: {
    condicoesPersonagemSessao: number;
  };
};

export type CreateCondicaoPayload = {
  nome: string;
  descricao: string;
};

export type UpdateCondicaoPayload = Partial<CreateCondicaoPayload>;

export type CreateTecnicaPayload = ConteudoComFonte & {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoTecnicaAmaldicoada;
  hereditaria?: boolean;
  clasHereditarios?: string[];
  linkExterno?: string | null;
  requisitos?: unknown;
};

export type UpdateTecnicaPayload = Partial<Omit<CreateTecnicaPayload, 'codigo'>>;

export type VariacaoHabilidadeTecnicaCatalogo = {
  id: number;
  habilidadeTecnicaId: number;
  nome: string;
  descricao: string;
  substituiCustos: boolean;
  custoPE?: number | null;
  custoEA?: number | null;
  execucao?: TipoExecucao | null;
  area?: AreaEfeito | null;
  alcance?: string | null;
  alvo?: string | null;
  duracao?: string | null;
  resistencia?: string | null;
  dtResistencia?: string | null;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  danoFlat?: number | null;
  danoFlatTipo?: TipoDano | null;
  dadosDano?: unknown;
  escalonaPorGrau?: boolean | null;
  escalonamentoCustoEA?: number | null;
  escalonamentoDano?: unknown;
  efeitoAdicional?: string | null;
  requisitos?: unknown;
  ordem: number;
};

export type HabilidadeTecnicaCatalogo = {
  id: number;
  tecnicaId: number;
  codigo: string;
  nome: string;
  descricao: string;
  requisitos?: unknown;
  execucao: TipoExecucao;
  area?: AreaEfeito | null;
  alcance?: string | null;
  alvo?: string | null;
  duracao?: string | null;
  resistencia?: string | null;
  dtResistencia?: string | null;
  custoPE: number;
  custoEA: number;
  testesExigidos?: unknown;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  danoFlat?: number | null;
  danoFlatTipo?: TipoDano | null;
  dadosDano?: unknown;
  escalonaPorGrau: boolean;
  grauTipoGrauCodigo?: string | null;
  escalonamentoCustoEA: number;
  escalonamentoDano?: unknown;
  efeito: string;
  ordem: number;
  variacoes?: VariacaoHabilidadeTecnicaCatalogo[];
  tecnica?: {
    id: number;
    codigo: string;
    nome: string;
  };
};

export type CreateHabilidadeTecnicaPayload = {
  tecnicaId: number;
  codigo: string;
  nome: string;
  descricao: string;
  requisitos?: unknown;
  execucao: TipoExecucao;
  area?: AreaEfeito;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  resistencia?: string;
  dtResistencia?: string;
  custoPE?: number;
  custoEA?: number;
  testesExigidos?: unknown;
  criticoValor?: number;
  criticoMultiplicador?: number;
  danoFlat?: number;
  danoFlatTipo?: TipoDano;
  dadosDano?: unknown;
  escalonaPorGrau?: boolean;
  grauTipoGrauCodigo?: string;
  escalonamentoCustoEA?: number;
  escalonamentoDano?: unknown;
  efeito: string;
  ordem?: number;
};

export type UpdateHabilidadeTecnicaPayload = Partial<
  Omit<CreateHabilidadeTecnicaPayload, 'tecnicaId' | 'codigo'>
>;

export type CreateVariacaoHabilidadeTecnicaPayload = {
  habilidadeTecnicaId: number;
  nome: string;
  descricao: string;
  substituiCustos?: boolean;
  custoPE?: number;
  custoEA?: number;
  execucao?: TipoExecucao;
  area?: AreaEfeito;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  resistencia?: string;
  dtResistencia?: string;
  criticoValor?: number;
  criticoMultiplicador?: number;
  danoFlat?: number;
  danoFlatTipo?: TipoDano;
  dadosDano?: unknown;
  escalonaPorGrau?: boolean;
  escalonamentoCustoEA?: number;
  escalonamentoDano?: unknown;
  efeitoAdicional?: string;
  requisitos?: unknown;
  ordem?: number;
};

export type UpdateVariacaoHabilidadeTecnicaPayload = Partial<
  Omit<CreateVariacaoHabilidadeTecnicaPayload, 'habilidadeTecnicaId'>
>;

export type ListHabilidadesFilters = {
  tipo?: TipoHabilidadeCatalogo;
  origem?: string;
  fonte?: TipoFonte;
  suplementoId?: number;
  busca?: string;
  pagina?: number;
  limite?: number;
};

export type ListEquipamentosFilters = {
  tipo?: TipoEquipamento;
  fontes?: TipoFonte[];
  suplementoId?: number;
  complexidadeMaldicao?: ComplexidadeMaldicao;
  proficienciaArma?: ProficienciaArma;
  proficienciaProtecao?: ProficienciaProtecao;
  alcance?: AlcanceArma;
  tipoAcessorio?: TipoAcessorio;
  categoria?: number;
  apenasAmaldicoados?: boolean;
  busca?: string;
  pagina?: number;
  limite?: number;
};

export type ListTecnicasFilters = {
  nome?: string;
  codigo?: string;
  tipo?: TipoTecnicaAmaldicoada;
  hereditaria?: boolean;
  claId?: number;
  claNome?: string;
  fonte?: TipoFonte;
  suplementoId?: number;
  incluirHabilidades?: boolean;
  incluirClas?: boolean;
};

export type AdminModuloSuplemento =
  | 'classes'
  | 'clas'
  | 'trilhas'
  | 'caminhos'
  | 'origens'
  | 'proficiencias'
  | 'tipos-grau'
  | 'condicoes'
  | 'habilidades'
  | 'equipamentos'
  | 'tecnicas-amaldicoadas';

export type ConteudoModuloMap = {
  classes: ClasseCatalogo;
  clas: ClaCatalogo;
  trilhas: TrilhaCatalogo;
  caminhos: CaminhoCatalogo;
  origens: OrigemCatalogo;
  proficiencias: ProficienciaCatalogo;
  'tipos-grau': TipoGrauCatalogo;
  condicoes: CondicaoCatalogo;
  habilidades: HabilidadeCatalogo;
  equipamentos: EquipamentoResumoDto | EquipamentoDetalhadoDto;
  'tecnicas-amaldicoadas': TecnicaAmaldicoadaCatalogo;
};
