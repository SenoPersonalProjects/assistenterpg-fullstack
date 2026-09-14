import { TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@prisma/client';

export const CAMPOS_REFERENCIA_NPC_SESSAO_EVENTO = new Set([
  'npcSessaoId',
  'alvoNpcSessaoId',
  'origemNpcSessaoId',
  'npcId',
  'alvoNpcId',
  'origemNpcId',
  'npcSessaoIdRestaurado',
]);

export type AtributosNpcSessao = {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
};

type OrigemAtributosNpc = {
  [Chave in keyof AtributosNpcSessao]?: number | null;
};

export function montarAtributosNpc(
  origem: OrigemAtributosNpc,
): AtributosNpcSessao {
  return {
    agilidade: Number(origem.agilidade ?? 0),
    forca: Number(origem.forca ?? 0),
    intelecto: Number(origem.intelecto ?? 0),
    presenca: Number(origem.presenca ?? 0),
    vigor: Number(origem.vigor ?? 0),
  };
}

export function montarAtributosNpcSessao(
  origem: OrigemAtributosNpc & { npcAmeacaId: number | null },
): AtributosNpcSessao | null {
  return origem.npcAmeacaId === null ? montarAtributosNpc(origem) : null;
}

export function obterAtributoNpcPorBase(
  atributos: AtributosNpcSessao,
  atributoBase: 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG',
): number {
  const atributoPorBase = {
    AGI: atributos.agilidade,
    FOR: atributos.forca,
    INT: atributos.intelecto,
    PRE: atributos.presenca,
    VIG: atributos.vigor,
  } as const;
  return atributoPorBase[atributoBase];
}

export function calcularDadosPadraoPericia(atributo: number): number {
  return atributo > 0 ? atributo : 2 + Math.abs(atributo);
}

export function normalizarTipoFichaNpcAmeaca(
  valor: string | null,
): TipoFichaNpcAmeaca | null {
  if (!valor) return null;
  const tiposValidos: TipoFichaNpcAmeaca[] = ['NPC', 'AMEACA'];
  return tiposValidos.includes(valor as TipoFichaNpcAmeaca)
    ? (valor as TipoFichaNpcAmeaca)
    : null;
}

export function normalizarTipoNpcAmeaca(
  valor: string | null,
): TipoNpcAmeaca | null {
  if (!valor) return null;
  const tiposValidos: TipoNpcAmeaca[] = [
    'HUMANO',
    'FEITICEIRO',
    'MALDICAO',
    'ANIMAL',
    'HIBRIDO',
    'OUTRO',
  ];
  return tiposValidos.includes(valor as TipoNpcAmeaca)
    ? (valor as TipoNpcAmeaca)
    : null;
}

export type NpcSessaoControle = {
  controladorUsuarioId: number | null;
  personagemDono?: { donoId: number } | null;
  personagemControladorSessao?: { controladorUsuarioId: number | null } | null;
};

export function podeControlarNpcSessao(
  ehMestre: boolean,
  usuarioId: number,
  npc: NpcSessaoControle | null,
): boolean {
  return Boolean(
    ehMestre ||
    npc?.controladorUsuarioId === usuarioId ||
    npc?.personagemDono?.donoId === usuarioId ||
    npc?.personagemControladorSessao?.controladorUsuarioId === usuarioId,
  );
}

export function montarResumoNpcSessao(npc: {
  id: number;
  nomeExibicao: string;
  fichaTipo: string;
  tipo: string;
  ocultoJogadores: boolean;
}) {
  return {
    npcSessaoId: npc.id,
    nome: npc.nomeExibicao,
    fichaTipo: npc.fichaTipo,
    tipo: npc.tipo,
    visibilidade: 'resumida' as const,
    ocultoJogadores: npc.ocultoJogadores,
    condicoesAtivas: [],
  };
}

export function filtrarNpcsVisiveisCenaAtual<
  T extends { ocultoJogadores: boolean },
>(npcs: T[], ehMestre: boolean): T[] {
  return ehMestre ? npcs : npcs.filter((npc) => !npc.ocultoJogadores);
}

export function normalizarInteiroEvento(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isInteger(valor)) return valor;
  if (typeof valor !== 'string' || !/^\d+$/.test(valor.trim())) return null;
  const numero = Number(valor.trim());
  return Number.isInteger(numero) ? numero : null;
}

export function eventoReferenciaNpcOculto(
  valor: unknown,
  npcSessaoIdsOcultos: Set<number>,
): boolean {
  if (Array.isArray(valor)) {
    return valor.some((item) =>
      eventoReferenciaNpcOculto(item, npcSessaoIdsOcultos),
    );
  }
  if (!valor || typeof valor !== 'object') return false;
  const registro = valor as Record<string, unknown>;
  if (registro.ocultoJogadores === true) return true;
  return Object.entries(registro).some(([chave, item]) => {
    const npcSessaoId = CAMPOS_REFERENCIA_NPC_SESSAO_EVENTO.has(chave)
      ? normalizarInteiroEvento(item)
      : null;
    return (
      (npcSessaoId !== null && npcSessaoIdsOcultos.has(npcSessaoId)) ||
      eventoReferenciaNpcOculto(item, npcSessaoIdsOcultos)
    );
  });
}

export function filtrarEventosVisiveisParaJogador<T extends { dados: unknown }>(
  eventos: T[],
  npcSessaoIdsOcultos: Set<number>,
): T[] {
  return eventos.filter(
    (evento) => !eventoReferenciaNpcOculto(evento.dados, npcSessaoIdsOcultos),
  );
}
