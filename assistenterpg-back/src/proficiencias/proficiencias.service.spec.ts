import { Test, TestingModule } from '@nestjs/testing';
import { ProficienciasService } from './proficiencias.service';

describe('ProficienciasService', () => {
  let service: ProficienciasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProficienciasService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<ProficienciasService>(ProficienciasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gera código único ao criar proficiência sem código explícito', async () => {
    const prisma = {
      proficiencia: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    const serviceComPrisma = new ProficienciasService(prisma as never);

    await serviceComPrisma.create({
      nome: 'Armas Táticas',
      tipo: 'ARMA',
      categoria: 'TÁTICA',
    });

    expect(prisma.proficiencia.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ codigo: 'PROFICIENCIA_ARMAS_TATICAS' }),
    });
  });
});
