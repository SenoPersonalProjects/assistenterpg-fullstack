// lib/api/campanhas.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  CampanhaResumo,
  ConviteCampanha,
  HistoricoPersonagemCampanha,
  ModificadorPersonagemCampanha,
  PersonagemBaseDisponivelCampanha,
  PersonagemCampanhaResumo,
  AplicarCondicaoSessaoCampanhaPayload,
  AdicionarNpcSessaoCampanhaPayload,
  AtualizarNpcSessaoCampanhaPayload,
  CampoModificadorPersonagemCampanha,
  EventoSessaoTimeline,
  MensagemChatSessao,
  SessaoCampanhaDetalhe,
  SessaoCampanhaResumo,
  TipoCenaSessaoCampanha,
} from '@/lib/types';

export type AtualizarOrdemIniciativaSessaoCampanhaPayload = {
  ordem: Array<{
    tipoParticipante: 'PERSONAGEM' | 'NPC';
    id: number;
  }>;
  indiceTurnoAtual?: number;
};

export type UsarHabilidadeSessaoCampanhaPayload = {
  habilidadeTecnicaId: number;
  variacaoHabilidadeId?: number;
  acumulos?: number;
};

type MinhasCampanhasQuery = {
  page?: number;
  limit?: number;
};

type CampanhaByIdOptions = {
  forceRefresh?: boolean;
  cacheTtlMs?: number;
};

type CampanhaDetalheCacheEntry = {
  data: unknown;
  expiresAt: number;
};

type AtualizacaoConvitesPendentesDetail = {
  total: number | null;
};

const CAMPANHA_DETALHE_CACHE_TTL_MS = 30_000;
const campanhaDetalheCache = new Map<string, CampanhaDetalheCacheEntry>();
const campanhaDetalheInFlight = new Map<string, Promise<unknown>>();
const EVENTO_CONVITES_PENDENTES_ATUALIZADO =
  'assistenterpg:convites-pendentes-atualizado';

function emitirAtualizacaoConvitesPendentes(total: number | null): void {
  if (typeof window === 'undefined') return;

  const evento = new CustomEvent<AtualizacaoConvitesPendentesDetail>(
    EVENTO_CONVITES_PENDENTES_ATUALIZADO,
    {
      detail: { total },
    },
  );

  window.dispatchEvent(evento);
}

export function apiNotificarConvitesPendentesAtualizados(
  total: number | null,
): void {
  emitirAtualizacaoConvitesPendentes(total);
}

export function apiInscreverAtualizacaoConvitesPendentes(
  onUpdate: (total: number | null) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<AtualizacaoConvitesPendentesDetail>;
    const total =
      typeof customEvent.detail?.total === 'number' ? customEvent.detail.total : null;
    onUpdate(total);
  };

  window.addEventListener(
    EVENTO_CONVITES_PENDENTES_ATUALIZADO,
    listener as EventListener,
  );

  return () => {
    window.removeEventListener(
      EVENTO_CONVITES_PENDENTES_ATUALIZADO,
      listener as EventListener,
    );
  };
}

export function apiInvalidateCampanhaDetalheCache(id?: number | string): void {
  if (id === undefined) {
    campanhaDetalheCache.clear();
    campanhaDetalheInFlight.clear();
    return;
  }

  const key = String(id);
  campanhaDetalheCache.delete(key);
  campanhaDetalheInFlight.delete(key);
}

export async function apiGetMinhasCampanhas(
  query?: MinhasCampanhasQuery,
): Promise<ListResult<CampanhaResumo>> {
  const params = new URLSearchParams();
  if (query?.page) params.set('page', String(query.page));
  if (query?.limit) params.set('limit', String(query.limit));

  const url =
    params.size > 0 ? `/campanhas/minhas?${params.toString()}` : '/campanhas/minhas';
  const { data } = await apiClient.get(url);
  return normalizeListResult<CampanhaResumo>(data);
}

export async function apiCreateCampanha(payload: {
  nome: string;
  descricao?: string;
}): Promise<CampanhaResumo> {
  const { data } = await apiClient.post('/campanhas', payload);
  return data;
}

export async function apiDeleteCampanha(id: number): Promise<void> {
  await apiClient.delete(`/campanhas/${id}`);
  apiInvalidateCampanhaDetalheCache(id);
}

export async function apiGetCampanhaById<T = unknown>(
  id: number | string,
  options: CampanhaByIdOptions = {},
): Promise<T> {
  const key = String(id);
  const ttlMs = options.cacheTtlMs ?? CAMPANHA_DETALHE_CACHE_TTL_MS;

  if (options.forceRefresh) {
    apiInvalidateCampanhaDetalheCache(key);
  } else {
    const cacheEntry = campanhaDetalheCache.get(key);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data as T;
    }
  }

  const requestInFlight = campanhaDetalheInFlight.get(key);
  if (requestInFlight) {
    return (await requestInFlight) as T;
  }

  const request = apiClient
    .get(`/campanhas/${id}`)
    .then(({ data }) => {
      campanhaDetalheCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      return data;
    })
    .finally(() => {
      campanhaDetalheInFlight.delete(key);
    });

  campanhaDetalheInFlight.set(key, request);
  return (await request) as T;
}

export async function apiCriarConvite(
  campanhaId: number,
  payload: { email?: string; apelido?: string; papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR' },
): Promise<ConviteCampanha> {
  const { data } = await apiClient.post(`/campanhas/${campanhaId}/convites`, payload);
  return data;
}

export async function apiListarConvitesPendentes(): Promise<ConviteCampanha[]> {
  const { data } = await apiClient.get('/campanhas/convites/pendentes');
  const convites = Array.isArray(data) ? data : [];
  emitirAtualizacaoConvitesPendentes(convites.length);
  return convites;
}

export async function apiAceitarConvite(codigo: string): Promise<void> {
  await apiClient.post(`/campanhas/convites/${codigo}/aceitar`);
  emitirAtualizacaoConvitesPendentes(null);
}

export async function apiRecusarConvite(codigo: string): Promise<void> {
  await apiClient.post(`/campanhas/convites/${codigo}/recusar`);
  emitirAtualizacaoConvitesPendentes(null);
}

export async function apiListarPersonagensCampanha(
  campanhaId: number,
): Promise<PersonagemCampanhaResumo[]> {
  const { data } = await apiClient.get(`/campanhas/${campanhaId}/personagens`);
  return Array.isArray(data) ? data : [];
}

export async function apiListarPersonagensBaseDisponiveisCampanha(
  campanhaId: number,
): Promise<PersonagemBaseDisponivelCampanha[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/personagens-base-disponiveis`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiVincularPersonagemCampanha(
  campanhaId: number,
  payload: { personagemBaseId: number },
): Promise<PersonagemCampanhaResumo> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens`,
    payload,
  );
  apiInvalidateCampanhaDetalheCache(campanhaId);
  return data;
}

export async function apiDesassociarPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<{
  id: number;
  campanhaId: number;
  personagemBaseId: number;
  message: string;
}> {
  const { data } = await apiClient.delete(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}`,
  );
  apiInvalidateCampanhaDetalheCache(campanhaId);
  return data;
}

export async function apiAtualizarRecursosPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  payload: Partial<{
    pvAtual: number;
    peAtual: number;
    eaAtual: number;
    sanAtual: number;
  }>,
): Promise<PersonagemCampanhaResumo> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/recursos`,
    payload,
  );
  return data;
}

export async function apiAtualizarNucleoPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  payload: { nucleo: 'EQUILIBRIO' | 'PODER' | 'IMPULSO' },
): Promise<PersonagemCampanhaResumo> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/nucleo`,
    payload,
  );
  return data;
}

export async function apiSacrificarNucleoPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  payload: { modo: 'ATUAL' | 'OUTRO'; nucleo?: 'EQUILIBRIO' | 'PODER' | 'IMPULSO' },
): Promise<PersonagemCampanhaResumo> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/nucleos/sacrificar`,
    payload,
  );
  return data;
}

export async function apiListarModificadoresPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  incluirInativos = false,
  filtros?: {
    sessaoId?: number;
    cenaId?: number;
  },
): Promise<ModificadorPersonagemCampanha[]> {
  const query = new URLSearchParams();
  if (incluirInativos) {
    query.set('incluirInativos', 'true');
  }
  if (typeof filtros?.sessaoId === 'number' && Number.isInteger(filtros.sessaoId)) {
    query.set('sessaoId', String(filtros.sessaoId));
  }
  if (typeof filtros?.cenaId === 'number' && Number.isInteger(filtros.cenaId)) {
    query.set('cenaId', String(filtros.cenaId));
  }
  const sufixo = query.size > 0 ? `?${query.toString()}` : '';
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/modificadores${sufixo}`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiAplicarModificadorPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  payload: {
    campo: CampoModificadorPersonagemCampanha;
    valor: number;
    nome: string;
    descricao?: string;
    sessaoId?: number;
    cenaId?: number;
  },
): Promise<{
  modificador: ModificadorPersonagemCampanha;
  personagem: PersonagemCampanhaResumo;
}> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/modificadores`,
    payload,
  );
  return data;
}

export async function apiDesfazerModificadorPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  modificadorId: number,
  payload?: { motivo?: string },
): Promise<{
  modificador: ModificadorPersonagemCampanha;
  personagem: PersonagemCampanhaResumo;
}> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/modificadores/${modificadorId}/desfazer`,
    payload ?? {},
  );
  return data;
}

export async function apiListarHistoricoPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<HistoricoPersonagemCampanha[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/historico`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiListarSessoesCampanha(
  campanhaId: number,
): Promise<SessaoCampanhaResumo[]> {
  const { data } = await apiClient.get(`/campanhas/${campanhaId}/sessoes`);
  return Array.isArray(data) ? data : [];
}

export async function apiCriarSessaoCampanha(
  campanhaId: number,
  payload?: { titulo?: string },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(`/campanhas/${campanhaId}/sessoes`, payload ?? {});
  apiInvalidateCampanhaDetalheCache(campanhaId);
  return data;
}

export async function apiEncerrarSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/encerrar`,
  );
  return data;
}

export async function apiGetSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}`,
  );
  return data;
}

export async function apiAtualizarCenaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: {
    tipo: TipoCenaSessaoCampanha;
    nome?: string;
    limitesCategoriaAtivo?: boolean;
  },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/cena`,
    payload,
  );
  return data;
}

export async function apiAvancarTurnoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/turno/avancar`,
  );
  return data;
}

export async function apiVoltarTurnoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/turno/voltar`,
  );
  return data;
}

export async function apiPularTurnoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/turno/pular`,
  );
  return data;
}

export async function apiAtualizarOrdemIniciativaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: AtualizarOrdemIniciativaSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/iniciativa/ordem`,
    payload,
  );
  return data;
}

export async function apiAtualizarValorIniciativaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: {
    tipoParticipante: 'PERSONAGEM' | 'NPC';
    id: number;
    valorIniciativa?: number | null;
  },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/iniciativa/valor`,
    payload,
  );
  return data;
}

export async function apiAdicionarPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: { personagemCampanhaId: number; iniciativaValor?: number | null },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/personagens`,
    payload,
  );
  return data;
}

export async function apiRemoverPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemSessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.delete(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/personagens/${personagemSessaoId}`,
  );
  return data;
}

export async function apiAdicionarNpcSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: AdicionarNpcSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/npcs`,
    payload,
  );
  return data;
}

export async function apiAtualizarNpcSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  npcSessaoId: number,
  payload: AtualizarNpcSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/npcs/${npcSessaoId}`,
    payload,
  );
  return data;
}

export async function apiRemoverNpcSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  npcSessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.delete(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/npcs/${npcSessaoId}`,
  );
  return data;
}

export async function apiAplicarCondicaoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: AplicarCondicaoSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/condicoes/aplicar`,
    payload,
  );
  return data;
}

export async function apiRemoverCondicaoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  condicaoSessaoId: number,
  payload?: { motivo?: string },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/condicoes/${condicaoSessaoId}/remover`,
    payload ?? {},
  );
  return data;
}

export async function apiUsarHabilidadeSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemSessaoId: number,
  payload: UsarHabilidadeSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/personagens/${personagemSessaoId}/habilidades/usar`,
    payload,
  );
  return data;
}

export async function apiEncerrarSustentacaoHabilidadeSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemSessaoId: number,
  sustentacaoId: number,
  payload?: { motivo?: string },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/personagens/${personagemSessaoId}/sustentacoes/${sustentacaoId}/encerrar`,
    payload ?? {},
  );
  return data;
}

export async function apiListarChatSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  afterId?: number,
): Promise<MensagemChatSessao[]> {
  const params = new URLSearchParams();
  if (afterId && Number.isFinite(afterId)) {
    params.set('afterId', String(afterId));
  }

  const url =
    params.size > 0
      ? `/campanhas/${campanhaId}/sessoes/${sessaoId}/chat?${params.toString()}`
      : `/campanhas/${campanhaId}/sessoes/${sessaoId}/chat`;

  const { data } = await apiClient.get(url);
  return Array.isArray(data) ? data : [];
}

export async function apiListarEventosSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  query?: {
    limit?: number;
    incluirChat?: boolean;
  },
): Promise<EventoSessaoTimeline[]> {
  const params = new URLSearchParams();
  if (query?.limit && Number.isFinite(query.limit)) {
    params.set('limit', String(Math.trunc(query.limit)));
  }
  if (query?.incluirChat === true) {
    params.set('incluirChat', 'true');
  }

  const url =
    params.size > 0
      ? `/campanhas/${campanhaId}/sessoes/${sessaoId}/eventos?${params.toString()}`
      : `/campanhas/${campanhaId}/sessoes/${sessaoId}/eventos`;

  const { data } = await apiClient.get(url);
  return Array.isArray(data) ? data : [];
}

export async function apiDesfazerEventoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  eventoId: number,
  payload?: { motivo?: string },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/eventos/${eventoId}/desfazer`,
    payload ?? {},
  );
  return data;
}

export async function apiEnviarMensagemChatSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: { mensagem: string },
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/chat`,
    payload,
  );
  return data;
}
