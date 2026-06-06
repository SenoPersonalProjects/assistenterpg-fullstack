import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiReactivateAccount,
  apiResetPassword,
  apiVerifyEmailChange,
} from './auth';

type AxiosLike = {
  post: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;
const PUBLIC_AUTH_CONFIG = {
  _skipAuthRefresh: true,
  _skipAuthRedirect: true,
  _skipCsrf: true,
};

describe('auth api public contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.post.mockResolvedValue({ data: { mensagem: 'ok' } });
  });

  it('marks token endpoints as public auth requests', async () => {
    await apiResetPassword('reset-token', 'nova-senha');
    await apiVerifyEmailChange('email-token');

    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      1,
      '/auth/reset-password',
      { token: 'reset-token', novaSenha: 'nova-senha' },
      PUBLIC_AUTH_CONFIG,
    );
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      2,
      '/auth/verify-email-change',
      { token: 'email-token' },
      PUBLIC_AUTH_CONFIG,
    );
  });

  it('posts self-service account reactivation without session recovery', async () => {
    await apiReactivateAccount('user@example.com', 'senha');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/auth/reactivate-account',
      { email: 'user@example.com', senha: 'senha' },
      PUBLIC_AUTH_CONFIG,
    );
  });
});
