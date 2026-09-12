import { Test, TestingModule } from '@nestjs/testing';
import { HabilidadesService } from './habilidades.service';

describe('HabilidadesService', () => {
  let service: HabilidadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabilidadesService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<HabilidadesService>(HabilidadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gera código técnico a partir do nome quando ele não é informado', async () => {
    const prisma = {
      habilidade: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    const serviceComPrisma = new HabilidadesService(prisma as never);

    await serviceComPrisma.create({
      nome: 'Golpe Harmônico',
      tipo: 'PODER_GENERICO',
    });

    expect(prisma.habilidade.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codigo: 'HABILIDADE_GOLPE_HARMONICO',
        }),
      }),
    );
  });

  it('acrescenta sufixo quando o código automático já existe', async () => {
    const prisma = {
      habilidade: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 10 })
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValue({ id: 2 }),
      },
    };
    const serviceComPrisma = new HabilidadesService(prisma as never);

    await serviceComPrisma.create({
      nome: 'Golpe Harmônico',
      tipo: 'PODER_GENERICO',
    });

    expect(prisma.habilidade.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codigo: 'HABILIDADE_GOLPE_HARMONICO_2',
        }),
      }),
    );
  });
});
