import { apiClient } from './axios-client';
import type {
  AmigoResumo,
  SolicitacoesAmizade,
  UsuarioAmizadeResumo,
} from '@/lib/types';

type AtualizacaoAmizadesDetail = {
  totalRecebidas: number | null;
};

const EVENTO_AMIZADES_ATUALIZADO = 'assistenterpg:amizades-atualizado';

function emitirAtualizacaoAmizades(totalRecebidas: number | null): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<AtualizacaoAmizadesDetail>(EVENTO_AMIZADES_ATUALIZADO, {
      detail: { totalRecebidas },
    }),
  );
}

export function apiNotificarAmizadesAtualizadas(
  totalRecebidas: number | null,
): void {
  emitirAtualizacaoAmizades(totalRecebidas);
}

export function apiInscreverAtualizacaoAmizades(
  onUpdate: (totalRecebidas: number | null) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<AtualizacaoAmizadesDetail>;
    const total =
      typeof customEvent.detail?.totalRecebidas === 'number'
        ? customEvent.detail.totalRecebidas
        : null;
    onUpdate(total);
  };

  window.addEventListener(EVENTO_AMIZADES_ATUALIZADO, listener as EventListener);

  return () => {
    window.removeEventListener(
      EVENTO_AMIZADES_ATUALIZADO,
      listener as EventListener,
    );
  };
}

export async function apiListarAmigos(): Promise<AmigoResumo[]> {
  const { data } = await apiClient.get('/amizades');
  return Array.isArray(data) ? data : [];
}

export async function apiListarSolicitacoesAmizade(): Promise<SolicitacoesAmizade> {
  const { data } = await apiClient.get('/amizades/solicitacoes');
  const recebidas = Array.isArray(data?.recebidas) ? data.recebidas : [];
  const enviadas = Array.isArray(data?.enviadas) ? data.enviadas : [];
  return { recebidas, enviadas };
}

export async function apiResolverUsuarioAmizade(
  identificador: string,
): Promise<UsuarioAmizadeResumo> {
  const params = new URLSearchParams({ identificador });
  const { data } = await apiClient.get(
    `/amizades/usuarios/resolver?${params.toString()}`,
  );
  return data;
}

export async function apiCriarSolicitacaoAmizade(
  identificador: string,
): Promise<void> {
  await apiClient.post('/amizades/solicitacoes', { identificador });
  emitirAtualizacaoAmizades(null);
}

export async function apiCriarSolicitacaoAmizadePorUsuarioId(
  usuarioId: number,
): Promise<void> {
  await apiClient.post('/amizades/solicitacoes', { usuarioId });
  emitirAtualizacaoAmizades(null);
}

export async function apiAceitarSolicitacaoAmizade(id: number): Promise<void> {
  await apiClient.post(`/amizades/solicitacoes/${id}/aceitar`);
  emitirAtualizacaoAmizades(null);
}

export async function apiRecusarSolicitacaoAmizade(id: number): Promise<void> {
  await apiClient.post(`/amizades/solicitacoes/${id}/recusar`);
  emitirAtualizacaoAmizades(null);
}

export async function apiCancelarSolicitacaoAmizade(id: number): Promise<void> {
  await apiClient.delete(`/amizades/solicitacoes/${id}`);
  emitirAtualizacaoAmizades(null);
}

export async function apiRemoverAmizade(usuarioId: number): Promise<void> {
  await apiClient.delete(`/amizades/${usuarioId}`);
  emitirAtualizacaoAmizades(null);
}
