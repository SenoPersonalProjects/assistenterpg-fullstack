import { apiClient, type AuthAxiosConfig } from './axios-client';
import type { ErroClienteObservavel } from '@/lib/observabilidade/cliente';

export async function apiRegistrarErroCliente(
  erro: ErroClienteObservavel,
): Promise<void> {
  const config: AuthAxiosConfig = {
    _skipAuthRefresh: true,
    _skipAuthRedirect: true,
  };
  await apiClient.post('/observabilidade/erros-cliente', erro, config);
}
