import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatusContaUsuario } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const DEFAULT_CLEANUP_INTERVAL_MINUTES = 15;
const DEFAULT_RETENTION_DAYS = 7;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

@Injectable()
export class SecurityCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SecurityCleanupService.name);
  private interval?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const intervalMs =
      this.getPositiveNumber(
        'AUTH_SECURITY_CLEANUP_INTERVAL_MINUTES',
        DEFAULT_CLEANUP_INTERVAL_MINUTES,
      ) * MINUTE_MS;

    this.interval = setInterval(() => void this.executar(), intervalMs);
    this.interval.unref();
    void this.executar();
  }

  onModuleDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  async executar(): Promise<void> {
    const agora = new Date();
    const retencaoAte = new Date(
      agora.getTime() -
        this.getPositiveNumber(
          'AUTH_SECURITY_RETENTION_DAYS',
          DEFAULT_RETENTION_DAYS,
        ) *
          DAY_MS,
    );

    try {
      const contasPendentesExclusao = await this.prisma.usuario.findMany({
        where: {
          status: StatusContaUsuario.PENDENTE_EXCLUSAO,
          exclusaoAgendadaPara: { lte: agora },
        },
        select: { id: true },
      });

      await this.prisma.$transaction([
        this.prisma.registroPendenteUsuario.deleteMany({
          where: { expiraEm: { lte: agora } },
        }),
        this.prisma.alteracaoEmailPendente.deleteMany({
          where: { tokenExpiraEm: { lte: agora } },
        }),
        this.prisma.authToken.deleteMany({
          where: {
            OR: [
              { expiraEm: { lte: retencaoAte } },
              { usadoEm: { not: null, lte: retencaoAte } },
            ],
          },
        }),
        this.prisma.sessaoAutenticacao.deleteMany({
          where: {
            OR: [
              { expiraEm: { lte: retencaoAte } },
              { revogadaEm: { not: null, lte: retencaoAte } },
            ],
          },
        }),
        this.prisma.limiteRequisicaoSeguranca.deleteMany({
          where: { expiraEm: { lte: agora } },
        }),
        this.prisma.oAuthState.deleteMany({
          where: {
            OR: [
              { expiraEm: { lte: agora } },
              { consumidoEm: { not: null, lte: retencaoAte } },
            ],
          },
        }),
        ...contasPendentesExclusao.map((conta) =>
          this.prisma.usuario.updateMany({
            where: {
              id: conta.id,
              status: StatusContaUsuario.PENDENTE_EXCLUSAO,
              exclusaoAgendadaPara: { lte: agora },
            },
            data: {
              apelido: `Conta excluida ${conta.id}`,
              email: `excluido-${conta.id}@anonimo.invalid`,
              senhaHash: `conta-excluida-${conta.id}`,
              emailVerificadoEm: null,
              status: StatusContaUsuario.EXCLUIDA,
              desativadoEm: null,
              exclusaoAgendadaPara: null,
              excluidoEm: agora,
            },
          }),
        ),
      ]);
    } catch (error) {
      this.logger.error(
        'Falha na limpeza periódica de artefatos de segurança.',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private getPositiveNumber(key: string, fallback: number): number {
    const value = Number(this.configService.get<string>(key) ?? fallback);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
