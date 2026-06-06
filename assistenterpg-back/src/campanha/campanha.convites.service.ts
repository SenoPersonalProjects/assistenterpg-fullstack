// src/campanha/campanha.convites.service.ts
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  StatusAmizade,
  StatusContaUsuario,
  type MembroCampanha,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AmizadeNaoEncontradaException } from 'src/common/exceptions/amizade.exception';
import {
  CampanhaApenasDonoException,
  CampanhaNaoEncontradaException,
  ConviteCodigoIndisponivelException,
  ConviteInvalidoOuUtilizadoException,
  ConviteNaoEncontradoException,
  ConviteNaoPertenceUsuarioException,
  ConvitePendenteDuplicadoException,
  UsuarioJaMembroCampanhaException,
  UsuarioNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import {
  UsuarioApelidoDuplicadoException,
  UsuarioApelidoNaoEncontradoException,
  UsuarioEmailNaoEncontradoException,
} from 'src/common/exceptions/usuario.exception';
import {
  gerarCodigoConvite,
  isUniqueConstraintViolation,
  normalizarEmail,
} from './engine/campanha.engine';
import {
  MAX_TENTATIVAS_CODIGO_CONVITE,
  PapelCampanha,
} from './engine/campanha.engine.types';

const usuarioAtivoVerificadoWhere = {
  emailVerificadoEm: { not: null },
  status: StatusContaUsuario.ATIVA,
} satisfies Prisma.UsuarioWhereInput;

@Injectable()
export class CampanhaConvitesService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarParAmizade(usuarioId: number, outroUsuarioId: number) {
    return {
      usuarioAId: Math.min(usuarioId, outroUsuarioId),
      usuarioBId: Math.max(usuarioId, outroUsuarioId),
    };
  }

  async criarConvite(
    campanhaId: number,
    donoId: number,
    dados: { email?: string; apelido?: string; usuarioId?: number },
    papel: PapelCampanha,
  ) {
    if (dados.usuarioId) {
      const amizade = await this.prisma.amizade.findUnique({
        where: {
          usuarioAId_usuarioBId: this.normalizarParAmizade(
            donoId,
            dados.usuarioId,
          ),
        },
        select: { status: true },
      });

      if (!amizade || amizade.status !== StatusAmizade.ACEITA) {
        throw new AmizadeNaoEncontradaException(dados.usuarioId);
      }

      const usuario = await this.prisma.usuario.findUnique({
        where: {
          id: dados.usuarioId,
          AND: [usuarioAtivoVerificadoWhere],
        },
        select: { email: true },
      });

      if (!usuario) {
        throw new UsuarioNaoEncontradoException(dados.usuarioId);
      }

      return this.criarConvitePorEmail(
        campanhaId,
        donoId,
        usuario.email,
        papel,
      );
    }

    const emailInformado = dados.email?.trim();
    if (emailInformado) {
      return this.criarConvitePorEmail(
        campanhaId,
        donoId,
        emailInformado,
        papel,
      );
    }

    const apelidoInformado = dados.apelido?.trim();
    if (!apelidoInformado) {
      throw new UsuarioApelidoNaoEncontradoException(''); // fallback para erro de validação
    }

    const usuarios = await this.prisma.usuario.findMany({
      where: {
        apelido: {
          equals: apelidoInformado,
        },
        ...usuarioAtivoVerificadoWhere,
      },
      select: { id: true, email: true },
      take: 2,
    });

    if (usuarios.length === 0) {
      throw new UsuarioApelidoNaoEncontradoException(apelidoInformado);
    }

    if (usuarios.length > 1) {
      throw new UsuarioApelidoDuplicadoException(apelidoInformado);
    }

    return this.criarConvitePorEmail(
      campanhaId,
      donoId,
      usuarios[0].email,
      papel,
    );
  }

  async criarConvitePorEmail(
    campanhaId: number,
    donoId: number,
    email: string,
    papel: PapelCampanha,
  ) {
    const emailInformado = email.trim();
    const emailConviteNormalizado = normalizarEmail(emailInformado);

    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      include: {
        dono: {
          select: {
            id: true,
            email: true,
          },
        },
        membros: {
          select: {
            usuarioId: true,
            usuario: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    if (campanha.donoId !== donoId) {
      throw new CampanhaApenasDonoException('enviar convites');
    }

    if (normalizarEmail(campanha.dono.email) === emailConviteNormalizado) {
      throw new UsuarioJaMembroCampanhaException(campanha.dono.id, campanhaId);
    }

    const membroExistente = campanha.membros.find(
      (membro) =>
        normalizarEmail(membro.usuario.email) === emailConviteNormalizado,
    );

    if (membroExistente) {
      throw new UsuarioJaMembroCampanhaException(
        membroExistente.usuarioId,
        campanhaId,
      );
    }

    const usuarioConvidado = await this.prisma.usuario.findUnique({
      where: {
        email: emailConviteNormalizado,
        AND: [usuarioAtivoVerificadoWhere],
      },
      select: { email: true },
    });

    if (!usuarioConvidado) {
      throw new UsuarioEmailNaoEncontradoException(emailInformado);
    }

    const emailConvite = usuarioConvidado.email;
    const convitesPendentes = await this.prisma.conviteCampanha.findMany({
      where: {
        campanhaId,
        status: 'PENDENTE',
      },
      select: {
        email: true,
      },
    });

    const convitePendenteDuplicado = convitesPendentes.some(
      (convite) => normalizarEmail(convite.email) === emailConviteNormalizado,
    );

    if (convitePendenteDuplicado) {
      throw new ConvitePendenteDuplicadoException(campanhaId, emailConvite);
    }

    for (
      let tentativa = 1;
      tentativa <= MAX_TENTATIVAS_CODIGO_CONVITE;
      tentativa += 1
    ) {
      const codigo = gerarCodigoConvite();

      try {
        return await this.prisma.conviteCampanha.create({
          data: {
            campanhaId,
            email: emailConvite,
            papel,
            codigo,
            status: 'PENDENTE',
          },
        });
      } catch (error) {
        const colisaoCodigo = isUniqueConstraintViolation(error, ['codigo']);
        if (!colisaoCodigo) {
          throw error;
        }

        if (tentativa === MAX_TENTATIVAS_CODIGO_CONVITE) {
          throw new ConviteCodigoIndisponivelException(
            campanhaId,
            MAX_TENTATIVAS_CODIGO_CONVITE,
          );
        }
      }
    }

    throw new ConviteCodigoIndisponivelException(
      campanhaId,
      MAX_TENTATIVAS_CODIGO_CONVITE,
    );
  }

  async listarConvitesPendentesPorUsuario(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
        AND: [usuarioAtivoVerificadoWhere],
      },
      select: { email: true },
    });

    if (!usuario) {
      throw new UsuarioNaoEncontradoException(usuarioId);
    }

    return this.prisma.conviteCampanha.findMany({
      where: {
        email: usuario.email,
        status: 'PENDENTE',
      },
      include: {
        campanha: {
          select: { id: true, nome: true, dono: { select: { apelido: true } } },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async aceitarConvite(codigo: string, usuarioId: number) {
    const codigoConvite = codigo.trim();

    return this.prisma.$transaction(async (tx) => {
      const convite = await tx.conviteCampanha.findUnique({
        where: { codigo: codigoConvite },
        select: {
          id: true,
          campanhaId: true,
          email: true,
          papel: true,
          status: true,
        },
      });

      if (!convite) {
        throw new ConviteNaoEncontradoException(codigoConvite);
      }

      if (convite.status !== 'PENDENTE') {
        throw new ConviteInvalidoOuUtilizadoException(
          codigoConvite,
          convite.status,
        );
      }

      const usuario = await tx.usuario.findUnique({
        where: {
          id: usuarioId,
          AND: [usuarioAtivoVerificadoWhere],
        },
        select: {
          email: true,
        },
      });

      if (!usuario) {
        throw new UsuarioNaoEncontradoException(usuarioId);
      }

      if (normalizarEmail(usuario.email) !== normalizarEmail(convite.email)) {
        throw new ConviteNaoPertenceUsuarioException(
          convite.email,
          usuario.email,
        );
      }

      const jaMembro = await tx.membroCampanha.findUnique({
        where: {
          campanhaId_usuarioId: {
            campanhaId: convite.campanhaId,
            usuarioId,
          },
        },
        select: {
          id: true,
        },
      });

      if (jaMembro) {
        throw new UsuarioJaMembroCampanhaException(
          usuarioId,
          convite.campanhaId,
        );
      }

      const papelConvite: PapelCampanha =
        convite.papel === 'MESTRE' || convite.papel === 'OBSERVADOR'
          ? convite.papel
          : 'JOGADOR';

      const membroCriado: MembroCampanha = await tx.membroCampanha
        .create({
          data: {
            campanhaId: convite.campanhaId,
            usuarioId,
            papel: papelConvite,
          },
        })
        .catch((error) => {
          const conflitoMembro = isUniqueConstraintViolation(error, [
            'campanhaId',
            'usuarioId',
          ]);
          if (conflitoMembro) {
            throw new UsuarioJaMembroCampanhaException(
              usuarioId,
              convite.campanhaId,
            );
          }
          throw error;
        });

      await tx.conviteCampanha.update({
        where: { id: convite.id },
        data: {
          status: 'ACEITO',
          respondidoEm: new Date(),
        },
      });

      return membroCriado;
    });
  }

  async recusarConvite(codigo: string, usuarioId: number) {
    const codigoConvite = codigo.trim();

    const convite = await this.prisma.conviteCampanha.findUnique({
      where: { codigo: codigoConvite },
    });

    if (!convite) {
      throw new ConviteNaoEncontradoException(codigoConvite);
    }

    if (convite.status !== 'PENDENTE') {
      throw new ConviteInvalidoOuUtilizadoException(
        codigoConvite,
        convite.status,
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
        AND: [usuarioAtivoVerificadoWhere],
      },
    });

    if (!usuario) {
      throw new UsuarioNaoEncontradoException(usuarioId);
    }

    if (normalizarEmail(usuario.email) !== normalizarEmail(convite.email)) {
      throw new ConviteNaoPertenceUsuarioException(
        convite.email,
        usuario.email,
      );
    }

    return this.prisma.conviteCampanha.update({
      where: { id: convite.id },
      data: {
        status: 'RECUSADO',
        respondidoEm: new Date(),
      },
    });
  }
}
