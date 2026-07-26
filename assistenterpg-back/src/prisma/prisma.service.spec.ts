import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

function criarErroPrisma(codigo: string) {
  return new Prisma.PrismaClientKnownRequestError('falha de teste', {
    code: codigo,
    clientVersion: Prisma.prismaVersion.client,
  });
}

describe('PrismaService.executarLeituraComRetry', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  afterEach(async () => {
    await service.$disconnect();
  });

  it('repete uma leitura P1017 uma unica vez e retorna o segundo resultado', async () => {
    const operacao = jest
      .fn<Promise<{ id: number }>, []>()
      .mockRejectedValueOnce(criarErroPrisma('P1017'))
      .mockResolvedValueOnce({ id: 1 });

    await expect(
      service.executarLeituraComRetry(operacao, 'teste.p1017'),
    ).resolves.toEqual({ id: 1 });
    expect(operacao).toHaveBeenCalledTimes(2);
  });

  it('propaga a segunda falha P1017 sem uma terceira tentativa', async () => {
    const segundaFalha = criarErroPrisma('P1017');
    const operacao = jest
      .fn<Promise<never>, []>()
      .mockRejectedValueOnce(criarErroPrisma('P1017'))
      .mockRejectedValueOnce(segundaFalha);

    await expect(
      service.executarLeituraComRetry(operacao, 'teste.p1017.repetido'),
    ).rejects.toBe(segundaFalha);
    expect(operacao).toHaveBeenCalledTimes(2);
  });

  it('nao repete erros Prisma nao transitorios', async () => {
    const erro = criarErroPrisma('P2025');
    const operacao = jest.fn<Promise<never>, []>().mockRejectedValue(erro);

    await expect(
      service.executarLeituraComRetry(operacao, 'teste.nao.transitorio'),
    ).rejects.toBe(erro);
    expect(operacao).toHaveBeenCalledTimes(1);
  });
});

describe('PrismaService proxy compartilhado', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await service.$disconnect();
  });

  it('aplica o retry central a leituras de delegates', async () => {
    const findUnique = jest
      .fn()
      .mockRejectedValueOnce(criarErroPrisma('P1017'))
      .mockResolvedValueOnce({ id: 7 });
    Object.defineProperty(service.usuario, 'findUnique', {
      configurable: true,
      value: findUnique,
    });

    await expect(
      service.usuario.findUnique({ where: { id: 7 } }),
    ).resolves.toEqual({ id: 7 });
    expect(findUnique).toHaveBeenCalledTimes(2);
  });

  it('nao repete escritas nem SQL raw', async () => {
    const erroEscrita = criarErroPrisma('P1017');
    const create = jest.fn().mockRejectedValue(erroEscrita);
    Object.defineProperty(service.usuario, 'create', {
      configurable: true,
      value: create,
    });
    const queryRaw = jest.fn().mockRejectedValue(criarErroPrisma('P1017'));
    Object.defineProperty(service, '$queryRaw', {
      configurable: true,
      value: queryRaw,
    });

    await expect(
      service.usuario.create({
        data: {
          email: 'retry-write@example.com',
          senhaHash: 'segredo',
          nome: 'Retry write',
        },
      }),
    ).rejects.toBe(erroEscrita);
    await expect(
      (service as unknown as { $queryRaw: () => Promise<unknown> }).$queryRaw(),
    ).rejects.toMatchObject({ code: 'P1017' });
    expect(create).toHaveBeenCalledTimes(1);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('nao repete leituras feitas pelo cliente transacional', async () => {
    const erro = criarErroPrisma('P1017');
    const findUnique = jest.fn().mockRejectedValue(erro);
    const tx = {
      usuario: {
        findUnique,
        findMany: jest.fn(),
      },
    };
    const transaction = jest.fn(
      async (callback: (cliente: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
    Object.defineProperty(service, '$transaction', {
      configurable: true,
      value: transaction,
    });

    await expect(
      service.executarTransacao('teste.tx.sem-retry', (cliente) =>
        cliente.usuario.findUnique({ where: { id: 1 } }),
      ),
    ).rejects.toBe(erro);
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('registra contexto e contagem sem incluir argumentos ou payloads', async () => {
    const segredo = 'payload-nao-deve-ser-logado';
    const tx = {
      usuario: {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
        findMany: jest.fn(),
      },
    };
    Object.defineProperty(service, '$transaction', {
      configurable: true,
      value: jest.fn(
        async (callback: (cliente: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    });
    (
      service as unknown as { transactionWarnQueryCount: number }
    ).transactionWarnQueryCount = 1;
    const warn = jest
      .spyOn(
        (
          service as unknown as {
            logger: { warn: (mensagem: string) => void };
          }
        ).logger,
        'warn',
      )
      .mockImplementation();

    await service.executarTransacao('teste.observabilidade', (cliente) =>
      cliente.usuario.findUnique({
        where: { email: segredo },
      }),
    );

    expect(warn).toHaveBeenCalledTimes(1);
    const registro = String(warn.mock.calls[0][0]);
    expect(registro).toContain('"contexto":"teste.observabilidade"');
    expect(registro).toContain('"queryCount":1');
    expect(registro).not.toContain(segredo);
    expect(registro).not.toContain('"where"');
  });

  it('emite warning quando a duracao ultrapassa o limite configurado', async () => {
    const tx = {
      usuario: {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
        findMany: jest.fn(),
      },
    };
    Object.defineProperty(service, '$transaction', {
      configurable: true,
      value: jest.fn(
        async (callback: (cliente: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    });
    (
      service as unknown as { transactionWarnQueryCount: number }
    ).transactionWarnQueryCount = 999;
    jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(7_000);
    const warn = jest
      .spyOn(
        (
          service as unknown as {
            logger: { warn: (mensagem: string) => void };
          }
        ).logger,
        'warn',
      )
      .mockImplementation();

    await service.executarTransacao('teste.duracao', (cliente) =>
      cliente.usuario.findUnique({ where: { id: 1 } }),
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('"durationMs":6000'),
    );
  });

  it('instrumenta transacao em lote pela quantidade de operacoes', async () => {
    const transaction = jest
      .fn()
      .mockImplementation((operacoes: Promise<unknown>[]) =>
        Promise.all(operacoes),
      );
    Object.defineProperty(service, '$transaction', {
      configurable: true,
      value: transaction,
    });
    const debug = jest
      .spyOn(
        (
          service as unknown as {
            logger: { debug: (mensagem: string) => void };
          }
        ).logger,
        'debug',
      )
      .mockImplementation();
    const operacoes = [
      Promise.resolve({ count: 1 }),
      Promise.resolve({ count: 2 }),
    ] as unknown as Prisma.PrismaPromise<unknown>[];

    await expect(service.$transaction(operacoes)).resolves.toEqual([
      { count: 1 },
      { count: 2 },
    ]);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith(
      expect.stringContaining('"queryCount":2'),
    );
  });
});
