import { Test, TestingModule } from '@nestjs/testing';
import { TrilhasController } from './trilhas.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';

describe('TrilhasController', () => {
  let controller: TrilhasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrilhasController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<TrilhasController>(TrilhasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should declare JWT guard at controller level', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, TrilhasController) as
      | unknown[]
      | undefined;

    expect(Array.isArray(guards)).toBe(true);
    expect(guards).toHaveLength(1);
  });

  it('should require AdminGuard on write routes', () => {
    const writeMethods = [
      'create',
      'update',
      'remove',
      'createCaminho',
      'updateCaminho',
      'removeCaminho',
    ] as const;

    for (const methodName of writeMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      ) as unknown;

      expect(Array.isArray(guards)).toBe(true);
      if (!Array.isArray(guards)) continue;

      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(AdminGuard);
    }
  });
});
