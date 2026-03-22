import { apiClient } from './axios-client';
import type {
  AdicionarItemInventarioCampanhaDto,
  AtualizarItemInventarioCampanhaDto,
  AplicarModificacaoInventarioCampanhaDto,
  InventarioCampanhaCompletoDto,
  ItemInventarioDto,
} from '@/lib/types';

export async function apiGetInventarioCampanhaCompleto(
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<InventarioCampanhaCompletoDto> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/inventario`,
  );
  return data;
}

export async function apiAdicionarItemInventarioCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  dto: AdicionarItemInventarioCampanhaDto,
): Promise<ItemInventarioDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/inventario`,
    dto,
  );
  return data;
}

export async function apiAtualizarItemInventarioCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  itemId: number,
  dto: AtualizarItemInventarioCampanhaDto,
): Promise<ItemInventarioDto> {
  const { data } = await apiClient.patch(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/inventario/${itemId}`,
    dto,
  );
  return data;
}

export async function apiRemoverItemInventarioCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  itemId: number,
): Promise<void> {
  await apiClient.delete(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/inventario/${itemId}`,
  );
}

export async function apiAplicarModificacaoInventarioCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  itemId: number,
  dto: AplicarModificacaoInventarioCampanhaDto,
): Promise<ItemInventarioDto> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/inventario/${itemId}/modificacoes`,
    dto,
  );
  return data;
}

export async function apiRemoverModificacaoInventarioCampanha(
  campanhaId: number,
  personagemCampanhaId: number,
  itemId: number,
  modificacaoId: number,
): Promise<ItemInventarioDto> {
  const { data } = await apiClient.delete(
    `/campanhas/${campanhaId}/personagens/${personagemCampanhaId}/inventario/${itemId}/modificacoes/${modificacaoId}`,
  );
  return data;
}
