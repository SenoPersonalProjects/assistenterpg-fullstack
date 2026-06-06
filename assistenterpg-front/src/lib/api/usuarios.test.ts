import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiDesativarConta,
  apiExcluirConta,
  apiSolicitarAlteracaoEmail,
} from './usuarios';

type AxiosLike = {
  delete: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('usuarios security api contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.delete.mockResolvedValue({ data: { mensagem: 'ok' } });
    mockedApiClient.patch.mockResolvedValue({ data: { mensagem: 'ok' } });
    mockedApiClient.post.mockResolvedValue({ data: { mensagem: 'ok' } });
  });

  it('requests verified email change with current password', async () => {
    await apiSolicitarAlteracaoEmail('new@example.com', 'senha-atual');

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/usuarios/me/email', {
      novoEmail: 'new@example.com',
      senhaAtual: 'senha-atual',
    });
  });

  it('deactivates and deletes the current account with password confirmation', async () => {
    await apiDesativarConta('senha-atual');
    await apiExcluirConta('senha-atual');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/usuarios/me/desativar',
      { senhaAtual: 'senha-atual' },
    );
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/usuarios/me', {
      data: { senhaAtual: 'senha-atual' },
    });
  });
});
