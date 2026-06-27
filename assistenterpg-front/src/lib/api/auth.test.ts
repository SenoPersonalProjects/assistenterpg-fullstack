import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  API_BASE_URL: 'http://localhost:3000',
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import { apiIniciarGoogleCalendar } from './auth';

type AxiosLike = {
  post: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('auth api contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.post.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/v2/auth' },
    });
  });

  it('inicia autorizacao Calendar preservando redirect relativo', async () => {
    await apiIniciarGoogleCalendar('/campanhas/1?aba=sessoes');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/auth/google/calendar/start?redirect=%2Fcampanhas%2F1%3Faba%3Dsessoes',
    );
  });

  it('mantem endpoint original quando redirect nao foi informado', async () => {
    await apiIniciarGoogleCalendar();

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/auth/google/calendar/start',
    );
  });
});
