import type { DuracaoCondicaoSessaoModo, TipoCenaSessaoCampanha } from '@/lib/types';
import { corrigirMojibakeTexto } from '../utils/encoding';

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

function normalizarTextoComparacao(value: string | null | undefined): string {
  return textoSeguro(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

export function condicaoExibeAcumuloMinimo(nome: string | null | undefined): boolean {
  const normalizado = normalizarTextoComparacao(nome);
  return (
    normalizado === 'CURA ACELERADA' ||
    normalizado === 'PRODUCAO ACELERADA'
  );
}

export function formatarNomeCondicaoComAcumulos(condicao: {
  nome: string | null | undefined;
  acumulos?: number | null;
}): string {
  const nome = textoSeguro(condicao.nome);
  const acumulos = Math.max(1, Math.trunc(condicao.acumulos ?? 1));
  return acumulos > 1 || condicaoExibeAcumuloMinimo(nome)
    ? `${nome} ${acumulos}`
    : nome;
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
