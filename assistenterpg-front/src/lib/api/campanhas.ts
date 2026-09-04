// lib/api/campanhas.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  CampanhaResumo,
  ConviteCampanha,
  HistoricoPersonagemCampanha,
  ModificadorPersonagemCampanha,
  PersonagemBaseDisponivelCampanha,
  PersonagemCampanhaLista,
  PersonagemCampanhaResumo,
  AplicarCondicaoSessaoCampanhaPayload,
  AdicionarNpcSessaoCampanhaPayload,
  AdicionarNpcSimplesSessaoCampanhaPayload,
  AtualizarNpcSessaoCampanhaPayload,
  CampoModificadorPersonagemCampanha,
  EventoSessaoTimeline,
  CriarItemSessaoCampanhaPayload,
  CriarTemplateItemSessaoCampanhaPayload,
  ItemSessaoCampanhaDto,
  ItensSessaoCampanhaResponse,
  MensagemChatSessao,
  RegrasOpcionaisSessao,
  RegraOpcionalSessaoChave,
  SessaoCampanhaDetalhe,
  SessaoCampanhaRelatorio,
  SessaoCampanhaResumo,
  TemplateItemSessaoCampanhaDto,
  TipoCenaSessaoCampanha,
  TransferenciaItemSessaoCampanhaDto,
  AmigoConvidavelCampanha,
  AtualizarSessaoAgendadaPayload,
  ConcederMaldicaoControladaSessaoPayload,
  ConflitosSessaoAgendadaResponse,
  CriarSessaoAgendadaPayload,
  EntidadeVinculadaPersonagem,
  EntidadeVinculadaPersonagemPayload,
  CapacidadesEntidadesVinculadas,
  TemplateEntidadeVinculada,
  EstadoEntidadeVinculadaPersonagem,
  InvocarEntidadeVinculadaSessaoPayload,
  SessaoAgendadaResumo,
  AtualizacaoInspiracaoSessaoCampanha,
  AtualizacaoRecursosSessaoCampanha,
} from '@/lib/types';

export type AtualizarOrdemIniciativaSessaoCampanhaPayload = {
  ordem: Array<{
    tipoParticipante: 'PERSONAGEM' | 'NPC';
    id: number;
  }>;
  indiceTurnoAtual?: number;
};

export type UsarHabilidadeSessaoCampanhaPayload = {
  clientRequestId?: string;
  habilidadeTecnicaId: number;
  variacaoHabilidadeId?: number;
  acumulos?: number;
};

export type UsarHabilidadeClasseSessaoCampanhaPayload = {
  clientRequestId?: string;
  habilidadeId: number;
  versaoNivel: number;
  aprimoramentos?: Array<{
    tecnicaId: number;
    tipoGrauCodigo: string;
    graus: number;
  }>;
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
  payload: {
    email?: string;
    apelido?: string;
    usuarioId?: number;
    papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR';
  },
): Promise<ConviteCampanha> {
  const { data } = await apiClient.post(`/campanhas/${campanhaId}/convites`, payload);
  return data;
}

export async function apiListarAmigosConvidaveisCampanha(
  campanhaId: number,
): Promise<AmigoConvidavelCampanha[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/amigos-convidaveis`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiListarConvitesPendentes(): Promise<ConviteCampanha[]> {
  const { data } = await apiClient.get('/campanhas/convites/pendentes');
  const convites = Array.isArray(data) ? data : [];
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
): Promise<PersonagemCampanhaLista[]> {
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
  payload: {
    personagemBaseId: number;
    sincronizarTecnicaInata?: boolean;
  },
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

export async function apiAtualizarPersonagemCampanhaDaFichaBase(
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<PersonagemCampanhaResumo> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/atualizar-da-ficha-base`,
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

export async function apiListarEntidadesVinculadasPersonagem(
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<EntidadeVinculadaPersonagem[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiListarCapacidadesEntidadesVinculadas(
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<CapacidadesEntidadesVinculadas> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/capacidades`,
  );
  return data;
}

export async function apiListarTemplatesEntidadesVinculadas(
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<TemplateEntidadeVinculada[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/templates`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiAssociarTemplateEntidadeVinculada(
  campanhaId: number,
  personagemCampanhaId: number,
  templateId: number,
  payload: { overrideMestre?: boolean } = {},
): Promise<EntidadeVinculadaPersonagem> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/templates/${templateId}/associar`,
    payload,
  );
  return data;
}

export async function apiCriarEntidadeVinculadaPersonagem(
  campanhaId: number,
  personagemCampanhaId: number,
  payload: EntidadeVinculadaPersonagemPayload,
): Promise<EntidadeVinculadaPersonagem> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados`,
    payload,
  );
  return data;
}

export async function apiAtualizarEntidadeVinculadaPersonagem(
  campanhaId: number,
  personagemCampanhaId: number,
  vinculadoId: number,
  payload: Partial<EntidadeVinculadaPersonagemPayload>,
): Promise<EntidadeVinculadaPersonagem> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/${vinculadoId}`,
    payload,
  );
  return data;
}

export async function apiDuplicarEntidadeVinculadaPersonagem(
  campanhaId: number,
  personagemCampanhaId: number,
  vinculadoId: number,
): Promise<EntidadeVinculadaPersonagem> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/${vinculadoId}/duplicar`,
  );
  return data;
}

export async function apiRecalcularEntidadeVinculadaPersonagem(
  campanhaId: number,
  personagemCampanhaId: number,
  vinculadoId: number,
): Promise<EntidadeVinculadaPersonagem> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/${vinculadoId}/recalcular`,
  );
  return data;
}

export async function apiAtualizarEstadoEntidadeVinculadaPersonagem(
  campanhaId: number,
  personagemCampanhaId: number,
  vinculadoId: number,
  estado: EstadoEntidadeVinculadaPersonagem,
): Promise<EntidadeVinculadaPersonagem> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/${vinculadoId}/estado`,
    { estado },
  );
  return data;
}

export async function apiRemoverEntidadeVinculadaPersonagem(
  campanhaId: number,
  personagemCampanhaId: number,
  vinculadoId: number,
): Promise<EntidadeVinculadaPersonagem> {
  const { data } = await apiClient.delete(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/vinculados/${vinculadoId}`,
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
    periciaCodigo?: string;
    atributoCodigo?: string;
    tipoGrauCodigo?: string;
    resistenciaTipoId?: number;
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

export async function apiListarTiposResistenciaPersonagemCampanha(campanhaId: number, personagemCampanhaId: number): Promise<Array<{ id: number; codigo: string; nome: string; descricao: string | null }>> {
  const { data } = await apiClient.get(`/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/resistencias-tipos`);
  return Array.isArray(data) ? data : [];
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

export async function apiListarSessoesAgendadasCampanha(
  campanhaId: number,
): Promise<SessaoAgendadaResumo[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/sessoes-agendadas`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiListarConflitosSessaoAgendadaCampanha(
  campanhaId: number,
  query: {
    inicioEm: string;
    fimEm: string;
    incluirGoogle?: boolean;
  },
): Promise<ConflitosSessaoAgendadaResponse> {
  const params = new URLSearchParams({
    inicioEm: query.inicioEm,
    fimEm: query.fimEm,
  });
  if (query.incluirGoogle !== undefined) {
    params.set('incluirGoogle', String(query.incluirGoogle));
  }

  const { data } = await apiClient.get<ConflitosSessaoAgendadaResponse>(
    `/campanhas/${campanhaId}/sessoes-agendadas/conflitos?${params.toString()}`,
  );
  return data;
}

export async function apiCriarSessaoAgendadaCampanha(
  campanhaId: number,
  payload: CriarSessaoAgendadaPayload,
): Promise<SessaoAgendadaResumo> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes-agendadas`,
    payload,
  );
  apiInvalidateCampanhaDetalheCache(campanhaId);
  return data;
}

export async function apiAtualizarSessaoAgendadaCampanha(
  campanhaId: number,
  agendamentoId: number,
  payload: AtualizarSessaoAgendadaPayload,
): Promise<SessaoAgendadaResumo> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes-agendadas/${agendamentoId}`,
    payload,
  );
  return data;
}

export async function apiCancelarSessaoAgendadaCampanha(
  campanhaId: number,
  agendamentoId: number,
): Promise<SessaoAgendadaResumo> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes-agendadas/${agendamentoId}/cancelar`,
  );
  return data;
}

export async function apiAbrirSessaoAgendadaCampanha(
  campanhaId: number,
  agendamentoId: number,
): Promise<SessaoAgendadaResumo> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes-agendadas/${agendamentoId}/abrir`,
  );
  apiInvalidateCampanhaDetalheCache(campanhaId);
  return data;
}

export async function apiRetryCalendarSessaoAgendadaCampanha(
  campanhaId: number,
  agendamentoId: number,
): Promise<SessaoAgendadaResumo> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes-agendadas/${agendamentoId}/calendar/retry`,
  );
  return data;
}

export async function apiGetRelatorioSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
): Promise<SessaoCampanhaRelatorio> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/relatorio`,
  );
  return data;
}

export async function apiListarRegrasOpcionaisSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
): Promise<RegrasOpcionaisSessao> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/regras-opcionais`,
  );
  return data;
}

export async function apiAtualizarRegraOpcionalSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: {
    chave: RegraOpcionalSessaoChave;
    ativo: boolean;
    config?: Record<string, unknown>;
  },
) {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/regras-opcionais`,
    payload,
  );
  return data;
}

export async function apiAjustarInspiracaoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemCampanhaId: number,
  payload: { delta: number; clientRequestId?: string },
): Promise<AtualizacaoInspiracaoSessaoCampanha> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/inspiracao/${personagemCampanhaId}/ajustar`,
    payload,
  );
  return data;
}

export async function apiGastarInspiracaoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemCampanhaId: number,
  payload: {
    custo: 1 | 2 | 3;
    efeito: 'BONUS_5' | 'MAXIMIZAR' | 'CRITICO';
    clientRequestId?: string;
  },
): Promise<AtualizacaoInspiracaoSessaoCampanha> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/inspiracao/${personagemCampanhaId}/gastar`,
    payload,
  );
  return data;
}

export async function apiAtualizarEncontroSocialSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: {
    alvos: Array<{
      npcSessaoId?: number | null;
      nome: string;
      interesseAtual: number;
      interesseAlvo: number;
      pacienciaAtual: number;
      motivacoes?: Array<{ texto: string; revelada?: boolean }>;
    }>;
  },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/mecanicas/social/encontros`,
    payload,
  );
  return data;
}

export async function apiAtualizarEscaladaDadosSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: { ativaNesteCombate: boolean; rodadaInicio?: number; bonusAtual?: number },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/mecanicas/escalada`,
    payload,
  );
  return data;
}

export async function apiAtualizarIniciativaAlternadaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: {
    lados: Array<{
      id?: number;
      nome: string;
      ordem?: number;
      participantes: Array<{ participanteToken: string }>;
    }>;
    ladoAtualId?: number;
  },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/iniciativa-alternada`,
    payload,
  );
  return data;
}

export async function apiMarcarParticipanteIniciativaAlternadaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: { participanteToken: string; jaAgiu: boolean },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/iniciativa-alternada/marcar`,
    payload,
  );
  return data;
}

export async function apiAvancarLadoIniciativaAlternadaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: ControleTurnoSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/iniciativa-alternada/avancar-lado`,
    payload,
  );
  return data;
}

export async function apiConsumirItemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: {
    itemInventarioCampanhaId: number;
    modo: 'NORMAL' | 'COM_CALMA' | 'MANUAL';
    alvoTipo?: 'PERSONAGEM' | 'NPC';
    alvoId?: number;
    observacao?: string;
    clientRequestId?: string;
  },
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/consumiveis/usar`,
    payload,
  );
  return data;
}

export async function apiAtualizarRecursosPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemSessaoId: number,
  payload: Partial<{
    clientRequestId: string;
    pvAtual: number;
    peAtual: number;
    eaAtual: number;
    sanAtual: number;
    pvAtualEsperado: number;
    peAtualEsperado: number;
    eaAtualEsperado: number;
    sanAtualEsperado: number;
  }>,
): Promise<AtualizacaoRecursosSessaoCampanha> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/personagens/${personagemSessaoId}/recursos`,
    payload,
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
  payload: ControleTurnoSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/turno/avancar`,
    payload,
  );
  return data;
}

export async function apiVoltarTurnoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: ControleTurnoSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/turno/voltar`,
    payload,
  );
  return data;
}

export async function apiPularTurnoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: ControleTurnoSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/turno/pular`,
    payload,
  );
  return data;
}

export type ControleTurnoSessaoCampanhaPayload = {
  rodadaEsperada: number;
  indiceTurnoEsperado?: number;
  ladoAtualIdEsperado?: number;
};

export async function apiReprocessarEfeitosTurnoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  eventoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/turno/efeitos/${eventoId}/reprocessar`,
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

export async function apiAdicionarNpcSimplesSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: AdicionarNpcSimplesSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/npcs-simples`,
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

export async function apiInvocarEntidadeVinculadaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  vinculadoId: number,
  payload: InvocarEntidadeVinculadaSessaoPayload = {},
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/vinculados/${vinculadoId}/invocar`,
    payload,
  );
  return data;
}

export async function apiDesinvocarEntidadeVinculadaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  npcSessaoId: number,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/npcs/${npcSessaoId}/desinvocar`,
  );
  return data;
}

export async function apiConcederMaldicaoControladaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: ConcederMaldicaoControladaSessaoPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/maldicoes/conceder`,
    payload,
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
  payload?: { motivo?: string; clientRequestId?: string },
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

export async function apiUsarHabilidadeClasseSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemSessaoId: number,
  payload: UsarHabilidadeClasseSessaoCampanhaPayload,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/personagens/${personagemSessaoId}/habilidades-classe/usar`,
    payload,
  );
  return data;
}

export async function apiEncerrarSustentacaoHabilidadeSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemSessaoId: number,
  sustentacaoId: number,
  payload?: { motivo?: string; clientRequestId?: string },
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

type EnviarMensagemTextoSessaoPayload = {
  mensagem: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
};

type EnviarMensagemChatSessaoLegadoPayload =
  EnviarMensagemTextoSessaoPayload & {
    dadosRolagem?: Record<string, unknown>;
    contextoRolagem?: Record<string, unknown>;
  };

async function postarMensagemChatSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: EnviarMensagemChatSessaoLegadoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/chat`,
    payload,
  );
  return data;
}

export async function apiEnviarMensagemTextoSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: EnviarMensagemTextoSessaoPayload,
): Promise<MensagemChatSessao> {
  return postarMensagemChatSessaoCampanha(campanhaId, sessaoId, payload);
}

/**
 * @deprecated Uso restrito a compatibilidade e historico legado.
 * Fluxos oficiais devem usar apiEnviarMensagemTextoSessaoCampanha ou /rolagens.
 * Nao usar para novas rolagens ou qualquer efeito mecanico.
 */
export async function apiEnviarMensagemChatSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: EnviarMensagemChatSessaoLegadoPayload,
): Promise<MensagemChatSessao> {
  return postarMensagemChatSessaoCampanha(campanhaId, sessaoId, payload);
}

export type CriarRolagemFormulaSessaoPayload = {
  tipo: 'FORMULA';
  expressao: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { tipo: 'OUTRO' };
  clientRequestId: string;
};

export type CriarRolagemPericiaPersonagemSessaoPayload = {
  tipo: 'PERICIA_PERSONAGEM';
  personagemSessaoId: number;
  periciaCodigo: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export type CriarRolagemAtaquePersonagemSessaoPayload = {
  tipo: 'ATAQUE_PERSONAGEM';
  personagemSessaoId: number;
  periciaCodigo: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export type CriarRolagemPericiaNpcSessaoPayload = {
  tipo: 'PERICIA_NPC';
  npcSessaoId: number;
  periciaCodigo: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export type CriarRolagemAtaqueNpcPericiaSessaoPayload = {
  tipo: 'ATAQUE_NPC';
  origemAtaque: 'PERICIA';
  npcSessaoId: number;
  periciaCodigo: string;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export type CriarRolagemAtaqueNpcAcaoSessaoPayload = {
  tipo: 'ATAQUE_NPC';
  origemAtaque: 'ACAO';
  npcSessaoId: number;
  acaoIndice: number;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export type CriarRolagemDanoNpcAcaoSessaoPayload = {
  tipo: 'DANO_NPC';
  origemDano: 'ACAO';
  npcSessaoId: number;
  acaoIndice: number;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  clientRequestId: string;
};

export type CriarRolagemTesteHabilidadePersonagemSessaoPayload = {
  tipo: 'TESTE_HABILIDADE_PERSONAGEM';
  personagemSessaoId: number;
  habilidadeTecnicaId: number;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  clientRequestId: string;
};

export type CriarRolagemDanoHabilidadePersonagemSessaoPayload = {
  tipo: 'DANO_PERSONAGEM';
  origemDano: 'HABILIDADE_TECNICA';
  personagemSessaoId: number;
  habilidadeTecnicaId: number;
  variacaoHabilidadeId?: number;
  acumulos?: number;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  clientRequestId: string;
};

export type CriarRolagemCriticoHabilidadePersonagemSessaoPayload = {
  tipo: 'CRITICO_PERSONAGEM';
  origemCritico: 'HABILIDADE_TECNICA';
  personagemSessaoId: number;
  habilidadeTecnicaId: number;
  variacaoHabilidadeId?: number;
  acumulos?: number;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  clientRequestId: string;
};

export type AjusteAutomaticoMacroArmaSessao = {
  condicao: string;
  dados: number;
  motivo: string;
};

export type MacroArmaSessao = {
  itemInventarioCampanhaId: number;
  nome: string;
  tipoArma: 'CORPO_A_CORPO' | 'A_DISTANCIA';
  pericia: { codigo: 'LUTA' | 'PONTARIA'; nome: string };
  agil: boolean;
  atributoPadrao: 'FOR' | 'AGI';
  atributosPermitidos: Array<'FOR' | 'AGI'>;
  empunhaduras: Array<'LEVE' | 'UMA_MAO' | 'DUAS_MAOS'>;
  danos: Array<{
    empunhadura: 'LEVE' | 'UMA_MAO' | 'DUAS_MAOS' | null;
    tipoDano: string;
    rolagem: string;
    valorFlat: number;
  }>;
  critico: { valor: number | null; multiplicador: number | null };
  preview: {
    dadosLogicos: number;
    quantidadeDados: number;
    keepMode: 'HIGHEST' | 'LOWEST';
    bonus: number;
    ajustesAutomaticos: AjusteAutomaticoMacroArmaSessao[];
  };
};

export type MacrosPersonagemSessaoResponse = {
  personagemSessaoId: number;
  personagemCampanhaId: number;
  armas: MacroArmaSessao[];
  personalizadas: MacroPersonalizadaSessao[];
};

export type MacroPersonalizadaTipo = 'ATAQUE_PERICIA' | 'DANO_FORMULA' | 'FORMULA_LIVRE';
export type VisibilidadeRolagemSessao = 'PUBLICA' | 'SECRETA_MESTRE';
export type AtributoMacroPersonalizada = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';
export type MacroAtaqueConfigV1 = {
  periciaCodigo: string;
  atributoBase?: AtributoMacroPersonalizada;
  categoriaAtaque: 'CORPO_A_CORPO' | 'A_DISTANCIA' | 'OUTRO';
  ajusteFlatPadrao: number;
  ajusteDadosPadrao: number;
  dtPadrao?: number;
};
export type MacroDanoConfigV1 = {
  formulaBase: string;
  tipoDano?: string;
  ajusteFlatPadrao: number;
  criticoMultiplicador?: number;
};
export type MacroFormulaLivreConfigV1 = { formula: string };
export type MacroPersonalizadaConfigV1 = MacroAtaqueConfigV1 | MacroDanoConfigV1 | MacroFormulaLivreConfigV1;
export type MacroPersonalizadaSessao = {
  id: number;
  nome: string;
  descricao: string | null;
  tipo: MacroPersonalizadaTipo;
  visibilidadePadrao: VisibilidadeRolagemSessao;
  configVersao: number;
  config: MacroPersonalizadaConfigV1;
  ordem: number;
  revisao: number;
  preview: null | {
    pericia: { codigo: string; nome: string };
    atributoBase: AtributoMacroPersonalizada;
    dadosLogicos: number;
    quantidadeDados: number;
    keepMode: 'HIGHEST' | 'LOWEST';
    bonus: number;
    ajustesAutomaticos: AjusteAutomaticoMacroArmaSessao[];
  };
};
export type SalvarMacroPersonagemCampanhaPayload = {
  tipo: MacroPersonalizadaTipo;
  nome: string;
  descricao?: string;
  visibilidadePadrao?: VisibilidadeRolagemSessao;
  config: MacroPersonalizadaConfigV1;
};
export type MacroPersonagemCampanhaDto = MacroPersonalizadaSessao & {
  campanhaId: number;
  personagemCampanhaId: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type CriarRolagemAtaqueItemPersonagemSessaoPayload = {
  tipo: 'ATAQUE_ITEM_PERSONAGEM';
  personagemSessaoId: number;
  itemInventarioCampanhaId: number;
  atributoEscolhido?: 'FOR' | 'AGI';
  ajusteFlatManual?: number;
  ajusteDadosManual?: number;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  contexto?: { dt?: number };
  clientRequestId: string;
};

export type CriarRolagemDanoItemPersonagemSessaoPayload = {
  tipo: 'DANO_ITEM_PERSONAGEM' | 'CRITICO_ITEM_PERSONAGEM';
  personagemSessaoId: number;
  itemInventarioCampanhaId: number;
  empunhadura?: 'LEVE' | 'UMA_MAO' | 'DUAS_MAOS';
  ajusteFlatManual?: number;
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  clientRequestId: string;
};

export type CriarRolagemMacroPersonagemSessaoPayload = {
  tipo: 'ATAQUE_MACRO_PERSONAGEM' | 'DANO_MACRO_PERSONAGEM' | 'CRITICO_MACRO_PERSONAGEM' | 'FORMULA_MACRO_PERSONAGEM';
  personagemSessaoId: number;
  macroId: number;
  ajusteFlatSessao?: number;
  ajusteDadosSessao?: number;
  visibilidade?: VisibilidadeRolagemSessao;
  contexto?: { dt?: number };
  clientRequestId: string;
};

export async function apiCriarRolagemFormulaSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemFormulaSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemPericiaPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemPericiaPersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemAtaquePersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemAtaquePersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemPericiaNpcSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemPericiaNpcSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemAtaqueNpcSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload:
    | CriarRolagemAtaqueNpcPericiaSessaoPayload
    | CriarRolagemAtaqueNpcAcaoSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemDanoNpcSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemDanoNpcAcaoSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemTesteHabilidadePersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemTesteHabilidadePersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemDanoHabilidadePersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemDanoHabilidadePersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemCriticoHabilidadePersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemCriticoHabilidadePersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiListarMacrosPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  personagemSessaoId: number,
): Promise<MacrosPersonagemSessaoResponse> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/personagens/${personagemSessaoId}/macros`,
  );
  return data;
}

export async function apiCriarMacroPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  payload: SalvarMacroPersonagemCampanhaPayload,
): Promise<MacroPersonagemCampanhaDto> {
  const { data } = await apiClient.post(`/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/macros`, payload);
  return data;
}

export async function apiAtualizarMacroPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  macroId: number,
  payload: SalvarMacroPersonagemCampanhaPayload & { revisaoEsperada: number },
): Promise<MacroPersonagemCampanhaDto> {
  const { data } = await apiClient.patch(`/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/macros/${macroId}`, payload);
  return data;
}

export async function apiRemoverMacroPersonagemCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  macroId: number,
): Promise<{ id: number; ativo: false }> {
  const { data } = await apiClient.delete(`/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/macros/${macroId}`);
  return data;
}

export async function apiCriarRolagemAtaqueItemPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemAtaqueItemPersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemDanoItemPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemDanoItemPersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`,
    payload,
  );
  return data;
}

export async function apiCriarRolagemMacroPersonagemSessaoCampanha(
  campanhaId: number,
  sessaoId: number,
  payload: CriarRolagemMacroPersonagemSessaoPayload,
): Promise<MensagemChatSessao> {
  const { data } = await apiClient.post(`/campanhas/${campanhaId}/sessoes/${sessaoId}/rolagens`, payload);
  return data;
}

export async function apiListarItensSessaoCampanha(
  campanhaId: number,
): Promise<ItensSessaoCampanhaResponse> {
  const { data } = await apiClient.get(`/campanhas/${campanhaId}/itens-sessao`);
  return data;
}

export async function apiCriarItemSessaoCampanha(
  campanhaId: number,
  payload: CriarItemSessaoCampanhaPayload,
): Promise<ItemSessaoCampanhaDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/itens-sessao`,
    payload,
  );
  return data;
}

export async function apiAtualizarItemSessaoCampanha(
  campanhaId: number,
  itemId: number,
  payload: Partial<CriarItemSessaoCampanhaPayload>,
): Promise<ItemSessaoCampanhaDto> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/itens-sessao/${itemId}`,
    payload,
  );
  return data;
}

export async function apiAtribuirItemSessaoCampanha(
  campanhaId: number,
  itemId: number,
  payload: { personagemCampanhaId?: number | null },
): Promise<ItemSessaoCampanhaDto> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/itens-sessao/${itemId}/atribuicao`,
    payload,
  );
  return data;
}

export async function apiRevelarItemSessaoCampanha(
  campanhaId: number,
  itemId: number,
  payload: { descricaoRevelada: boolean },
): Promise<ItemSessaoCampanhaDto> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/itens-sessao/${itemId}/revelacao`,
    payload,
  );
  return data;
}

export async function apiListarTransferenciasItensSessaoCampanha(
  campanhaId: number,
): Promise<TransferenciaItemSessaoCampanhaDto[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/itens-sessao/transferencias/pendentes`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiSolicitarTransferenciaItemSessaoCampanha(
  campanhaId: number,
  itemId: number,
  payload:
    | {
        destinoTipo: 'PERSONAGEM';
        destinoPersonagemCampanhaId: number;
      }
    | {
        destinoTipo: 'NPC';
        destinoNpcSessaoId: number;
      },
): Promise<TransferenciaItemSessaoCampanhaDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/itens-sessao/${itemId}/transferencias`,
    payload,
  );
  return data;
}

export async function apiAceitarTransferenciaItemSessaoCampanha(
  campanhaId: number,
  transferenciaId: number,
): Promise<TransferenciaItemSessaoCampanhaDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/itens-sessao/transferencias/${transferenciaId}/aceitar`,
  );
  return data;
}

export async function apiRecusarTransferenciaItemSessaoCampanha(
  campanhaId: number,
  transferenciaId: number,
): Promise<TransferenciaItemSessaoCampanhaDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/itens-sessao/transferencias/${transferenciaId}/recusar`,
  );
  return data;
}

export async function apiListarTemplatesItensSessaoCampanha(
  campanhaId: number,
): Promise<TemplateItemSessaoCampanhaDto[]> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/itens-sessao/templates`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiCriarTemplateItemSessaoCampanha(
  campanhaId: number,
  payload: CriarTemplateItemSessaoCampanhaPayload,
): Promise<TemplateItemSessaoCampanhaDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/itens-sessao/templates`,
    payload,
  );
  return data;
}

export async function apiAtualizarTemplateItemSessaoCampanha(
  campanhaId: number,
  templateId: number,
  payload: Partial<CriarTemplateItemSessaoCampanhaPayload>,
): Promise<TemplateItemSessaoCampanhaDto> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/itens-sessao/templates/${templateId}`,
    payload,
  );
  return data;
}

export async function apiInstanciarTemplateItemSessaoCampanha(
  campanhaId: number,
  templateId: number,
  payload?: Partial<CriarItemSessaoCampanhaPayload>,
): Promise<ItemSessaoCampanhaDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/itens-sessao/templates/${templateId}/instanciar`,
    payload ?? {},
  );
  return data;
}
