import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PersonagemBasePersistence } from './personagem-base.persistence';

describe('PersonagemBasePersistence', () => {
  it('nao altera inventario no rebuild generico e preserva ids e metadados', async () => {
    const itemExistente = {
      id: 501,
      equipamentoId: 133,
      quantidade: 1,
      equipado: true,
      categoriaCalculada: 'CATEGORIA_2',
      espacosCalculados: 0.5,
      nomeCustomizado: 'Uniforme da Jiwa',
      notas: 'Preservar',
      estado: {
        periciaCodigo: 'VONTADE',
        funcoesAdicionaisPericias: ['DIPLOMACIA'],
      },
      modificacoes: [{ id: 900, modificacaoId: 7 }],
    };
    const personagemBase = {
      update: jest.fn().mockResolvedValue({ id: 1 }),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        inventarioItens: [itemExistente],
      }),
    };
    const prisma = {
      personagemBase,
      resistenciaTipo: {
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;
    const persistence = new PersonagemBasePersistence(prisma);

    const resultado = await persistence.atualizarRebuildComEstado(
      {
        id: 1,
        dataUpdateBase: { nome: 'Jiwa Kasumi' },
        estado: {
          profsFinais: [],
          grausFinais: [],
          periciasMapCodigo: new Map(),
          grausTreinamento: [],
          habilidadesParaPersistir: [],
          poderesGenericosNormalizados: [],
          passivasResolvidas: { passivaIds: [] },
          resistenciasFinais: new Map(),
          dtoNormalizado: {
            itensInventario: [
              {
                equipamentoId: 999,
                quantidade: 99,
              },
            ],
          },
          tecnicasNaoInatasIds: [],
        } as never,
      },
      prisma as unknown as Prisma.TransactionClient,
    );

    expect(personagemBase.update).toHaveBeenCalledTimes(2);
    for (const chamada of personagemBase.update.mock.calls) {
      expect(chamada[0].data).not.toHaveProperty('inventarioItens');
    }
    expect(resultado?.inventarioItens[0]).toEqual(itemExistente);
    expect(resultado?.inventarioItens[0]).toEqual(
      expect.objectContaining({
        id: 501,
        categoriaCalculada: 'CATEGORIA_2',
        espacosCalculados: 0.5,
        estado: {
          periciaCodigo: 'VONTADE',
          funcoesAdicionaisPericias: ['DIPLOMACIA'],
        },
        modificacoes: [{ id: 900, modificacaoId: 7 }],
      }),
    );
  });
});
