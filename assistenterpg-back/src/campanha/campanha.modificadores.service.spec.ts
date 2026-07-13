import { CampanhaModificadoresService } from './campanha.modificadores.service';

const modificadorAtivo = {
  id: 80,
  campanhaId: 7,
  personagemCampanhaId: 5,
  sessaoId: null,
  cenaId: null,
  campo: 'EA_MAX',
  periciaCodigo: null,
  tipoGrauCodigo: null,
  valor: -20,
  nome: 'Reducao narrativa',
  descricao: null,
  ativo: false,
  criadoPorId: 3,
  criadoEm: new Date('2026-07-13T12:00:00.000Z'),
  desfeitoEm: new Date('2026-07-13T13:00:00.000Z'),
  desfeitoPorId: 3,
  motivoDesfazer: null,
};

function criarCenarioDesfazer() {
  let ativo = true;
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 5 }]),
    personagemCampanhaModificador: {
      updateMany: jest.fn().mockImplementation(() => {
        if (!ativo) return Promise.resolve({ count: 0 });
        ativo = false;
        return Promise.resolve({ count: 1 });
      }),
      findFirst: jest.fn().mockImplementation(() => Promise.resolve({ ativo })),
      findUniqueOrThrow: jest
        .fn()
        .mockImplementation(() => Promise.resolve({ ...modificadorAtivo })),
    },
    personagemCampanha: {
      findUniqueOrThrow: jest.fn().mockResolvedValue({
        id: 5,
        eaMax: 80,
        eaAtual: 70,
      }),
      update: jest.fn().mockResolvedValue({
        id: 5,
        eaMax: 100,
        eaAtual: 70,
      }),
    },
    personagemCampanhaHistorico: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
    personagemCampanhaEntidadeVinculada: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  let fila = Promise.resolve<unknown>(undefined);
  const prisma = {
    $transaction: jest.fn(
      (callback: (cliente: typeof tx) => Promise<unknown>) => {
        const resultado = fila.then(() => callback(tx));
        fila = resultado.then(
          () => undefined,
          () => undefined,
        );
        return resultado;
      },
    ),
  };
  const accessService = {
    obterPersonagemCampanhaComPermissao: jest.fn().mockResolvedValue({
      acesso: { ehMestre: true },
      personagem: { id: 5 },
    }),
  };
  const contextoService = { validarContextoSessaoCena: jest.fn() };
  const mapper = {
    mapearPersonagemCampanhaResposta: jest.fn((personagem) => personagem),
  };
  const service = new CampanhaModificadoresService(
    prisma as never,
    accessService as never,
    contextoService as never,
    mapper as never,
  );
  return {
    service,
    prisma,
    tx,
    getAtivo: () => ativo,
    setAtivo: (valor: boolean) => {
      ativo = valor;
    },
  };
}

describe('CampanhaModificadoresService - concorrencia', () => {
  it('aplica CAS, rollback e historico uma unica vez', async () => {
    const { service, tx } = criarCenarioDesfazer();

    await service.desfazerModificadorPersonagemCampanha(7, 5, 80, 3);

    expect(tx.personagemCampanhaModificador.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 80,
          campanhaId: 7,
          personagemCampanhaId: 5,
          ativo: true,
        }),
      }),
    );
    expect(tx.personagemCampanha.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eaMax: 100, eaAtual: 70 }),
      }),
    );
    expect(tx.personagemCampanhaHistorico.create).toHaveBeenCalledTimes(1);
    expect(
      tx.personagemCampanhaEntidadeVinculada.updateMany,
    ).toHaveBeenCalledTimes(1);
  });

  it('duas chamadas concorrentes desfazem somente uma vez', async () => {
    const { service, tx } = criarCenarioDesfazer();

    const resultados = await Promise.allSettled([
      service.desfazerModificadorPersonagemCampanha(7, 5, 80, 3),
      service.desfazerModificadorPersonagemCampanha(7, 5, 80, 3),
    ]);

    expect(
      resultados.filter((item) => item.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(resultados.filter((item) => item.status === 'rejected')).toEqual([
      expect.objectContaining({
        reason: expect.objectContaining({
          code: 'CAMPANHA_MODIFICADOR_JA_DESFEITO',
        }),
      }),
    ]);
    expect(tx.personagemCampanha.update).toHaveBeenCalledTimes(1);
    expect(tx.personagemCampanhaHistorico.create).toHaveBeenCalledTimes(1);
  });

  it('nao altera nada quando o modificador nao pertence ao escopo', async () => {
    const { service, tx, setAtivo } = criarCenarioDesfazer();
    setAtivo(false);
    tx.personagemCampanhaModificador.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.desfazerModificadorPersonagemCampanha(7, 5, 999, 3),
    ).rejects.toMatchObject({ code: 'CAMPANHA_MODIFICADOR_NOT_FOUND' });
    expect(tx.personagemCampanha.update).not.toHaveBeenCalled();
    expect(tx.personagemCampanhaHistorico.create).not.toHaveBeenCalled();
  });

  it('reverte o CAS quando uma etapa posterior falha', async () => {
    const cenario = criarCenarioDesfazer();
    cenario.tx.personagemCampanhaHistorico.create.mockRejectedValueOnce(
      new Error('falha no historico'),
    );
    cenario.prisma.$transaction.mockImplementationOnce(
      async (callback: (cliente: typeof cenario.tx) => Promise<unknown>) => {
        const estadoAnterior = cenario.getAtivo();
        try {
          return await callback(cenario.tx);
        } catch (error) {
          cenario.setAtivo(estadoAnterior);
          throw error;
        }
      },
    );

    await expect(
      cenario.service.desfazerModificadorPersonagemCampanha(7, 5, 80, 3),
    ).rejects.toThrow('falha no historico');
    expect(cenario.getAtivo()).toBe(true);
  });
});
