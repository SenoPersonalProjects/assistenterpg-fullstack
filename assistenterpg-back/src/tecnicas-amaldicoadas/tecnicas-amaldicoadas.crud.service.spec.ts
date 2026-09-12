import { TipoTecnicaAmaldicoada } from '@prisma/client';
import { TecnicasAmaldicoadasCrudService } from './tecnicas-amaldicoadas.crud.service';

describe('TecnicasAmaldicoadasCrudService', () => {
  function criarServico() {
    const prisma = {
      tecnicaAmaldicoada: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    const mapper = {};
    const persistence = {};
    const validationsService = {
      validarFonteSuplemento: jest.fn(),
    };
    const clasService = {
      vincularClas: jest.fn(),
    };
    const service = new TecnicasAmaldicoadasCrudService(
      prisma as never,
      mapper as never,
      persistence as never,
      validationsService as never,
      clasService as never,
    );

    jest.spyOn(service, 'findOneTecnica').mockResolvedValue({ id: 77 } as never);

    return { service, prisma, validationsService };
  }

  const dto = {
    nome: 'Névoa Lilás',
    descricao: 'Descrição de teste.',
    tipo: TipoTecnicaAmaldicoada.INATA,
  };

  it('gera código estável a partir do nome quando o cadastro não informa código', async () => {
    const { service, prisma } = criarServico();
    prisma.tecnicaAmaldicoada.findUnique.mockResolvedValue(null);
    prisma.tecnicaAmaldicoada.findFirst.mockResolvedValue(null);
    prisma.tecnicaAmaldicoada.create.mockResolvedValue({ id: 77 });

    await service.createTecnica(dto);

    expect(prisma.tecnicaAmaldicoada.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ codigo: 'TECNICA_NEVOA_LILAS' }),
      }),
    );
  });

  it('acrescenta sufixo único ao código automático em caso de colisão', async () => {
    const { service, prisma } = criarServico();
    prisma.tecnicaAmaldicoada.findUnique
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null);
    prisma.tecnicaAmaldicoada.findFirst.mockResolvedValue(null);
    prisma.tecnicaAmaldicoada.create.mockResolvedValue({ id: 77 });

    await service.createTecnica(dto);

    expect(prisma.tecnicaAmaldicoada.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ codigo: 'TECNICA_NEVOA_LILAS_2' }),
      }),
    );
  });
});
