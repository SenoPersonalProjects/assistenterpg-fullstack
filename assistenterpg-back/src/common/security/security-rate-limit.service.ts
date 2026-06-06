import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createHmac } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

const RATE_LIMIT_SECRET_MIN_LENGTH = 32;
const RATE_LIMIT_DEV_SECRET = 'assistenterpg-rate-limit-development-secret';

@Injectable()
export class SecurityRateLimitService {
  private readonly secret: string;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const configuredSecret = configService
      .get<string>('AUTH_RATE_LIMIT_HASH_SECRET')
      ?.trim();
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    if (
      isProduction &&
      (!configuredSecret ||
        configuredSecret.length < RATE_LIMIT_SECRET_MIN_LENGTH)
    ) {
      throw new Error(
        `AUTH_RATE_LIMIT_HASH_SECRET deve ter pelo menos ${RATE_LIMIT_SECRET_MIN_LENGTH} caracteres em producao.`,
      );
    }

    this.secret = configuredSecret || RATE_LIMIT_DEV_SECRET;
  }

  async consumir(input: {
    action: string;
    dimension: string;
    value: string;
    limit: number;
    windowMs: number;
  }): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
    const agora = new Date();
    const inicioMaximoDaJanela = new Date(agora.getTime() - input.windowMs);
    const bloqueadoAte = new Date(agora.getTime() + input.windowMs);
    const expiraEm = new Date(agora.getTime() + input.windowMs * 2);
    const chaveHash = this.criarChaveHash(
      input.action,
      input.dimension,
      input.value,
    );

    await this.prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO limites_requisicao_seguranca
          (chaveHash, contador, janelaIniciaEm, bloqueadoAte, expiraEm, criadoEm, atualizadoEm)
        VALUES
          (${chaveHash}, 1, ${agora}, NULL, ${expiraEm}, ${agora}, ${agora})
        ON DUPLICATE KEY UPDATE
          bloqueadoAte = IF(
            bloqueadoAte IS NOT NULL AND bloqueadoAte > ${agora},
            bloqueadoAte,
            IF(
              janelaIniciaEm <= ${inicioMaximoDaJanela},
              NULL,
              IF(contador + 1 > ${input.limit}, ${bloqueadoAte}, NULL)
            )
          ),
          contador = IF(
            bloqueadoAte IS NOT NULL AND bloqueadoAte > ${agora},
            contador,
            IF(janelaIniciaEm <= ${inicioMaximoDaJanela}, 1, contador + 1)
          ),
          janelaIniciaEm = IF(
            janelaIniciaEm <= ${inicioMaximoDaJanela},
            ${agora},
            janelaIniciaEm
          ),
          expiraEm = ${expiraEm},
          atualizadoEm = ${agora}
      `,
    );

    const bucket = await this.prisma.limiteRequisicaoSeguranca.findUnique({
      where: { chaveHash },
      select: {
        contador: true,
        janelaIniciaEm: true,
        bloqueadoAte: true,
      },
    });

    if (!bucket) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const allowed =
      bucket.contador <= input.limit &&
      (!bucket.bloqueadoAte || bucket.bloqueadoAte <= agora);
    const retryAt =
      bucket.bloqueadoAte && bucket.bloqueadoAte > agora
        ? bucket.bloqueadoAte
        : new Date(bucket.janelaIniciaEm.getTime() + input.windowMs);

    return {
      allowed,
      retryAfterSeconds: allowed
        ? 0
        : Math.max(1, Math.ceil((retryAt.getTime() - agora.getTime()) / 1000)),
    };
  }

  private criarChaveHash(action: string, dimension: string, value: string) {
    return createHmac('sha256', this.secret)
      .update(`${action}:${dimension}:${value}`)
      .digest('hex');
  }
}
