// prisma/seeds/_types.ts

import type {
  Prisma,
  AtributoBase,
  AtributoPassiva,
  TipoEquipamento,
  TipoDano,
  TipoArma,
  ProficienciaArma,
  EmpunhaduraArma,
  SubtipoArmaDistancia,
  ProficienciaProtecao,
  TipoProtecao,
  TipoAcessorio,
  TipoExplosivo,
  ComplexidadeMaldicao,
  TipoModificacao,
  AlcanceArma,
  GrauFeiticeiro,
  TipoReducaoDano,
  TipoAmaldicoado,
  TipoFonte, // ✅ NOVO
} from '@prisma/client';

export type SeedJson = Prisma.InputJsonValue;

// =======================
// TÉCNICAS AMALDIÇOADAS
// =======================
export type SeedTecnicaInata = {
  codigo: string;
  nome: string;
  descricao?: string | null;
  hereditaria: boolean;
  clasHereditarios: string[];
  linkExterno?: string | null;
  requisitos?: SeedJson | null;
  // ✅ REMOVIDO: origem (sempre será SISTEMA_BASE nos seeds)
  // fonte e suplementoId são definidos no upsert, não precisam estar aqui
};

export type SeedHabilidade = {
  nome: string;
  tipo: string;
  
  // ✅ MANTIDO: origem define o CONTEXTO (GERAL, FICHA, SESSAO, etc.)
  origem?: string | null;
  
  descricao?: string | null;
  hereditaria?: boolean;
  requisitos?: SeedJson | null;
  mecanicasEspeciais?: SeedJson | null;
  
  // ✅ fonte e suplementoId são definidos no upsert (SISTEMA_BASE nos seeds)
};

// =======================
// CLASSES / CLÃS / ORIGENS
// =======================
export type SeedClasse = {
  nome: string;
  descricao: string;
  periciasLivresBase: number;
  // ✅ fonte e suplementoId definidos no upsert
};

export type SeedCla = {
  nome: string;
  descricao: string;
  grandeCla: boolean;
  // ✅ fonte e suplementoId são definidos no upsert, não precisam estar aqui
};

export type SeedOrigem = {
  nome: string;
  descricao: string;
  requerGrandeCla?: boolean;
  requerTecnicaHeriditaria?: boolean;
  bloqueiaTecnicaHeriditaria?: boolean;
  requisitosTexto?: string | null;
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// PROFICIÊNCIAS / TIPOS
// =======================
export type SeedProficiencia = {
  codigo: string;
  nome: string;
  descricao?: string | null;
  tipo: string;
  categoria: string;
  subtipo?: string | null;
};

export type SeedTipoGrau = {
  codigo: string;
  nome: string;
  descricao?: string | null;
};

export type SeedResistenciaTipo = {
  codigo: string;
  nome: string;
  descricao?: string | null;
};

export type SeedCondicao = {
  nome: string;
  descricao: string;
};

// =======================
// PERÍCIAS / ALINHAMENTOS
// =======================
export type SeedPericia = {
  codigo: string;
  nome: string;
  descricao: string;
  atributoBase: AtributoBase;
  somenteTreinada: boolean;
  penalizaPorCarga: boolean;
  precisaKit: boolean;
};

export type SeedAlinhamento = {
  nome: string;
  descricao?: string | null;
};

// =======================
// PASSIVAS DE ATRIBUTOS
// =======================
export type SeedPassivaAtributo = {
  codigo: string;
  nome: string;
  atributo: AtributoPassiva;
  nivel: number;
  requisito?: number;
  descricao: string;
  efeitos: SeedJson;
};

// =======================
// VÍNCULOS: ORIGEM/CLASSE
// =======================
export type SeedOrigemPericias = {
  origemNome: string;
  pericias: Array<{
    codigo: string;
    tipo: string;
    grupoEscolha?: number;
  }>;
};

export type SeedClassePericia = {
  classeNome: string;
  periciaCodigo: string;
  tipo: string;
  grupoEscolha?: number;
};

export type SeedClasseProficiencia = {
  classeNome: string;
  proficienciaCodigo: string;
};

// =======================
// TRILHAS / CAMINHOS
// =======================
export type SeedTrilha = {
  classeNome: string;
  nome: string;
  descricao?: string | null;
  // ✅ fonte e suplementoId definidos no upsert
};

export type SeedTrilhaRequisitos = {
  trilhaNome: string;
  requisitos: SeedJson;
};

export type SeedCaminho = {
  trilhaNome: string;
  nome: string;
  descricao?: string | null;
  // ✅ fonte e suplementoId definidos no upsert
};

export type SeedHabilidadeTrilha = {
  trilhaNome: string;
  caminhoNome?: string | null;
  habilidadeNome: string;
  nivelConcedido: number;
};

// =======================
// HABILIDADES: VÍNCULOS
// =======================
export type SeedHabilidadeOrigemVinculo = {
  origemNome: string;
  habilidadeNome: string;
};

export type SeedHabilidadeClasseVinculo = {
  habilidadeNome: string;
  classeNome: string;
  nivelConcedido: number;
};

// =======================
// HABILIDADES: EFEITOS/MECÂNICAS
// =======================
export type SeedHabilidadeEfeitoGrau = {
  habilidadeNome: string;
  tipoGrauCodigo: string;
  valor: number;
  escalonamentoPorNivel?: SeedJson | null;
};

export type SeedHabilidadeMecanicasEspeciais = {
  habilidadeNome: string;
  mecanicasEspeciais: SeedJson;
};

// =======================
// EQUIPAMENTOS - TIPOS GENÉRICOS
// =======================
export type DanoEquipamento = {
  empunhadura: EmpunhaduraArma | null;
  tipoDano: TipoDano;
  rolagem: string;
  valorFlat: number;
};

export type ReducaoDano = {
  tipoReducao: TipoReducaoDano;
  valor: number;
};

export type LimitesPorCategoria = Record<string, number>;

export type EfeitosMecanicos = SeedJson;

// ✅ NOVO: Tipo para restrições de modificações
export type RestricoesModificacao = {
  tiposEquipamento?: string[];
  categoriaMinima?: number;
  categoriaMaxima?: number;
  tiposProtecao?: string[];
  tiposArma?: string[];
  subtiposArmaDistancia?: string[];
  proficienciasArma?: string[];
  proficienciasProtecao?: string[];
  apenasAmaldicoados?: boolean;
  apenasMundanos?: boolean;
  complexidadeMinima?: ComplexidadeMaldicao;
  complexidadeMaxima?: ComplexidadeMaldicao;
  codigosIncompativeis?: string[];
  codigosRequeridos?: string[];
  limiteMaximoGlobal?: number;
  alcancesPermitidos?: string[];
  empunhadurasPermitidas?: string[];
  excluiEscudos?: boolean;
  outros?: Record<string, any>;
};

// =======================
// EQUIPAMENTOS - ARMAS
// =======================
export type SeedEquipamentoArma = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: number;
  espacos: number;
  proficienciaArma: ProficienciaArma;
  empunhaduras: EmpunhaduraArma[];
  tipoArma: TipoArma;
  subtipoDistancia?: SubtipoArmaDistancia | null;
  agil?: boolean;
  danos: DanoEquipamento[];
  criticoValor: number;
  criticoMultiplicador: number;
  alcance: AlcanceArma;
  tipoMunicaoCodigo?: string | null;
  habilidadeEspecial?: string | null;
  reducoesDano?: ReducaoDano[] | null;
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// EQUIPAMENTOS - MUNIÇÕES
// =======================
export type SeedEquipamentoMunicao = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: number;
  espacos: number;
  duracaoCenas: number;
  recuperavel: boolean;
  alcance?: AlcanceArma | null;
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// EQUIPAMENTOS - PROTEÇÕES
// =======================
export type SeedEquipamentoProtecao = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: number;
  espacos: number;
  proficienciaProtecao: ProficienciaProtecao;
  tipoProtecao: TipoProtecao;
  bonusDefesa: number;
  penalidadeCarga: number;
  reducoesDano?: ReducaoDano[] | null;
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// EQUIPAMENTOS - ACESSÓRIOS
// =======================
export type SeedEquipamentoAcessorio = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: number;
  espacos: number;
  tipoAcessorio: TipoAcessorio;
  periciaBonificada?: string | null;
  bonusPericia: number;
  requereEmpunhar: boolean;
  maxVestimentas: number;
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// EQUIPAMENTOS - EXPLOSIVOS
// =======================
export type SeedEquipamentoExplosivo = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: number;
  espacos: number;
  tipoExplosivo: TipoExplosivo;
  efeito: string;
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// EQUIPAMENTOS - ITENS AMALDIÇOADOS
// =======================
export type SeedEquipamentoAmaldicoado = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: number;
  espacos: number;
  complexidadeMaldicao?: ComplexidadeMaldicao;
  efeitoMaldicao?: string | null;
  tipoAmaldicoado?: TipoAmaldicoado | null;
  requerFerramentasAmaldicoadas?: boolean;
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// EQUIPAMENTOS - ESPECIAIS AMALDIÇOADOS
// =======================
export type SeedArmaAmaldicoada = {
  equipamentoId: number;
  tipoBase: string;
  proficienciaRequerida: boolean;
  efeito?: string | null;
};

export type SeedProtecaoAmaldicoada = {
  equipamentoId: number;
  tipoBase: string;
  bonusDefesa: number;
  penalidadeCarga: number;
  proficienciaRequerida: boolean;
  efeito?: string | null;
};

export type SeedArtefatoAmaldicoado = {
  equipamentoId: number;
  tipoBase: string;
  proficienciaRequerida: boolean;
  efeito?: string | null;
  custoUso?: string | null;
  manutencao?: string | null;
};

// =======================
// MODIFICAÇÕES
// =======================
export type SeedModificacao = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoModificacao;
  incrementoEspacos: number;
  
  // ✅ NOVO: Sistema de restrições flexível
  restricoes?: RestricoesModificacao | null;
  
  efeitosMecanicos?: EfeitosMecanicos | null;
  
  // ✅ REMOVIDO: apenas_amaldicoadas e requerComplexidade
  // (agora fazem parte de restricoes)
  
  // ✅ fonte e suplementoId definidos no upsert
};

// =======================
// LIMITES DE INVENTÁRIO POR GRAU
// =======================
export type SeedGrauFeiticeiroLimite = {
  prestigioMin: number;
  grau: GrauFeiticeiro;
  limitesPorCategoria: LimitesPorCategoria;
  descricao?: string | null;
};
