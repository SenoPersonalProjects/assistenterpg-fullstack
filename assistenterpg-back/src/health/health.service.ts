import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarBackupOperacionalDto } from './dto/registrar-backup-operacional.dto';

export type HealthStatus = {
  status: 'ok';
  service: 'assistenterpg-back';
  version: string;
  timestamp: string;
};

function resolveVersion(): string {
  return (
    process.env.RENDER_GIT_COMMIT ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    'local'
  );
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  live(): HealthStatus {
    return this.createStatus();
  }

  async ready(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.createStatus();
    } catch {
      throw new ServiceUnavailableException({
        code: 'HEALTH_NOT_READY',
        message: 'Dependência de dados indisponível',
      });
    }
  }

  async administrativo() {
    const [ultimoBackup, migrations] = await Promise.all([
      this.prisma.registroBackupOperacional.findFirst({
        orderBy: { executadoEm: 'desc' },
      }),
      this.prisma.$queryRaw<Array<{ migration_name: string; finished_at: Date | null }>>`
        SELECT migration_name, finished_at
        FROM _prisma_migrations
        ORDER BY finished_at DESC
        LIMIT 1
      `,
    ]);
    const frontendUrl = process.env.FRONTEND_PUBLIC_URL?.trim();
    const frontend = frontendUrl
      ? await this.consultarUrl(frontendUrl)
      : { status: 'NAO_CONFIGURADO' as const, url: null, httpStatus: null };
    return {
      backend: this.createStatus(),
      banco: { status: 'ok' as const },
      migrationMaisRecente: migrations[0]
        ? {
            nome: migrations[0].migration_name,
            aplicadaEm: migrations[0].finished_at?.toISOString() ?? null,
          }
        : null,
      ultimoBackup: ultimoBackup
        ? {
            banco: ultimoBackup.banco,
            arquivo: ultimoBackup.arquivo,
            tamanhoBytes: Number(ultimoBackup.tamanhoBytes),
            sha256: ultimoBackup.sha256,
            executadoEm: ultimoBackup.executadoEm.toISOString(),
            retencao: ultimoBackup.retencao,
            origem: ultimoBackup.origem,
          }
        : null,
      frontend,
    };
  }

  async registrarBackup(
    tokenRecebido: string | undefined,
    dto: RegistrarBackupOperacionalDto,
  ) {
    const tokenEsperado = process.env.BACKUP_STATUS_TOKEN;
    if (!tokenEsperado || !tokenRecebido || !this.tokensIguais(tokenEsperado, tokenRecebido)) {
      throw new UnauthorizedException({
        code: 'BACKUP_STATUS_TOKEN_INVALIDO',
        message: 'Token de registro de backup inválido.',
      });
    }
    return this.prisma.registroBackupOperacional.create({
      data: {
        banco: dto.banco.trim(),
        arquivo: dto.arquivo.trim(),
        tamanhoBytes: BigInt(dto.tamanhoBytes),
        sha256: dto.sha256.toLowerCase(),
        retencao: dto.retencao ?? 1,
        origem: dto.origem ?? 'AGENDADO',
        observacao: dto.observacao?.trim() || null,
      },
      select: { id: true, executadoEm: true },
    });
  }

  private async consultarUrl(url: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });
      return {
        status: response.ok ? ('ok' as const) : ('INDISPONIVEL' as const),
        url,
        httpStatus: response.status,
      };
    } catch {
      return { status: 'INDISPONIVEL' as const, url, httpStatus: null };
    } finally {
      clearTimeout(timeout);
    }
  }

  private tokensIguais(esperado: string, recebido: string): boolean {
    const esperadoBuffer = Buffer.from(esperado);
    const recebidoBuffer = Buffer.from(recebido);
    return (
      esperadoBuffer.length === recebidoBuffer.length &&
      timingSafeEqual(esperadoBuffer, recebidoBuffer)
    );
  }

  private createStatus(): HealthStatus {
    return {
      status: 'ok',
      service: 'assistenterpg-back',
      version: resolveVersion(),
      timestamp: new Date().toISOString(),
    };
  }
}
