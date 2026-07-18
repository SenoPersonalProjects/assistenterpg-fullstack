import { CampanhaRoletaService } from './campanha.roleta.service';
import {
  CampanhaRoletaAcessoNegadoException,
  CampanhaRoletaPermissaoInvalidaException,
  CampanhaRoletaSorteioInvalidoException,
} from '../common/exceptions/campanha-roleta.exception';

describe('CampanhaRoletaService - permissoes', () => {
  const acessoMestre = {
    garantirAcesso: jest.fn().mockResolvedValue({
      ehMestre: true,
      papel: 'MESTRE',
    }),
  };

  beforeEach(() => jest.clearAllMocks());

  it('permite delegar configurar e girar somente a membro JOGADOR', async () => {
    const prisma = {
      membroCampanha: {
        findUnique: jest.fn().mockResolvedValue({ papel: 'JOGADOR' }),
      },
      campanhaRoletaPermissao: {
        upsert: jest.fn().mockResolvedValue({
          id: 1,
          usuarioId: 8,
          podeConfigurar: true,
          podeGirar: false,
          membro: { usuario: { id: 8, apelido: 'Jogador' } },
        }),
      },
    };
    const service = new CampanhaRoletaService(
      prisma as never,
      acessoMestre as never,
    );
    await expect(
      service.salvarPermissao(2, 8, 3, {
        podeConfigurar: true,
        podeGirar: false,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        usuarioId: 8,
        usuario: { id: 8, apelido: 'Jogador' },
      }),
    );
  });

  it.each(['MESTRE', 'OBSERVADOR'])(
    'rejeita delegacao para papel %s',
    async (papel) => {
      const prisma = {
        membroCampanha: { findUnique: jest.fn().mockResolvedValue({ papel }) },
      };
      const service = new CampanhaRoletaService(
        prisma as never,
        acessoMestre as never,
      );
      await expect(
        service.salvarPermissao(2, 8, 3, {
          podeConfigurar: false,
          podeGirar: true,
        }),
      ).rejects.toBeInstanceOf(CampanhaRoletaPermissaoInvalidaException);
    },
  );

  it('impede JOGADOR delegado de conceder permissoes', async () => {
    const acessoJogador = {
      garantirAcesso: jest.fn().mockResolvedValue({
        ehMestre: false,
        papel: 'JOGADOR',
      }),
    };
    const prisma = {
      campanhaRoletaPermissao: {
        findUnique: jest.fn().mockResolvedValue({
          podeConfigurar: true,
          podeGirar: true,
        }),
      },
    };
    const service = new CampanhaRoletaService(
      prisma as never,
      acessoJogador as never,
    );
    await expect(
      service.salvarPermissao(2, 8, 7, {
        podeConfigurar: true,
        podeGirar: true,
      }),
    ).rejects.toBeInstanceOf(CampanhaRoletaAcessoNegadoException);
  });
});

describe('CampanhaRoletaService - modo simples', () => {
  const acessoMestre = {
    garantirAcesso: jest.fn().mockResolvedValue({
      ehMestre: true,
      papel: 'MESTRE',
    }),
  };
  const item = {
    chave: 'MANUAL:TESTE',
    nome: 'Teste',
    categoria: 'MANUAL',
    fonte: 'MANUAL',
    ocorrencias: 1,
    pesoUnitario: 1,
    pesoTotal: 1,
    incluidoManualmente: true,
  };
  const sorteio = {
    id: 10,
    campanhaId: 2,
    presetId: 3,
    slot: 'CUSTOMIZADO',
    modo: 'SIMPLES',
    alvoUsuarioId: null,
    alvo: null,
    status: 'AGUARDANDO_GIRO_1',
    configSnapshot: {},
    poolSnapshot: {
      modo: 'SIMPLES',
      claSelecionadoChave: null,
      claDuplicadoChave: null,
      itens: [item],
      quantidadeResultados: 1,
      pesoTotal: 1,
    },
    resultados: [],
    resultadoFinal: null,
    revisao: 1,
    chaveAtiva: '2:CUSTOMIZADO',
    iniciadoPorId: 3,
    finalizadoPorId: null,
    canceladoPorId: null,
    iniciadoPor: { id: 3, apelido: 'Mestre' },
    finalizadoPor: null,
    canceladoPor: null,
    criadoEm: new Date('2026-07-18T12:00:00.000Z'),
    atualizadoEm: new Date('2026-07-18T12:00:00.000Z'),
    finalizadoEm: null,
    canceladoEm: null,
  };
  const clientRequestId = '65ef0069-4432-4ec0-a355-fb65b7949980';

  beforeEach(() => jest.clearAllMocks());

  it('finaliza no primeiro giro e libera a chave ativa', async () => {
    const salvo = {
      ...sorteio,
      status: 'FINALIZADO',
      resultados: [item],
      resultadoFinal: item,
      revisao: 2,
      chaveAtiva: null,
      finalizadoPorId: 3,
      finalizadoPor: { id: 3, apelido: 'Mestre' },
      finalizadoEm: new Date('2026-07-18T12:00:01.000Z'),
    };
    const tx = {
      campanhaRoletaEvento: {
        create: jest.fn().mockResolvedValue({ id: 30 }),
        update: jest.fn().mockResolvedValue({}),
      },
      campanhaRoletaSorteio: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(salvo),
      },
    };
    const prisma = {
      campanhaRoletaSorteio: {
        findFirst: jest.fn().mockResolvedValue(sorteio),
      },
      campanhaRoletaEvento: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(
        async (callback: (transaction: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    };
    const service = new CampanhaRoletaService(
      prisma as never,
      acessoMestre as never,
    );

    const resposta = await service.girar(2, 10, 3, {
      revisaoEsperada: 1,
      clientRequestId,
    });

    expect(resposta.dados).toEqual(
      expect.objectContaining({
        sorteio: expect.objectContaining({
          status: 'FINALIZADO',
          resultadoFinal: item,
        }),
      }),
    );
    expect(tx.campanhaRoletaSorteio.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FINALIZADO',
          chaveAtiva: null,
        }),
      }),
    );
  });

  it.each([
    ['escolher', { revisaoEsperada: 1, indiceEscolhido: 0, clientRequestId }],
    ['terceiroGiro', { revisaoEsperada: 1, clientRequestId }],
  ] as const)('rejeita %s fora do modo tecnica', async (acao, dto) => {
    const prisma = {
      campanhaRoletaSorteio: {
        findFirst: jest.fn().mockResolvedValue({
          ...sorteio,
          status: 'AGUARDANDO_ESCOLHA',
        }),
      },
    };
    const service = new CampanhaRoletaService(
      prisma as never,
      acessoMestre as never,
    );

    await expect(
      acao === 'escolher'
        ? service.escolher(2, 10, 3, dto)
        : service.terceiroGiro(2, 10, 3, dto),
    ).rejects.toBeInstanceOf(CampanhaRoletaSorteioInvalidoException);
  });
});
