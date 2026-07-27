import { SessaoService } from './sessao.service';

describe('SessaoService - recursos incrementais', () => {
  const personagem = {
    id: 31,
    cenaId: 51,
    personagemCampanha: {
      id: 41,
      campanhaId: 7,
      donoId: 10,
      nome: 'Jiwa',
      pvAtual: 10,
      pvMax: 20,
      pvBarrasTotal: 1,
      pvBarrasRestantes: 1,
      peAtual: 8,
      peMax: 10,
      eaAtual: 6,
      eaMax: 10,
      sanAtual: 9,
      sanMax: 10,
    },
  };

  function criarCenario() {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 41 }]),
      personagemSessao: {
        findFirst: jest.fn().mockResolvedValue(personagem),
      },
      personagemCampanha: {
        update: jest.fn().mockResolvedValue({}),
      },
      eventoSessao: {
        create: jest.fn().mockResolvedValue({
          id: 91,
          criadoEm: new Date('2026-07-26T12:00:00.000Z'),
        }),
      },
    };
    const prisma = {
      eventoSessao: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      executarTransacao: jest.fn(
        (_contexto: string, callback: (cliente: typeof tx) => unknown) =>
          callback(tx),
      ),
    };
    const condicoes = {
      sincronizarPersonagemSessaoTx: jest.fn().mockResolvedValue([
        {
          id: 1,
          condicaoId: 2,
          nome: 'Machucado',
        },
      ]),
    };
    const service = new SessaoService(prisma as never, condicoes as never);
    jest
      .spyOn(service as never, 'obterSessaoMutavelComAcesso' as never)
      .mockResolvedValue({
        acesso: { ehMestre: true },
        sessao: { status: 'EM_ANDAMENTO' },
      } as never);
    jest
      .spyOn(service as never, 'assertSessaoMutavelTx' as never)
      .mockResolvedValue(undefined as never);
    jest
      .spyOn(service as never, 'obterCenaAtualSessaoTx' as never)
      .mockResolvedValue({ id: 51 } as never);

    return { service, prisma, tx, condicoes };
  }

  it('retorna delta autoritativo sem buscar o detalhe completo', async () => {
    const { service, prisma, tx, condicoes } = criarCenario();
    const buscarDetalhe = jest.spyOn(service, 'buscarDetalheSessao');

    const atualizacao = await service.atualizarRecursosPersonagemSessao(
      7,
      21,
      31,
      10,
      {
        clientRequestId: '15fbb278-0062-4b5d-97d4-6b2f1ed4eac3',
        pvAtual: 4,
        pvAtualEsperado: 10,
      },
    );

    expect(prisma.executarTransacao).toHaveBeenCalledWith(
      'sessao.recursos.ajustar',
      expect.any(Function),
    );
    expect(tx.personagemCampanha.update).toHaveBeenCalledWith({
      where: { id: 41 },
      data: { pvAtual: 4 },
    });
    expect(condicoes.sincronizarPersonagemSessaoTx).toHaveBeenCalledWith(
      tx,
      21,
      31,
    );
    expect(atualizacao).toMatchObject({
      tipo: 'RECURSO_AJUSTADO',
      eventoId: 91,
      personagemSessaoId: 31,
      personagemCampanhaId: 41,
      valores: { pvAtual: 4 },
      condicoesAtivas: [{ nome: 'Machucado' }],
    });
    expect(buscarDetalhe).not.toHaveBeenCalled();
  });

  it('não persiste nem cria evento quando o clamp não altera o valor', async () => {
    const { service, tx, condicoes } = criarCenario();

    const atualizacao = await service.atualizarRecursosPersonagemSessao(
      7,
      21,
      31,
      10,
      {
        clientRequestId: 'd5ed88fc-f951-4972-91e1-b86d50838b0d',
        pvAtual: 10,
        pvAtualEsperado: 10,
      },
    );

    expect(atualizacao.valores).toEqual({});
    expect(atualizacao.eventoId).toBeNull();
    expect(tx.personagemCampanha.update).not.toHaveBeenCalled();
    expect(tx.eventoSessao.create).not.toHaveBeenCalled();
    expect(condicoes.sincronizarPersonagemSessaoTx).not.toHaveBeenCalled();
  });
});
