import { Test, TestingModule } from '@nestjs/testing';
import { PATH_METADATA } from '@nestjs/common/constants';
import { RoleUsuario } from '@prisma/client';
import { JsonImportGuide } from '../common/json-import/json-import-guide.types';
import { HomebrewsController } from './homebrews.controller';
import { HomebrewsService } from './homebrews.service';

describe('HomebrewsController', () => {
  let controller: HomebrewsController;
  let service: jest.Mocked<Pick<HomebrewsService, 'getGuiaImportacaoJson'>>;

  const guia = {
    schema: 'assistenterpg.homebrew',
    schemaVersion: 1,
    descricao: 'Guia de homebrew',
    regras: [],
    exportTypes: ['homebrew'],
    campos: [],
    exemplos: { minimo: {}, completo: {} },
    referencias: [],
  } satisfies JsonImportGuide;

  beforeEach(async () => {
    service = {
      getGuiaImportacaoJson: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomebrewsController],
      providers: [
        {
          provide: HomebrewsService,
          useValue: service,
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<HomebrewsController>(HomebrewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('exposes the JSON import guide route before dynamic id routes', async () => {
    service.getGuiaImportacaoJson.mockResolvedValue(guia);

    await expect(
      controller.getGuiaImportacaoJson({
        user: { id: 7, role: RoleUsuario.ADMIN },
      } as Parameters<HomebrewsController['getGuiaImportacaoJson']>[0]),
    ).resolves.toBe(guia);

    const routeHandler = Reflect.get(
      controller,
      'getGuiaImportacaoJson',
    ) as unknown;
    expect(Reflect.getMetadata(PATH_METADATA, routeHandler)).toBe(
      'importar-json/guia',
    );
    expect(service.getGuiaImportacaoJson).toHaveBeenCalledWith(7, true);
  });
});
