import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { SecurityRateLimitGuard } from './security-rate-limit.guard';
import type { SecurityRateLimitPolicyName } from './security-rate-limit.policies';

export const SECURITY_RATE_LIMIT_POLICY_KEY = 'security-rate-limit-policy';

export function SecurityRateLimit(policy: SecurityRateLimitPolicyName) {
  return applyDecorators(
    SetMetadata(SECURITY_RATE_LIMIT_POLICY_KEY, policy),
    UseGuards(SecurityRateLimitGuard),
  );
}
