import { Test, TestingModule } from '@nestjs/testing';
import { NpcsAmeacasService } from './npcs-ameacas.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('NpcsAmeacasService', () => {
  let service: NpcsAmeacasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NpcsAmeacasService,
        {
          provide: PrismaService,
          useValue: {
            npcAmeaca: {
              count: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NpcsAmeacasService>(NpcsAmeacasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
