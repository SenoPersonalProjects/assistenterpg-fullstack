import { Injectable } from '@nestjs/common';
import { TipoTokenAuth } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthTokenInvalidoOuExpiradoException } from 'src/common/exceptions/auth.exception';

@Injectable()
export class AuthTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async gerarToken(
    usuarioId: number,
    tipo: TipoTokenAuth,
    tempoDeVidaMinutos: number,
  ) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiraEm = new Date(Date.now() + tempoDeVidaMinutos * 60 * 1000);

    await this.prisma.authToken.create({
      data: {
        usuarioId,
        tipo,
        tokenHash,
        expiraEm,
      },
    });

    return { token, expiraEm };
  }

  async consumirToken(token: string, tipo: TipoTokenAuth) {
    const tokenHash = this.hashToken(token);
    const agora = new Date();

    const registro = await this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        tipo,
        usadoEm: null,
      },
      select: {
        id: true,
        usuarioId: true,
        expiraEm: true,
      },
    });

    if (!registro || registro.expiraEm <= agora) {
      throw new AuthTokenInvalidoOuExpiradoException();
    }

    const consumo = await this.prisma.authToken.updateMany({
      where: {
        id: registro.id,
        usadoEm: null,
      },
      data: {
        usadoEm: agora,
      },
    });

    if (consumo.count === 0) {
      throw new AuthTokenInvalidoOuExpiradoException();
    }

    return registro;
  }

  async invalidarTokensAtivos(usuarioId: number, tipo: TipoTokenAuth) {
    await this.prisma.authToken.updateMany({
      where: {
        usuarioId,
        tipo,
        usadoEm: null,
      },
      data: {
        usadoEm: new Date(),
      },
    });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}

