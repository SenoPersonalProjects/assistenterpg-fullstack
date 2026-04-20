import type { CondicaoAtivaSessaoCampanha, DuracaoCondicaoSessaoModo } from '@/lib/types';

export type NpcEditavel = {
  fichaTipo: string;
  tipo: string;
  tamanho: string;
  defesa: string;
  pontosVidaMax: string;
  sanMax: string;
  eaMax: string;
  machucado: string;
  agilidade: string;
  forca: string;
  intelecto: string;
  presenca: string;
  vigor: string;
  percepcao: string;
  iniciativa: string;
  fortitude: string;
  reflexos: string;
  vontade: string;
  luta: string;
  jujutsu: string;
  notasCena: string;
};

export type CampoAjusteRecursoNpc = 'pv' | 'san' | 'ea';
export type AjustesRecursosNpc = Record<CampoAjusteRecursoNpc, string>;

export type AcaoControleTurno = 'AVANCAR' | 'VOLTAR' | 'PULAR';

export type FormCondicaoSessao = {
  condicaoId: string;
  duracaoModo: DuracaoCondicaoSessaoModo;
  duracaoValor: string;
  acumulos: string;
  fonteCodigo: string;
  limiteFonte: string;
  origemDescricao: string;
  observacao: string;
  motivoRemocao: string;
};

export type AlvoCondicoesModal = {
  alvoTipo: 'PERSONAGEM' | 'NPC';
  alvoId: number;
  nomeAlvo: string;
  condicoesAtivas: CondicaoAtivaSessaoCampanha[];
};

export type RolagemPericiaSessaoPayload = {
  alvoTipo: 'PERSONAGEM' | 'NPC';
  alvoNome: string;
  periciaNome: string;
  atributoBase?: string | null;
  dados: number;
  bonus: number;
  keepMode: 'SUM' | 'HIGHEST' | 'LOWEST';
};

export type DadoDanoTecnicaPayload = {
  quantidade: number;
  dado: string;
  tipo: string;
};

export type EscalonamentoDanoTecnicaPayload = {
  quantidade: number;
  dado: string;
  tipo: string;
};

export type HabilidadeDanoConfigPayload = {
  dadosDano?: DadoDanoTecnicaPayload[] | null;
  danoFlat?: number | null;
  danoFlatTipo?: string | null;
  escalonamentoDano?: EscalonamentoDanoTecnicaPayload | null;
  acumulos?: number;
};

export type HabilidadeRollContext = {
  habilidadeNome: string;
  variacaoNome?: string | null;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  dano?: HabilidadeDanoConfigPayload | null;
};

export type RolagemTesteHabilidadeSessaoPayload = {
  alvoTipo: 'PERSONAGEM' | 'NPC';
  alvoNome: string;
  periciaNome: string;
  atributoBase?: string | null;
  dados: number;
  bonus: number;
  keepMode: 'SUM' | 'HIGHEST' | 'LOWEST';
  habilidade: HabilidadeRollContext;
};

export type RolagemDanoHabilidadeSessaoPayload = {
  alvoTipo: 'PERSONAGEM' | 'NPC';
  alvoNome: string;
  habilidade: HabilidadeRollContext;
  aplicarCritico?: boolean;
};

export type RolagemExpressaoSessaoPayload = {
  alvoTipo: 'PERSONAGEM' | 'NPC';
  alvoNome: string;
  titulo: string;
  subtitulo?: string;
  expressao: string;
};
