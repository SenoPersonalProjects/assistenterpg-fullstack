import { describe, expect, it } from 'vitest';
import {
  extractRetryAfterSeconds,
  formatCooldownDuration,
  formatRateLimitMessage,
  isRateLimitError,
  parseRetryAfterSeconds,
} from './rate-limit';

describe('rate limit helpers', () => {
  it('parses Retry-After seconds and HTTP dates', () => {
    const now = Date.parse('2026-06-05T12:00:00Z');
    expect(parseRetryAfterSeconds('45', now)).toBe(45);
    expect(
      parseRetryAfterSeconds('Fri, 05 Jun 2026 12:02:00 GMT', now),
    ).toBe(120);
  });

  it('extracts cooldown from normalized and raw API errors', () => {
    expect(
      extractRetryAfterSeconds({ status: 429, retryAfterSeconds: 30 }),
    ).toBe(30);
    expect(
      extractRetryAfterSeconds({
        response: {
          status: 429,
          headers: { 'retry-after': '90' },
        },
      }),
    ).toBe(90);
  });

  it('formats reusable feedback and detects 429 without a header', () => {
    expect(formatCooldownDuration(90)).toBe('2 min');
    expect(formatRateLimitMessage(30)).toContain('30s');
    expect(isRateLimitError({ response: { status: 429 } })).toBe(true);
  });
});
