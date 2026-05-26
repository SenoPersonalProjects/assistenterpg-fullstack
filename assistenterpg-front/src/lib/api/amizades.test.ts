import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiAceitarSolicitacaoAmizade,
  apiCancelarSolicitacaoAmizade,
  apiCriarSolicitacaoAmizade,
  apiListarAmigos,
  apiListarSolicitacoesAmizade,
  apiRemoverAmizade,
  apiResolverUsuarioAmizade,
} from './amizades';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('amizades api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista amigos', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 2, apelido: 'Maki', online: true }],
    });

    const amigos = await apiListarAmigos();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/amizades');
    expect(amigos).toEqual([{ id: 2, apelido: 'Maki', online: true }]);
  });

  it('lista solicitações pendentes', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        recebidas: [{ id: 1 }],
        enviadas: [{ id: 2 }],
      },
    });

    const solicitacoes = await apiListarSolicitacoesAmizade();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/amizades/solicitacoes');
    expect(solicitacoes).toEqual({
      recebidas: [{ id: 1 }],
      enviadas: [{ id: 2 }],
    });
  });

  it('resolve usuário por identificador exato', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: { id: 8, apelido: 'Yuta' },
    });

    const usuario = await apiResolverUsuarioAmizade('Yuta');

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/amizades/usuarios/resolver?identificador=Yuta',
    );
    expect(usuario).toEqual({ id: 8, apelido: 'Yuta' });
  });

  it('cria solicitação', async () => {
    mockedApiClient.post.mockResolvedValueOnce(undefined);

    await apiCriarSolicitacaoAmizade('Maki');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/amizades/solicitacoes', {
      identificador: 'Maki',
    });
  });

  it('aceita, cancela e remove amizade', async () => {
    mockedApiClient.post.mockResolvedValue(undefined);
    mockedApiClient.delete.mockResolvedValue(undefined);

    await apiAceitarSolicitacaoAmizade(1);
    await apiCancelarSolicitacaoAmizade(2);
    await apiRemoverAmizade(3);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/amizades/solicitacoes/1/aceitar',
    );
    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      '/amizades/solicitacoes/2',
    );
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/amizades/3');
  });
});
