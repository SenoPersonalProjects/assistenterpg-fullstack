import { Test, TestingModule } from '@nestjs/testing';
import { PATH_METADATA } from '@nestjs/common/constants';
import { JsonImportGuide } from '../common/json-import/json-import-guide.types';
import { NpcsAmeacasController } from './npcs-ameacas.controller';
import { NpcsAmeacasService } from './npcs-ameacas.service';

describe('NpcsAmeacasController', () => {
  let controller: NpcsAmeacasController;
  let service: jest.Mocked<Pick<NpcsAmeacasService, 'getGuiaImportacaoJson'>>;

  const guia = {
    schema: 'assistenterpg.npc-ameaca',
    schemaVersion: 1,
    descricao: 'Guia de NPC/ameaça',
    regras: [],
    exportTypes: ['npc-ameaca'],
    campos: [],
    exemplos: { minimo: {}, completo: {} },
    referencias: [],
  } satisfies JsonImportGuide;

  beforeEach(async () => {
    service = {
      getGuiaImportacaoJson: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NpcsAmeacasController],
      providers: [
        {
          provide: NpcsAmeacasService,
          useValue: service,
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<NpcsAmeacasController>(NpcsAmeacasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('exposes the JSON import guide route before dynamic id routes', async () => {
    service.getGuiaImportacaoJson.mockResolvedValue(guia);

    await expect(controller.getGuiaImportacaoJson()).resolves.toBe(guia);

    const routeHandler = Reflect.get(
      controller,
      'getGuiaImportacaoJson',
    ) as unknown;
    expect(Reflect.getMetadata(PATH_METADATA, routeHandler)).toBe(
      'importar-json/guia',
    );
    expect(service.getGuiaImportacaoJson).toHaveBeenCalledWith();
  });
});
