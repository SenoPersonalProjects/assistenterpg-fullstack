import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { apiClient } from './axios-client';
import {
  apiAtualizarMacroPersonagemCampanha,
  apiCriarMacroPersonagemCampanha,
  apiCriarRolagemMacroPersonagemSessaoCampanha,
  apiRemoverMacroPersonagemCampanha,
} from './campanhas';

describe('API de macros personalizadas', () => {
  const client = vi.mocked(apiClient);
  const payload = {
    tipo: 'FORMULA_LIVRE' as const,
    nome: 'Sorte estranha',
    config: { formula: '2d6+3' },
  };

  beforeEach(() => vi.clearAllMocks());

  it('usa as rotas CRUD ligadas à ficha de campanha', async () => {
    client.post.mockResolvedValueOnce({ data: { id: 9 } });
    client.patch.mockResolvedValueOnce({ data: { id: 9, revisao: 2 } });
    client.delete.mockResolvedValueOnce({ data: { id: 9, ativo: false } });
    await apiCriarMacroPersonagemCampanha(1, 2, payload);
    await apiAtualizarMacroPersonagemCampanha(1, 2, 9, { ...payload, revisaoEsperada: 1 });
    await apiRemoverMacroPersonagemCampanha(1, 2, 9);
    expect(client.post).toHaveBeenCalledWith('/campanhas/1/personagens/2/macros', payload);
    expect(client.patch).toHaveBeenCalledWith('/campanhas/1/personagens/2/macros/9', {
      ...payload,
      revisaoEsperada: 1,
    });
    expect(client.delete).toHaveBeenCalledWith('/campanhas/1/personagens/2/macros/9');
  });

  it('rola por /rolagens enviando somente a intenção e macroId', async () => {
    const intencao = {
      tipo: 'FORMULA_MACRO_PERSONAGEM' as const,
      personagemSessaoId: 3,
      macroId: 9,
      visibilidade: 'PUBLICA' as const,
      clientRequestId: 'fa4dc24d-ad18-4ebf-b90c-e1b45f44459f',
    };
    client.post.mockResolvedValueOnce({ data: { id: 40 } });
    await apiCriarRolagemMacroPersonagemSessaoCampanha(1, 4, intencao);
    expect(client.post).toHaveBeenCalledWith('/campanhas/1/sessoes/4/rolagens', intencao);
    expect(intencao).not.toHaveProperty('formula');
    expect(intencao).not.toHaveProperty('resultado');
    expect(intencao).not.toHaveProperty('faces');
  });
});
