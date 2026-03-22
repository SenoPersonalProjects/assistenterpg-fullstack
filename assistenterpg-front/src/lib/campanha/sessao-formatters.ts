import type { DuracaoCondicaoSessaoModo, TipoCenaSessaoCampanha } from '@/lib/types';
import { corrigirMojibakeTexto } from '@/lib/utils/encoding';

const LABEL_CENA: Record<TipoCenaSessaoCampanha, string> = {
  LIVRE: 'Cena livre',
  INVESTIGACAO: 'Investigacao',
  FURTIVIDADE: 'Furtividade',
  COMBATE: 'Combate',
  PERSEGUICAO: 'Perseguicao',
  BASE: 'Base',
  OUTRA: 'Outra',
};

const LABEL_PAPEL_PARTICIPANTE: Record<string, string> = {
  MESTRE: 'Mestre',
  JOGADOR: 'Jogador',
  OBSERVADOR: 'Observador',
};

export function labelCena(tipo: TipoCenaSessaoCampanha | string): string {
  return LABEL_CENA[tipo as TipoCenaSessaoCampanha] ?? 'Outra cena';
}

export function labelPapelParticipante(papel: string): string {
  return LABEL_PAPEL_PARTICIPANTE[papel] ?? papel;
}

export function textoSeguro(value: string | null | undefined): string {
  if (!value) return '';
  return corrigirMojibakeTexto(value);
}

export function descreverDuracaoCondicao(
  duracaoModo: DuracaoCondicaoSessaoModo | string,
  duracaoValor: number | null,
  restanteDuracao: number | null,
): string {
  if (duracaoModo === 'ATE_REMOVER') {
    return 'Duracao: ate remover';
  }

  const sufixo = duracaoModo === 'RODADAS' ? 'rodada(s)' : 'turno(s) do alvo';
  const total =
    typeof duracaoValor === 'number' ? `${duracaoValor} ${sufixo}` : `? ${sufixo}`;
  if (typeof restanteDuracao === 'number') {
    return `Duracao: ${total} | Restante: ${restanteDuracao}`;
  }
  return `Duracao: ${total}`;
}
