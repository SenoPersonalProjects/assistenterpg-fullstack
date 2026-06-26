import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatusSessaoAgendada } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessaoService } from './sessao.service';

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_BATCH_SIZE = 20;

@Injectable()
export class SessaoActivationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessaoActivationService.name);
  private interval?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessaoService: SessaoService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (
      this.configService.get<string>('SESSION_SCHEDULER_ENABLED') === 'false'
    ) {
      return;
    }

    const intervalMs = this.obterNumeroPositivo(
      'SESSION_SCHEDULER_INTERVAL_MS',
      DEFAULT_INTERVAL_MS,
    );
    this.interval = setInterval(
      () => void this.processarVencidas(),
      intervalMs,
    );
    this.interval.unref();
    void this.processarVencidas();
  }

  onModuleDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  async processarVencidasComFallbackLazy(campanhaId?: number): Promise<number> {
    if (
      this.configService.get<string>('SESSION_LAZY_ACTIVATION_ENABLED') ===
      'false'
    ) {
      return 0;
    }

    return this.processarVencidas(campanhaId);
  }

  async processarVencidas(campanhaId?: number): Promise<number> {
    const agora = new Date();
    const agendamentos = await this.prisma.sessaoAgendada.findMany({
      where: {
        status: StatusSessaoAgendada.AGENDADA,
        inicioEm: { lte: agora },
        ...(campanhaId ? { campanhaId } : {}),
      },
      select: { id: true },
      orderBy: { inicioEm: 'asc' },
      take: this.obterNumeroPositivo(
        'SESSION_SCHEDULER_BATCH_SIZE',
        DEFAULT_BATCH_SIZE,
      ),
    });

    let abertas = 0;
    for (const agendamento of agendamentos) {
      const aberta = await this.abrirAgendamento(agendamento.id, {
        permitirFuturo: false,
      });
      if (aberta) abertas += 1;
    }

    return abertas;
  }

  async abrirAgendamento(
    agendamentoId: number,
    options: { permitirFuturo: boolean },
  ): Promise<{ sessaoId: number; campanhaId: number } | null> {
    const agora = new Date();
    try {
      return await this.prisma.$transaction(async (tx) => {
        const claim = await tx.sessaoAgendada.updateMany({
          where: {
            id: agendamentoId,
            status: StatusSessaoAgendada.AGENDADA,
            ...(options.permitirFuturo ? {} : { inicioEm: { lte: agora } }),
          },
          data: { status: StatusSessaoAgendada.PROCESSANDO_ABERTURA },
        });
        if (claim.count === 0) {
          const existente = await tx.sessaoAgendada.findUnique({
            where: { id: agendamentoId },
            select: { sessaoId: true, campanhaId: true },
          });
          return existente?.sessaoId
            ? { sessaoId: existente.sessaoId, campanhaId: existente.campanhaId }
            : null;
        }

        const agendamento = await tx.sessaoAgendada.findUnique({
          where: { id: agendamentoId },
          select: {
            id: true,
            campanhaId: true,
            criadorId: true,
            titulo: true,
            inicioEm: true,
          },
        });
        if (!agendamento) return null;

        const sessao =
          await this.sessaoService.criarSessaoOperacionalEmTransacao(
            tx,
            agendamento.campanhaId,
            agendamento.criadorId,
            agendamento.titulo,
            agendamento.inicioEm,
          );

        await tx.sessaoAgendada.update({
          where: { id: agendamento.id },
          data: {
            status: StatusSessaoAgendada.ABERTA,
            sessaoId: sessao.id,
            abertaEm: agora,
            falhaAbertura: null,
          },
        });

        return { sessaoId: sessao.id, campanhaId: agendamento.campanhaId };
      });
    } catch (error) {
      await this.prisma.sessaoAgendada.updateMany({
        where: {
          id: agendamentoId,
          status: StatusSessaoAgendada.PROCESSANDO_ABERTURA,
        },
        data: {
          status: StatusSessaoAgendada.FALHA_ABERTURA,
          falhaAbertura: this.formatarErro(error),
        },
      });
      this.logger.error(
        `Falha ao abrir sessão agendada ${agendamentoId}.`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  private obterNumeroPositivo(key: string, fallback: number): number {
    const valor = Number(this.configService.get<string>(key) ?? fallback);
    return Number.isFinite(valor) && valor > 0 ? valor : fallback;
  }

  private formatarErro(error: unknown): string {
    return error instanceof Error
      ? error.message.slice(0, 1000)
      : 'Erro interno';
  }
}
