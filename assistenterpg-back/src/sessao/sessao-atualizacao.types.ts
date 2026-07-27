export type CampoRecursoSessao = 'pvAtual' | 'peAtual' | 'eaAtual' | 'sanAtual';

export type CondicaoAtivaSessaoResumo = {
  id: number;
  condicaoId: number;
  nome: string;
  descricao: string;
  icone: string | null;
  automatica: boolean;
  chaveAutomacao: string | null;
  duracaoModo: string;
  duracaoValor: number | null;
  restanteDuracao: number | null;
  contadorTurnos: number;
  origemDescricao: string | null;
  observacao: string | null;
  turnoAplicacao: number;
  acumulos: number;
  fonteCodigo: string | null;
  limiteFonte: number | null;
};

export type AtualizacaoRecursosSessao = {
  tipo: 'RECURSO_AJUSTADO';
  mutacaoId: string;
  eventoId: number | null;
  campanhaId: number;
  sessaoId: number;
  personagemSessaoId: number;
  personagemCampanhaId: number;
  valores: Partial<Record<CampoRecursoSessao, number>>;
  condicoesAtivas?: CondicaoAtivaSessaoResumo[];
  em: string;
};

export type AtualizacaoInspiracaoSessao = {
  tipo: 'INSPIRACAO_AJUSTADA' | 'INSPIRACAO_GASTA';
  mutacaoId: string;
  eventoId: number | null;
  campanhaId: number;
  sessaoId: number;
  personagemCampanhaId: number;
  pontosInspiracao: number;
  em: string;
};

export type AtualizacaoIncrementalSessao =
  | AtualizacaoRecursosSessao
  | AtualizacaoInspiracaoSessao;
