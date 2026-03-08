import { Test, TestingModule } from '@nestjs/testing';
import { CompendioController } from './compendio.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GUARDS_METADATA } from '@nestjs/common/constants';

describe('CompendioController', () => {
  let controller: CompendioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompendioController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<CompendioController>(CompendioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require JWT+Admin on all write routes', () => {
    const writeMethods = [
      'criarCategoria',
      'atualizarCategoria',
      'removerCategoria',
      'criarSubcategoria',
      'atualizarSubcategoria',
      'removerSubcategoria',
      'criarArtigo',
      'atualizarArtigo',
      'removerArtigo',
    ] as const;

    for (const methodName of writeMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      ) as unknown;

      expect(guards).toEqual([JwtAuthGuard, AdminGuard]);
    }
  });

  it('should keep read routes public', () => {
    const readMethods = [
      'listarCategorias',
      'buscarCategoriaPorCodigo',
      'listarSubcategorias',
      'buscarSubcategoriaPorCodigo',
      'listarArtigos',
      'buscarArtigoPorCodigo',
      'buscar',
      'listarDestaques',
    ] as const;

    for (const methodName of readMethods) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        controller[methodName],
      ) as unknown;

      expect(guards).toBeUndefined();
    }
  });
});
