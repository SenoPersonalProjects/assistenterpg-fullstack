import { describe, expect, it } from 'vitest';
import { isRefreshAuthFailure } from './axios-client';

describe('isRefreshAuthFailure', () => {
  it.each([400, 401, 403])(
    'considera %s uma falha terminal de renovacao',
    (status) => {
      expect(isRefreshAuthFailure({ isAxiosError: true, response: { status } })).toBe(true);
    },
  );

  it('preserva falhas transitórias para nova tentativa', () => {
    expect(isRefreshAuthFailure({ isAxiosError: true, response: { status: 500 } })).toBe(false);
    expect(isRefreshAuthFailure(new Error('rede indisponível'))).toBe(false);
  });
});
