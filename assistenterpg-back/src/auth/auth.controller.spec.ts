import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AUTH_THROTTLE_LIMITS } from './auth-security.config';

const THROTTLER_LIMIT_KEY = 'THROTTLER:LIMITdefault';
const THROTTLER_TTL_KEY = 'THROTTLER:TTLdefault';

type AuthEndpoint =
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'resetPassword'
  | 'resendVerificationEmail';

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

  it('aplica ThrottlerGuard no controller de auth', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AuthController) as
      | unknown[]
      | undefined;

    expect(guards).toContain(ThrottlerGuard);
  });

  it.each<AuthEndpoint>([
    'login',
    'register',
    'forgotPassword',
    'resetPassword',
    'resendVerificationEmail',
  ])('aplica rate limit em %s', (endpoint) => {
    const handler = AuthController.prototype[endpoint];
    const expected = AUTH_THROTTLE_LIMITS[endpoint].default;

    expect(Reflect.getMetadata(THROTTLER_LIMIT_KEY, handler)).toBe(
      expected.limit,
    );
    expect(Reflect.getMetadata(THROTTLER_TTL_KEY, handler)).toBe(expected.ttl);
  });
});
