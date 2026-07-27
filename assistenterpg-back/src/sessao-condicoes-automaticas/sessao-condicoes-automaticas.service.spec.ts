import { SessaoCondicoesAutomaticasService } from './sessao-condicoes-automaticas.service';

describe('SessaoCondicoesAutomaticasService', () => {
  const catalogo = [
    ['Machucado', 1],
    ['Perturbado', 2],
    ['Morrendo', 3],
    ['Caído', 4],
    ['Enlouquecendo', 5],
    ['Morto', 6],
    ['Insano', 7],
  ].map(([nome, id]) => ({
    id,
    nome,
    descricao: String(nome),
    icone: null,
  }));

  function criarTx(existentes: unknown[] = [], ativas: unknown[] = []) {
    return {
      personagemSessao: {
        findFirst: jest.fn().mockResolvedValue({
          id: 31,
          cenaId: 51,
          personagemCampanha: {
            nome: 'Jiwa',
            pvAtual: 4,
            pvMax: 10,
            pvBarrasTotal: 1,
            pvBarrasRestantes: 1,
            sanAtual: 8,
            sanMax: 10,
          },
          sessao: {
            rodadaAtual: 2,
            cenas: [{ id: 51 }],
          },
        }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      npcAmeacaSessao: {
        findFirst: jest.fn(),
      },
      condicao: {
        findMany: jest.fn().mockResolvedValue(catalogo),
      },
      condicaoPersonagemSessao: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce(existentes)
          .mockResolvedValueOnce(ativas),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      eventoSessao: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      $executeRaw: jest.fn().mockResolvedValue(1),
    };
  }

  it('ativa Machucado consultando somente o personagem alvo', async () => {
    const tx = criarTx();
    const service = new SessaoCondicoesAutomaticasService();

    await service.sincronizarPersonagemSessaoTx(tx as never, 21, 31);

    expect(tx.personagemSessao.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 31, sessaoId: 21 }),
      }),
    );
    expect(tx.condicaoPersonagemSessao.createMany).toHaveBeenCalledTimes(1);
    expect(tx.condicaoPersonagemSessao.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            personagemSessaoId: 31,
            npcSessaoId: null,
            chaveAutomacao: 'MACHUCADO',
          }),
        ]),
      }),
    );
  });

  it('remove Machucado ao recuperar PV e preserva condições manuais', async () => {
    const machucado = {
      id: 80,
      sessaoId: 21,
      personagemSessaoId: 31,
      npcSessaoId: null,
      condicaoId: 1,
      cenaId: 51,
      turnoAplicacao: 1,
      duracaoModo: 'ATE_REMOVER',
      duracaoValor: null,
      restanteDuracao: null,
      ativo: true,
      automatica: true,
      chaveAutomacao: 'MACHUCADO',
      contadorTurnos: 0,
      acumulos: 1,
      fonteCodigo: null,
      limiteFonte: null,
      origemDescricao: 'Automática',
      observacao: null,
      condicao: catalogo[0],
    };
    const tx = criarTx([machucado], []);
    tx.personagemSessao.findFirst.mockResolvedValueOnce({
      id: 31,
      cenaId: 51,
      personagemCampanha: {
        nome: 'Jiwa',
        pvAtual: 10,
        pvMax: 10,
        pvBarrasTotal: 1,
        pvBarrasRestantes: 1,
        sanAtual: 8,
        sanMax: 10,
      },
      sessao: { rodadaAtual: 2, cenas: [{ id: 51 }] },
    });
    const service = new SessaoCondicoesAutomaticasService();

    await service.sincronizarPersonagemSessaoTx(tx as never, 21, 31);

    expect(tx.condicaoPersonagemSessao.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [80] } },
      data: expect.objectContaining({ ativo: false }),
    });
    expect(tx.eventoSessao.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ tipoEvento: 'CONDICAO_REMOVIDA' }),
        ]),
      }),
    );
  });

  it('ativa Enlouquecendo para SAN zerada sem ativar Perturbado', async () => {
    const tx = criarTx();
    tx.personagemSessao.findFirst.mockResolvedValueOnce({
      id: 31,
      cenaId: 51,
      personagemCampanha: {
        nome: 'Jiwa',
        pvAtual: 10,
        pvMax: 10,
        pvBarrasTotal: 1,
        pvBarrasRestantes: 1,
        sanAtual: 0,
        sanMax: 10,
      },
      sessao: { rodadaAtual: 2, cenas: [{ id: 51 }] },
    });
    const service = new SessaoCondicoesAutomaticasService();

    await service.sincronizarPersonagemSessaoTx(tx as never, 21, 31);

    const chaves = tx.condicaoPersonagemSessao.createMany.mock.calls.flatMap(
      ([args]) => args.data.map((item) => item.chaveAutomacao),
    );
    expect(chaves).toContain('ENLOUQUECENDO');
    expect(chaves).not.toContain('PERTURBADO');
  });

  it('mantém a mesma quantidade de consultas com 1 ou 100 participantes', async () => {
    const executar = async (quantidade: number) => {
      const tx = criarTx();
      tx.personagemSessao.findMany.mockResolvedValueOnce(
        Array.from({ length: quantidade }, (_, indice) => ({
          id: indice + 1,
          sessaoId: 21,
          cenaId: 51,
          personagemCampanha: {
            nome: `Personagem ${indice + 1}`,
            pvAtual: 10,
            pvMax: 10,
            pvBarrasTotal: 1,
            pvBarrasRestantes: 1,
            sanAtual: 10,
            sanMax: 10,
          },
          sessao: {
            rodadaAtual: 2,
            cenas: [{ id: 51 }],
          },
        })),
      );
      const service = new SessaoCondicoesAutomaticasService();

      await service.sincronizarPersonagemCampanhaTx(tx as never, 99);

      return [
        tx.personagemSessao.findMany,
        tx.condicao.findMany,
        tx.condicaoPersonagemSessao.findMany,
        tx.condicaoPersonagemSessao.createMany,
        tx.condicaoPersonagemSessao.updateMany,
        tx.eventoSessao.createMany,
        tx.$executeRaw,
      ].reduce((total, mock) => total + mock.mock.calls.length, 0);
    };

    await expect(executar(1)).resolves.toBe(await executar(100));
  });
});
