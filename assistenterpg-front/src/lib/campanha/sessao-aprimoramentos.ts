import type { AprimoramentoTemporarioSessaoCampanha } from '@/lib/types';

export type AprimoramentoTemporarioFormatavel = Partial<
  AprimoramentoTemporarioSessaoCampanha
>;

export type BuffAprimoradoAtivoFormatado = {
  id: string;
  tecnicaNome: string;
  grauLabel: string;
  bonusLabel: string;
  fonte: 'Aprimorado';
  duracao: 'até o fim da cena';
  texto: string;
};

const ROTULOS_TIPO_GRAU: Record<string, string> = {
  TECNICA_AMALDICOADA: 'Técnica Amaldiçoada',
  TECNICA_REVERSA: 'Técnica Reversa',
  TECNICAS_DE_BARREIRA: 'Técnicas de Barreira',
  BARREIRA: 'Barreira',
  DOMINIO: 'Domínio',
};

const ROTULOS_TOKEN_GRAU: Record<string, string> = {
  TECNICA: 'Técnica',
  TECNICAS: 'Técnicas',
  AMALDICOADA: 'Amaldiçoada',
  AMALDICOADAS: 'Amaldiçoadas',
  REVERSA: 'Reversa',
  REVERSAS: 'Reversas',
  BARREIRA: 'Barreira',
  BARREIRAS: 'Barreiras',
  DOMINIO: 'Domínio',
  DOMINIOS: 'Domínios',
  DE: 'de',
  DO: 'do',
  DA: 'da',
  DOS: 'dos',
  DAS: 'das',
};

function normalizarTexto(valor: unknown, fallback: string): string {
  if (typeof valor !== 'string') return fallback;
  const texto = valor.trim();
  return texto.length > 0 ? texto : fallback;
}

export function formatarTipoGrauAprimorado(codigo?: string | null): string {
  const chave = normalizarTexto(codigo, '').toUpperCase();
  if (!chave) return 'Grau';
  const rotuloDireto = ROTULOS_TIPO_GRAU[chave];
  if (rotuloDireto) return rotuloDireto;

  const tokens = chave
    .split('_')
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return 'Grau';
  return tokens
    .map((token) => {
      const rotulo = ROTULOS_TOKEN_GRAU[token];
      if (rotulo) return rotulo;
      return token.charAt(0) + token.slice(1).toLowerCase();
    })
    .join(' ');
}

export function formatarBonusGrausAprimorado(graus?: number | null): string {
  const valor =
    typeof graus === 'number' && Number.isFinite(graus)
      ? Math.max(0, Math.trunc(graus))
      : 0;
  return `+${valor} ${valor === 1 ? 'grau' : 'graus'}`;
}

export function formatarBuffsAprimoradoAtivos(
  aprimoramentos?: AprimoramentoTemporarioFormatavel[] | null,
): BuffAprimoradoAtivoFormatado[] {
  if (!Array.isArray(aprimoramentos) || aprimoramentos.length === 0) {
    return [];
  }

  return aprimoramentos.map((item, indice) => {
    const tecnicaNome = normalizarTexto(item.tecnicaNome, 'Técnica');
    const grauLabel = formatarTipoGrauAprimorado(item.tipoGrauCodigo);
    const bonusLabel = formatarBonusGrausAprimorado(item.graus);
    const id =
      normalizarTexto(item.id, '') ||
      `aprimorado:${item.personagemCampanhaId ?? 'personagem'}:${item.tecnicaId ?? 'tecnica'}:${item.tipoGrauCodigo ?? indice}`;

    return {
      id,
      tecnicaNome,
      grauLabel,
      bonusLabel,
      fonte: 'Aprimorado',
      duracao: 'até o fim da cena',
      texto: `Aprimorado: ${tecnicaNome} · ${grauLabel} ${bonusLabel} · até o fim da cena`,
    };
  });
}
