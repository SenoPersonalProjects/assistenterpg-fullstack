import { PrismaService } from '../prisma/prisma.service';
import { TecnicaInataPropriaService } from './tecnica-inata-propria.service';

describe('TecnicaInataPropriaService', () => {
  it('clona 100 habilidades e variacoes em uma unica arvore de escrita', async () => {
    const habilidades = Array.from({ length: 100 }, (_, indice) => ({
      id: indice + 1,
      codigo: `HAB_${indice}`,
      nome: `Habilidade ${indice}`,
      ordem: indice,
      variacoes: Array.from({ length: 3 }, (_, variacao) => ({
        id: indice * 10 + variacao,
        nome: `Variacao ${indice}-${variacao}`,
        ordem: variacao,
      })),
    }));
    const prisma = {
      tecnicaAmaldicoada: {
        findUnique: jest.fn().mockResolvedValue({
          id: 10,
          nome: 'Tecnica base',
          descricao: null,
          tipo: 'INATA',
          hereditaria: false,
          linkExterno: null,
          requisitos: null,
          clas: [],
          habilidades,
        }),
        create: jest.fn().mockResolvedValue({ id: 99 }),
      },
    };
    const service = new TecnicaInataPropriaService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.clonarTecnicaInata({
        usuarioId: 7,
        tecnicaBaseId: 10,
        personagemCampanhaId: 42,
      }),
    ).resolves.toBe(99);

    expect(prisma.tecnicaAmaldicoada.create).toHaveBeenCalledTimes(1);
    const escrita = prisma.tecnicaAmaldicoada.create.mock.calls[0][0].data;
    expect(escrita.habilidades.create).toHaveLength(100);
    expect(escrita.habilidades.create[0].variacoes.create).toHaveLength(3);
  });

  it('remove tecnicas clonadas em um unico deleteMany', async () => {
    const prisma = {
      tecnicaAmaldicoada: {
        deleteMany: jest.fn().mockResolvedValue({ count: 100 }),
      },
    };
    const service = new TecnicaInataPropriaService(
      prisma as unknown as PrismaService,
    );

    await service.removerTecnicasClonadas(
      Array.from({ length: 100 }, (_, indice) => indice + 1),
    );

    expect(prisma.tecnicaAmaldicoada.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.tecnicaAmaldicoada.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: expect.arrayContaining([1, 100]) } },
    });
  });

  it('propaga falha da arvore de clonagem sem escritas parciais adicionais', async () => {
    const falha = new Error('variacao invalida');
    const prisma = {
      tecnicaAmaldicoada: {
        findUnique: jest.fn().mockResolvedValue({
          id: 10,
          nome: 'Tecnica base',
          tipo: 'INATA',
          clas: [],
          habilidades: [
            {
              id: 1,
              codigo: 'HAB_1',
              nome: 'Habilidade',
              ordem: 0,
              variacoes: [{ id: 2, nome: 'Variacao', ordem: 0 }],
            },
          ],
        }),
        create: jest.fn().mockRejectedValue(falha),
      },
    };
    const service = new TecnicaInataPropriaService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.clonarTecnicaInata({
        usuarioId: 7,
        tecnicaBaseId: 10,
      }),
    ).rejects.toBe(falha);
    expect(prisma.tecnicaAmaldicoada.create).toHaveBeenCalledTimes(1);
  });
});
