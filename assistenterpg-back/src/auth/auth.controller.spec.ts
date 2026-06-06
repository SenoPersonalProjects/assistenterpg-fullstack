import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { SECURITY_RATE_LIMIT_POLICY_KEY } from 'src/common/security/security-rate-limit.decorator';
import { SecurityRateLimitGuard } from 'src/common/security/security-rate-limit.guard';
import type { SecurityRateLimitPolicyName } from 'src/common/security/security-rate-limit.policies';
import { AuthController } from './auth.controller';

type AuthEndpoint = keyof Pick<
  AuthController,
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'resetPassword'
  | 'verifyEmail'
  | 'resendVerificationEmail'
  | 'verifyEmailChange'
  | 'reactivateAccount'
>;

const RATE_LIMITED_ENDPOINTS: readonly [
  AuthEndpoint,
  SecurityRateLimitPolicyName,
][] = [
  ['login', 'login'],
  ['register', 'register'],
  ['forgotPassword', 'forgotPassword'],
  ['resetPassword', 'resetPassword'],
  ['verifyEmail', 'verifyEmail'],
  ['resendVerificationEmail', 'resendVerificationEmail'],
  ['verifyEmailChange', 'verifyEmailChange'],
  ['reactivateAccount', 'reactivateAccount'],
];

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each(RATE_LIMITED_ENDPOINTS)(
    'aplica SecurityRateLimit %s com a politica %s',
    (endpoint, policy) => {
      const handler = AuthController.prototype[endpoint];
      const guards = Reflect.getMetadata(GUARDS_METADATA, handler) as
        | unknown[]
        | undefined;

      expect(guards).toContain(SecurityRateLimitGuard);
      expect(Reflect.getMetadata(SECURITY_RATE_LIMIT_POLICY_KEY, handler)).toBe(
        policy,
      );
    },
  );
});
