import type { CondicaoAtivaSessaoCampanha, DuracaoCondicaoSessaoModo } from '@/lib/types';

export type NpcEditavel = {
  vd: string;
  defesa: string;
  pontosVidaAtual: string;
  pontosVidaMax: string;
  deslocamentoMetros: string;
  notasCena: string;
};

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
