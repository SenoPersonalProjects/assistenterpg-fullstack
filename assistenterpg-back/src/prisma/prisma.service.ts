import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const DEFAULT_TRANSACTION_TIMEOUT_MS = 15_000;
const DEFAULT_TRANSACTION_WARN_MS = 5_000;
const DEFAULT_TRANSACTION_WARN_QUERY_COUNT = 25;
const LEITURA_RETRY_DELAY_MS = 50;
const TOTAL_TENTATIVAS_LEITURA = 2;
const OPERACOES_LEITURA_COM_RETRY = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
]);
const OPERACOES_RAW_TRANSACAO = new Set([
  '$executeRaw',
  '$executeRawUnsafe',
  '$queryRaw',
  '$queryRawUnsafe',
]);

type TransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
};

type TransactionCallback<T> = (prisma: Prisma.TransactionClient) => Promise<T>;

type PrismaDelegate = Record<string, unknown>;

function obterInteiroPositivo(
  valor: string | undefined,
  fallback: number,
): number {
  if (!valor) return fallback;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : fallback;
}

function ehDelegatePrisma(valor: unknown): valor is PrismaDelegate {
  if (!valor || typeof valor !== 'object') return false;

  return (
    typeof Reflect.get(valor, 'findUnique') === 'function' ||
    typeof Reflect.get(valor, 'findMany') === 'function'
  );
}

function obterCodigoErro(error: unknown): string | null {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return null;
}

function aplicarFuncao(
  funcao: (...args: never[]) => unknown,
  alvo: unknown,
  args: unknown[],
): unknown {
  return Reflect.apply(funcao, alvo, args) as unknown;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly transactionWarnMs: number;
  private readonly transactionWarnQueryCount: number;
  private readonly delegatesLeitura = new WeakMap<object, object>();

  constructor() {
    super({
      transactionOptions: {
        timeout: obterInteiroPositivo(
          process.env.PRISMA_TRANSACTION_TIMEOUT_MS,
          DEFAULT_TRANSACTION_TIMEOUT_MS,
        ),
      },
    });

    this.transactionWarnMs = obterInteiroPositivo(
      process.env.PRISMA_TRANSACTION_WARN_MS,
      DEFAULT_TRANSACTION_WARN_MS,
    );
    this.transactionWarnQueryCount = obterInteiroPositivo(
      process.env.PRISMA_TRANSACTION_WARN_QUERY_COUNT,
      DEFAULT_TRANSACTION_WARN_QUERY_COUNT,
    );

    return new Proxy(this, {
      get: (target, propriedade, receiver) => {
        if (propriedade === '$transaction') {
          return (
            entrada:
              | TransactionCallback<unknown>
              | Prisma.PrismaPromise<unknown>[],
            options?: TransactionOptions,
          ) =>
            target.executarTransacaoInstrumentada(
              'prisma.$transaction',
              entrada,
              options,
            );
        }

        const valor = Reflect.get(target, propriedade, receiver) as unknown;
        if (ehDelegatePrisma(valor)) {
          return target.criarDelegateLeituraProtegida(
            String(propriedade),
            valor,
          );
        }

        return typeof valor === 'function'
          ? (...args: unknown[]) =>
              aplicarFuncao(
                valor as (...args: never[]) => unknown,
                target,
                args,
              )
          : valor;
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async executarLeituraComRetry<T>(
    operacao: () => Promise<T>,
    contexto: string,
  ): Promise<T> {
    for (
      let tentativa = 1;
      tentativa <= TOTAL_TENTATIVAS_LEITURA;
      tentativa++
    ) {
      try {
        return await operacao();
      } catch (error: unknown) {
        const deveRepetir =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P1017' &&
          tentativa < TOTAL_TENTATIVAS_LEITURA;

        if (!deveRepetir) throw error;

        this.logger.warn(
          `[${contexto}] conexão encerrada pelo banco; repetindo leitura idempotente`,
        );
        await new Promise<void>((resolve) =>
          setTimeout(resolve, LEITURA_RETRY_DELAY_MS),
        );
      }
    }

    throw new Error('Leitura Prisma finalizada sem resultado');
  }

  async executarTransacao<T>(
    contexto: string,
    operacao: TransactionCallback<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    return this.executarTransacaoInstrumentada(
      contexto,
      operacao,
      options,
    ) as Promise<T>;
  }

  private criarDelegateLeituraProtegida(
    model: string,
    delegate: PrismaDelegate,
  ): PrismaDelegate {
    const existente = this.delegatesLeitura.get(delegate);
    if (existente) return existente as PrismaDelegate;

    const protegido = new Proxy(delegate, {
      get: (target, propriedade, receiver) => {
        const valor = Reflect.get(target, propriedade, receiver) as unknown;
        if (
          typeof propriedade !== 'string' ||
          typeof valor !== 'function' ||
          !OPERACOES_LEITURA_COM_RETRY.has(propriedade)
        ) {
          return typeof valor === 'function'
            ? (...args: unknown[]) =>
                aplicarFuncao(
                  valor as (...args: never[]) => unknown,
                  target,
                  args,
                )
            : valor;
        }

        return (...args: unknown[]) =>
          this.executarLeituraComRetry(
            () =>
              aplicarFuncao(
                valor as (...args: never[]) => unknown,
                target,
                args,
              ) as Promise<unknown>,
            `${model}.${propriedade}`,
          );
      },
    });

    this.delegatesLeitura.set(delegate, protegido);
    return protegido;
  }

  private criarClienteTransacaoObservavel(
    tx: Prisma.TransactionClient,
    incrementarConsultas: () => void,
  ): Prisma.TransactionClient {
    const delegates = new WeakMap<object, object>();

    return new Proxy(tx, {
      get: (target, propriedade, receiver) => {
        const valor = Reflect.get(target, propriedade, receiver) as unknown;
        if (ehDelegatePrisma(valor)) {
          const existente = delegates.get(valor);
          if (existente) return existente;

          const delegate = new Proxy(valor, {
            get: (delegateTarget, delegatePropriedade, delegateReceiver) => {
              const operacao = Reflect.get(
                delegateTarget,
                delegatePropriedade,
                delegateReceiver,
              ) as unknown;
              if (typeof operacao !== 'function') return operacao;

              return (...args: unknown[]) => {
                incrementarConsultas();
                return aplicarFuncao(
                  operacao as (...args: never[]) => unknown,
                  delegateTarget,
                  args,
                );
              };
            },
          });
          delegates.set(valor, delegate);
          return delegate;
        }

        if (
          typeof propriedade === 'string' &&
          typeof valor === 'function' &&
          OPERACOES_RAW_TRANSACAO.has(propriedade)
        ) {
          return (...args: unknown[]) => {
            incrementarConsultas();
            return aplicarFuncao(
              valor as (...args: never[]) => unknown,
              target,
              args,
            );
          };
        }

        return typeof valor === 'function'
          ? (...args: unknown[]) =>
              aplicarFuncao(
                valor as (...args: never[]) => unknown,
                target,
                args,
              )
          : valor;
      },
    });
  }

  private async executarTransacaoInstrumentada(
    contexto: string,
    entrada: TransactionCallback<unknown> | Prisma.PrismaPromise<unknown>[],
    options?: TransactionOptions,
  ): Promise<unknown> {
    const inicio = Date.now();
    let quantidadeConsultas = Array.isArray(entrada) ? entrada.length : 0;

    try {
      const resultado = Array.isArray(entrada)
        ? await this.executarTransacaoEmLote(entrada, options)
        : await this.$transaction(
            (tx) =>
              entrada(
                this.criarClienteTransacaoObservavel(tx, () => {
                  quantidadeConsultas += 1;
                }),
              ),
            options,
          );

      this.registrarResultadoTransacao(
        contexto,
        inicio,
        quantidadeConsultas,
        'sucesso',
      );
      return resultado;
    } catch (error: unknown) {
      this.registrarResultadoTransacao(
        contexto,
        inicio,
        quantidadeConsultas,
        'falha',
        obterCodigoErro(error),
      );
      throw error;
    }
  }

  private executarTransacaoEmLote(
    operacoes: Prisma.PrismaPromise<unknown>[],
    options?: TransactionOptions,
  ): Promise<unknown[]> {
    const optionsEmLote = options?.isolationLevel
      ? { isolationLevel: options.isolationLevel }
      : undefined;

    return optionsEmLote
      ? this.$transaction(operacoes, optionsEmLote)
      : this.$transaction(operacoes);
  }

  private registrarResultadoTransacao(
    contexto: string,
    inicio: number,
    quantidadeConsultas: number,
    status: 'sucesso' | 'falha',
    errorCode: string | null = null,
  ): void {
    const durationMs = Date.now() - inicio;
    const registro = JSON.stringify({
      contexto,
      durationMs,
      queryCount: quantidadeConsultas,
      status,
      ...(errorCode ? { errorCode } : {}),
    });

    if (status === 'falha') {
      this.logger.error(registro);
      return;
    }

    if (
      durationMs >= this.transactionWarnMs ||
      quantidadeConsultas >= this.transactionWarnQueryCount
    ) {
      this.logger.warn(registro);
      return;
    }

    this.logger.debug(registro);
  }
}
