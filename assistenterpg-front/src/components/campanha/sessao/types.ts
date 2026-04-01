import type { CondicaoAtivaSessaoCampanha, DuracaoCondicaoSessaoModo } from '@/lib/types';

export type NpcEditavel = {
  defesa: string;
  pontosVidaMax: string;
  sanMax: string;
  eaMax: string;
  machucado: string;
  notasCena: string;
};

export type CampoAjusteRecursoNpc = 'pv' | 'san' | 'ea';
export type AjustesRecursosNpc = Record<CampoAjusteRecursoNpc, string>;

export type AcaoControleTurno = 'AVANCAR' | 'VOLTAR' | 'PULAR';

export type FormCondicaoSessao = {
  condicaoId: string;
  duracaoModo: DuracaoCondicaoSessaoModo;
  duracaoValor: string;
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
