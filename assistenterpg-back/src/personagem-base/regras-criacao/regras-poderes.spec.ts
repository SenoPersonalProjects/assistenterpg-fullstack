import {
  validarPoderesGenericos,
  type PoderGenericoInstanciaInput,
} from './regras-poderes';

function criarPrismaMock(requisitos: unknown) {
  return {
    habilidade: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          nome: 'Armamento Amaldicoado',
          requisitos,
          mecanicasEspeciais: null,
        },
      ]),
    },
  };
}

const atributos = {
  agilidade: 3,
  forca: 3,
  intelecto: 1,
  presenca: 1,
  vigor: 2,
};

const poderes: PoderGenericoInstanciaInput[] = [
  { habilidadeId: 1, config: {} },
];

describe('validarPoderesGenericos - requisitos de pericia', () => {
  it('aceita grauMinimo 1 quando a pericia esta treinada', async () => {
    const prisma = criarPrismaMock({
      pericias: [{ codigo: 'LUTA', grauMinimo: 1 }],
    });

    await expect(
      validarPoderesGenericos(
        {
          nivel: 6,
          poderes,
          pericias: [{ codigo: 'LUTA', grauTreinamento: 1 }],
          atributos,
          graus: [],
        },
        prisma as never,
      ),
    ).resolves.toBeUndefined();
  });

  it('aceita requisito alternativo quando uma das pericias esta treinada', async () => {
    const prisma = criarPrismaMock({
      pericias: [
        { codigo: 'LUTA', grauMinimo: 1, alternativa: true },
        { codigo: 'PONTARIA', grauMinimo: 1, alternativa: true },
      ],
    });

    await expect(
      validarPoderesGenericos(
        {
          nivel: 6,
          poderes,
          pericias: [{ codigo: 'PONTARIA', grauTreinamento: 1 }],
          atributos,
          graus: [],
        },
        prisma as never,
      ),
    ).resolves.toBeUndefined();
  });

  it('retorna requisito de treino na mensagem quando a pericia nao atende', async () => {
    const prisma = criarPrismaMock({
      pericias: [{ codigo: 'LUTA', grauMinimo: 1 }],
    });

    await expect(
      validarPoderesGenericos(
        {
          nivel: 6,
          poderes,
          pericias: [{ codigo: 'LUTA', grauTreinamento: 0 }],
          atributos,
          graus: [],
        },
        prisma as never,
      ),
    ).rejects.toThrow('"Armamento Amaldicoado" requer LUTA treinada');
  });
});
