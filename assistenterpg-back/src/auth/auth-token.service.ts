import { Injectable } from '@nestjs/common';
import { Prisma, TipoTokenAuth } from '@prisma/client';
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
    const { token, tokenHash, expiraEm } =
      this.gerarTokenSeguro(tempoDeVidaMinutos);

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
    return this.prisma.$transaction((tx) =>
      this.consumirTokenEmTransacao(tx, token, tipo),
    );
  }

  async consumirTokenEmTransacao(
    tx: Prisma.TransactionClient,
    token: string,
    tipo: TipoTokenAuth,
  ) {
    const tokenHash = this.hashToken(token);
    const agora = new Date();

    const registro = await tx.authToken.findFirst({
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

    const consumo = await tx.authToken.updateMany({
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
    await this.invalidarTokensAtivosComClient(this.prisma, usuarioId, tipo);
  }

  async invalidarTokensAtivosEmTransacao(
    tx: Prisma.TransactionClient,
    usuarioId: number,
    tipo: TipoTokenAuth,
  ) {
    await this.invalidarTokensAtivosComClient(tx, usuarioId, tipo);
  }

  gerarTokenSeguro(tempoDeVidaMinutos: number) {
    const token = randomBytes(32).toString('hex');
    return {
      token,
      tokenHash: this.hashToken(token),
      expiraEm: new Date(Date.now() + tempoDeVidaMinutos * 60 * 1000),
    };
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async invalidarTokensAtivosComClient(
    client: Pick<Prisma.TransactionClient, 'authToken'>,
    usuarioId: number,
    tipo: TipoTokenAuth,
  ) {
    await client.authToken.updateMany({
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
}
