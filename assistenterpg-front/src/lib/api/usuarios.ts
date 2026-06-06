import { apiClient } from './axios-client';
import type {
  AlterarSenhaResponse,
  AtualizarPreferenciasPayload,
  EstatisticasUsuario,
  ExcluirContaResponse,
  PreferenciasUsuario,
} from '@/lib/types';

export type MensagemContaResponse = {
  mensagem: string;
};

export async function apiObterEstatisticas(): Promise<EstatisticasUsuario> {
  const { data } = await apiClient.get('/usuarios/me/estatisticas');
  return data;
}

export async function apiObterPreferencias(): Promise<PreferenciasUsuario> {
  const { data } = await apiClient.get('/usuarios/me/preferencias');
  return data;
}

export async function apiAtualizarPreferencias(
  payload: AtualizarPreferenciasPayload,
): Promise<PreferenciasUsuario> {
  const { data } = await apiClient.patch('/usuarios/me/preferencias', payload);
  return data;
}

export async function apiAlterarSenha(
  senhaAtual: string,
  novaSenha: string,
): Promise<AlterarSenhaResponse> {
  const { data } = await apiClient.patch('/usuarios/me/senha', {
    senhaAtual,
    novaSenha,
  });
  return data;
}

export async function apiSolicitarAlteracaoEmail(
  novoEmail: string,
  senhaAtual: string,
): Promise<MensagemContaResponse> {
  const { data } = await apiClient.patch('/usuarios/me/email', {
    novoEmail,
    senhaAtual,
  });
  return data;
}

export async function apiDesativarConta(
  senhaAtual: string,
): Promise<MensagemContaResponse> {
  const { data } = await apiClient.post('/usuarios/me/desativar', {
    senhaAtual,
  });
  return data;
}

export async function apiExportarDados(): Promise<void> {
  const { data } = await apiClient.get('/usuarios/me/exportar', {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([data]));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `dados-assistenterpg-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export async function apiExcluirConta(
  senhaAtual: string,
): Promise<ExcluirContaResponse> {
  const { data } = await apiClient.delete('/usuarios/me', {
    data: { senhaAtual },
  });
  return data;
}
