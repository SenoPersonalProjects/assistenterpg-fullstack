// lib/api/usuarios.ts
import { apiClient } from './axios-client';
import type {
  EstatisticasUsuario,
  PreferenciasUsuario,
  AtualizarPreferenciasPayload,
  AlterarSenhaResponse,
  ExcluirContaResponse,
} from '@/lib/types'; // ✅ ATUALIZADO

/**
 * ✅ Buscar estatísticas do usuário logado
 */
export async function apiObterEstatisticas(): Promise<EstatisticasUsuario> {
  const { data } = await apiClient.get('/usuarios/me/estatisticas');
  return data;
}

/**
 * ✅ Buscar preferências do usuário logado
 */
export async function apiObterPreferencias(): Promise<PreferenciasUsuario> {
  const { data } = await apiClient.get('/usuarios/me/preferencias');
  return data;
}

/**
 * ✅ Atualizar preferências do usuário logado
 */
export async function apiAtualizarPreferencias(
  payload: AtualizarPreferenciasPayload,
): Promise<PreferenciasUsuario> {
  const { data } = await apiClient.patch('/usuarios/me/preferencias', payload);
  return data;
}

/**
 * ✅ Alterar senha do usuário logado
 */
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

/**
 * ✅ Exportar dados do usuário (download automático)
 */
export async function apiExportarDados(): Promise<void> {
  const { data } = await apiClient.get('/usuarios/me/exportar', {
    responseType: 'blob',
  });

  // ✅ Criar download automático
  const url = window.URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `dados-assistenterpg-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * ✅ Excluir conta do usuário
 */
export async function apiExcluirConta(senha: string): Promise<ExcluirContaResponse> {
  const { data } = await apiClient.delete('/usuarios/me', {
    data: { senha },
  });
  return data;
}
