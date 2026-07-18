import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiGirarRoletaCampanha,
  apiIniciarSorteioRoletaCampanha,
  apiSalvarPresetRoletaCampanha,
} from './campanha-roleta';

describe('API da roleta de campanha', () => {
  const client = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('crypto', {
      randomUUID: () => '123e4567-e89b-42d3-a456-426614174000',
    });
  });

  it('salva somente configuracao e revisao no preset fixo', async () => {
    const payload = {
      modo: 'CLA' as const,
      revisaoEsperada: 2,
      config: {
        fontes: { sistemaBase: true, suplementoIds: [], homebrewIds: [] },
        exclusoes: [],
        inclusoesCatalogo: [],
        listaManualTexto: 'A; A',
        compatibilidadesHereditarias: [],
      },
    };
    client.put.mockResolvedValueOnce({ data: { id: 1 } });
    await apiSalvarPresetRoletaCampanha(4, 'CLA', payload);
    expect(client.put).toHaveBeenCalledWith(
      '/campanhas/4/roleta/presets/CLA',
      payload,
    );
  });

  it('inicia enviando apenas ids, opcoes operacionais e clientRequestId', async () => {
    const payload = {
      slot: 'TECNICA' as const,
      alvoUsuarioId: 9,
      claSelecionadoChave: 'CLA:2',
      presetRevisaoEsperada: 3,
      clientRequestId: '123e4567-e89b-42d3-a456-426614174000',
    };
    client.post.mockResolvedValueOnce({ data: { sorteio: { id: 8 } } });
    await apiIniciarSorteioRoletaCampanha(4, payload);
    expect(client.post).toHaveBeenCalledWith(
      '/campanhas/4/roleta/sorteios',
      payload,
    );
    expect(payload).not.toHaveProperty('resultado');
    expect(payload).not.toHaveProperty('peso');
    expect(payload).not.toHaveProperty('posicaoVencedora');
  });

  it('gira sem enviar vencedor, pool ou pesos pelo cliente', async () => {
    client.post.mockResolvedValueOnce({ data: { giro: { resultado: { nome: 'A' } } } });
    await apiGirarRoletaCampanha(4, 8, 5);
    expect(client.post).toHaveBeenCalledWith(
      '/campanhas/4/roleta/sorteios/8/girar',
      {
        revisaoEsperada: 5,
        clientRequestId: '123e4567-e89b-42d3-a456-426614174000',
      },
    );
  });
});
