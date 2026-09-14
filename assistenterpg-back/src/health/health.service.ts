import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  private createStatus(): HealthStatus {
    return {
      status: 'ok',
      service: 'assistenterpg-back',
      version: resolveVersion(),
      timestamp: new Date().toISOString(),
    };
  }
}
