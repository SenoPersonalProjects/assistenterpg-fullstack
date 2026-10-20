import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./axios-client', () => ({ apiClient: { post: vi.fn() } }));
import { apiClient } from './axios-client';
import { registrarAcaoNpc } from './npc-acoes';

describe('registro de uso de NPC', () => {
  beforeEach(() => vi.resetAllMocks());
  it('envia somente intencao de custo e normaliza o snapshot', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { cards: [], npcs: [{ visibilidade: 'completa' }] } });
    const detalhe = await registrarAcaoNpc(1, 2, 3, 4, 'REGISTRAR_USO', 'pedido-unico');
    expect(apiClient.post).toHaveBeenCalledWith('/campanhas/1/sessoes/2/npcs/3/acoes', { clientRequestId: 'pedido-unico', acaoIndice: 4, operacao: 'REGISTRAR_USO' });
    expect(detalhe.npcs[0].condicoesAtivas).toEqual([]);
  });
  it('encerramento usa o mesmo contrato sem inventar alvos ou custos', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { cards: [], npcs: [] } });
    await registrarAcaoNpc(1, 2, 3, 4, 'ENCERRAR', 'pedido-encerrar');
    expect(apiClient.post).toHaveBeenCalledWith('/campanhas/1/sessoes/2/npcs/3/acoes', { clientRequestId: 'pedido-encerrar', acaoIndice: 4, operacao: 'ENCERRAR' });
  });
});
