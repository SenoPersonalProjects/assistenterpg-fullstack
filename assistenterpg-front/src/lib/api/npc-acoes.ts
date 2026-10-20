import { apiClient } from "./axios-client";
import { normalizarDetalheSessao } from "@/lib/campanha/sessao-atualizacoes";
import type { SessaoCampanhaDetalhe } from "@/lib/types";

export async function registrarAcaoNpc(
  campanhaId: number,
  sessaoId: number,
  npcSessaoId: number,
  acaoIndice: number,
  operacao: "REGISTRAR_USO" | "ENCERRAR",
  clientRequestId: string,
): Promise<SessaoCampanhaDetalhe> {
  const { data } = await apiClient.post<SessaoCampanhaDetalhe>(
    `/campanhas/${campanhaId}/sessoes/${sessaoId}/npcs/${npcSessaoId}/acoes`,
    { clientRequestId, acaoIndice, operacao },
  );
  return normalizarDetalheSessao(data);
}
