export type AnotacaoResumo = {
  id: number;
  titulo: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string;
  campanha?: {
    id: number;
    nome: string;
  } | null;
  sessao?: {
    id: number;
    titulo: string;
  } | null;
};

export type CriarAnotacaoPayload = {
  titulo: string;
  conteudo: string;
  campanhaId?: number | null;
  sessaoId?: number | null;
};

export type AtualizarAnotacaoPayload = Partial<CriarAnotacaoPayload>;
