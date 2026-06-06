'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  extractRetryAfterSeconds,
  formatCooldownDuration,
  formatRateLimitMessage,
  isRateLimitError,
} from '@/lib/api/rate-limit';

export function useRateLimitCooldown() {
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const cooldownSeconds = Math.max(
    0,
    Math.ceil((cooldownUntil - now) / 1000),
  );

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [cooldownSeconds]);

  const captureRateLimit = useCallback((error: unknown): string | null => {
    const seconds = extractRetryAfterSeconds(error);

    if (!isRateLimitError(error)) return null;

    if (seconds !== null && seconds > 0) {
      const currentNow = Date.now();
      setNow(currentNow);
      setCooldownUntil(currentNow + seconds * 1000);
    }

    return formatRateLimitMessage(seconds);
  }, []);

  const cooldownButtonLabel = useMemo(
    () =>
      cooldownSeconds > 0
        ? `Tente novamente em ${formatCooldownDuration(cooldownSeconds)}`
        : null,
    [cooldownSeconds],
  );

  return {
    captureRateLimit,
    cooldownButtonLabel,
    cooldownSeconds,
    isCoolingDown: cooldownSeconds > 0,
  };
}
