// src/campanha/campanha.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  CampanhaNaoEncontradaException,
  CampanhaAcessoNegadoException,
  CampanhaApenasDonoException,
  UsuarioNaoEncontradoException,
  UsuarioJaMembroCampanhaException,
  ConviteNaoEncontradoException,
  ConviteInvalidoOuUtilizadoException,
  ConviteNaoPertenceUsuarioException,
} from 'src/common/exceptions/campanha.exception';

@Injectable()
export class CampanhaService {
  constructor(private readonly prisma: PrismaService) {}

  async criarCampanha(
    donoId: number,
    dto: { nome: string; descricao?: string },
  ) {
    return this.prisma.campanha.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? '',
        status: 'ATIVA',
        donoId,
      },
      include: {
        dono: {
          select: { id: true, apelido: true, email: true },
        },
        _count: {
          select: { membros: true, personagens: true, sessoes: true },
        },
      },
    });
  }

  async listarMinhasCampanhas(
    usuarioId: number,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      OR: [
        { donoId: usuarioId },
        {
          membros: {
            some: { usuarioId },
          },
        },
      ],
    };

    const include = {
      dono: {
        select: { id: true, apelido: true },
      },
      _count: {
        select: { membros: true, personagens: true, sessoes: true },
      },
    };

    const orderBy = {
      criadoEm: 'desc' as const,
    };

    if (!page || !limit) {
      return this.prisma.campanha.findMany({
        where,
        include,
        orderBy,
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.campanha.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.campanha.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarPorIdParaUsuario(id: number, usuarioId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id },
      include: {
        dono: { select: { id: true, apelido: true } },
        membros: {
          include: {
            usuario: { select: { id: true, apelido: true } },
          },
        },
        _count: {
          select: { personagens: true, sessoes: true },
        },
      },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(id);
    }

    const ehDono = campanha.donoId === usuarioId;
    const ehMembro = campanha.membros.some((m) => m.usuarioId === usuarioId);

    if (!ehDono && !ehMembro) {
      throw new CampanhaAcessoNegadoException(id, usuarioId);
    }

    return campanha;
  }

  async excluirCampanha(campanhaId: number, usuarioId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: { donoId: true },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    if (campanha.donoId !== usuarioId) {
      throw new CampanhaApenasDonoException('excluir a campanha');
    }

    await this.prisma.campanha.delete({
      where: { id: campanhaId },
    });

    return {
      message: 'Campanha excluída com sucesso',
      id: campanhaId,
    };
  }

  async listarMembros(campanhaId: number, usuarioId: number) {
    // garante que usuário tem acesso à campanha
    await this.garantirAcesso(campanhaId, usuarioId);

    return this.prisma.membroCampanha.findMany({
      where: { campanhaId },
      include: {
        usuario: {
          select: { id: true, apelido: true, email: true },
        },
      },
      orderBy: { entrouEm: 'asc' },
    });
  }

  async adicionarMembro(
    campanhaId: number,
    solicitanteId: number,
    dados: { usuarioId: number; papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR' },
  ) {
    // só o dono pode gerenciar membros (pode ajustar depois)
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    if (campanha.donoId !== solicitanteId) {
      throw new CampanhaApenasDonoException('gerenciar membros');
    }

    // evita duplicidade (@@unique[campanhaId, usuarioId])
    return this.prisma.membroCampanha.create({
      data: {
        campanhaId,
        usuarioId: dados.usuarioId,
        papel: dados.papel,
      },
      include: {
        usuario: { select: { id: true, apelido: true, email: true } },
      },
    });
  }

  private async garantirAcesso(campanhaId: number, usuarioId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      include: {
        membros: { select: { usuarioId: true } },
      },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    const ehDono = campanha.donoId === usuarioId;
    const ehMembro = campanha.membros.some((m) => m.usuarioId === usuarioId);

    if (!ehDono && !ehMembro) {
      throw new CampanhaAcessoNegadoException(campanhaId, usuarioId);
    }
  }

  private gerarCodigoConvite(): string {
    // algo simples por enquanto; depois dá para melhorar
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async criarConvitePorEmail(
    campanhaId: number,
    donoId: number,
    email: string,
    papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR',
  ) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      include: { dono: true },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    if (campanha.donoId !== donoId) {
      throw new CampanhaApenasDonoException('enviar convites');
    }

    const codigo = this.gerarCodigoConvite();

    return this.prisma.conviteCampanha.create({
      data: {
        campanhaId,
        email,
        papel,
        codigo,
        status: 'PENDENTE',
      },
    });
  }

  async listarConvitesPendentesPorUsuario(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
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
    const convite = await this.prisma.conviteCampanha.findUnique({
      where: { codigo },
      include: { campanha: true },
    });

    if (!convite) {
      throw new ConviteNaoEncontradoException(codigo);
    }

    if (convite.status !== 'PENDENTE') {
      throw new ConviteInvalidoOuUtilizadoException(codigo, convite.status);
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new UsuarioNaoEncontradoException(usuarioId);
    }

    if (usuario.email !== convite.email) {
      throw new ConviteNaoPertenceUsuarioException(
        convite.email,
        usuario.email,
      );
    }

    // verifica se já é membro
    const jaMembro = await this.prisma.membroCampanha.findUnique({
      where: {
        campanhaId_usuarioId: {
          campanhaId: convite.campanhaId,
          usuarioId,
        },
      },
    });

    if (jaMembro) {
      throw new UsuarioJaMembroCampanhaException(usuarioId, convite.campanhaId);
    }

    const papelConvite =
      convite.papel === 'MESTRE' || convite.papel === 'OBSERVADOR'
        ? convite.papel
        : 'JOGADOR';

    const membro = await this.prisma.membroCampanha.create({
      data: {
        campanhaId: convite.campanhaId,
        usuarioId,
        papel: papelConvite,
      },
    });

    await this.prisma.conviteCampanha.update({
      where: { id: convite.id },
      data: {
        status: 'ACEITO',
        respondidoEm: new Date(),
      },
    });

    return membro;
  }

  async recusarConvite(codigo: string, usuarioId: number) {
    const convite = await this.prisma.conviteCampanha.findUnique({
      where: { codigo },
    });

    if (!convite) {
      throw new ConviteNaoEncontradoException(codigo);
    }

    if (convite.status !== 'PENDENTE') {
      throw new ConviteInvalidoOuUtilizadoException(codigo, convite.status);
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new UsuarioNaoEncontradoException(usuarioId);
    }

    if (usuario.email !== convite.email) {
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
