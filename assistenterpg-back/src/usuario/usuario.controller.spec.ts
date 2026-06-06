import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { SECURITY_RATE_LIMIT_POLICY_KEY } from 'src/common/security/security-rate-limit.decorator';
import { SecurityRateLimitGuard } from 'src/common/security/security-rate-limit.guard';
import type { SecurityRateLimitPolicyName } from 'src/common/security/security-rate-limit.policies';
import { UsuarioController } from './usuario.controller';

type UsuarioEndpoint = keyof Pick<
  UsuarioController,
  'alterarSenha' | 'alterarEmail' | 'desativarConta' | 'excluirConta'
>;

const RATE_LIMITED_ENDPOINTS: readonly [
  UsuarioEndpoint,
  SecurityRateLimitPolicyName,
][] = [
  ['alterarSenha', 'changePassword'],
  ['alterarEmail', 'changeEmail'],
  ['desativarConta', 'deactivateAccount'],
  ['excluirConta', 'deleteAccount'],
];

describe('UsuarioController', () => {
  let controller: UsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each(RATE_LIMITED_ENDPOINTS)(
    'aplica SecurityRateLimit %s com a politica %s',
    (endpoint, policy) => {
      const handler = UsuarioController.prototype[endpoint];
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
