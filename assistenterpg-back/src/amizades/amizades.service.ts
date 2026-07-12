import { Injectable } from '@nestjs/common';
import { Prisma, StatusAmizade, StatusContaUsuario } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UsuarioApelidoDuplicadoException,
  UsuarioApelidoNaoEncontradoException,
  UsuarioEmailNaoEncontradoException,
  UsuarioNaoEncontradoException,
} from 'src/common/exceptions/usuario.exception';
import {
  AmizadeAcaoNaoPermitidaException,
  AmizadeDestinoSolicitacaoInvalidoException,
  AmizadeJaExisteException,
  AmizadeNaoEncontradaException,
  AmizadeSelfException,
  AmizadeSolicitacaoDuplicadaException,
  AmizadeSolicitacaoNaoEncontradaException,
} from 'src/common/exceptions/amizade.exception';
import { PresencaService } from './presenca.service';

type UsuarioResumo = {
  id: number;
  apelido: string;
};

type CriarSolicitacaoDestino =
  | string
  | {
      identificador?: string | null;
      usuarioId?: number | null;
    };

type AmizadeComUsuarios = {
  id: number;
  usuarioAId: number;
  usuarioBId: number;
  solicitanteId: number;
  destinatarioId: number;
  status: StatusAmizade;
  criadoEm: Date;
  respondidoEm: Date | null;
  usuarioA: UsuarioResumo;
  usuarioB: UsuarioResumo;
  solicitante: UsuarioResumo;
  destinatario: UsuarioResumo;
};

const usuarioResumoSelect = {
  id: true,
  apelido: true,
} as const;

const amizadeIncludeUsuarios = {
  usuarioA: { select: usuarioResumoSelect },
  usuarioB: { select: usuarioResumoSelect },
  solicitante: { select: usuarioResumoSelect },
  destinatario: { select: usuarioResumoSelect },
} as const;

const usuarioAtivoVerificadoWhere = {
  emailVerificadoEm: { not: null },
  status: StatusContaUsuario.ATIVA,
} satisfies Prisma.UsuarioWhereInput;

@Injectable()
export class AmizadesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presencaService: PresencaService,
  ) {}

  private normalizarIdentificador(identificador: string): string {
    return identificador.trim();
  }

  private normalizarPar(usuarioId: number, outroUsuarioId: number) {
    return {
      usuarioAId: Math.min(usuarioId, outroUsuarioId),
      usuarioBId: Math.max(usuarioId, outroUsuarioId),
    };
  }

  private outroUsuario(amizade: AmizadeComUsuarios, usuarioId: number) {
    return amizade.usuarioAId === usuarioId
      ? amizade.usuarioB
      : amizade.usuarioA;
  }

  private mapearAmigo(amizade: AmizadeComUsuarios, usuarioId: number) {
    const usuario = this.outroUsuario(amizade, usuarioId);
    return {
      amizadeId: amizade.id,
      id: usuario.id,
      apelido: usuario.apelido,
      online: this.presencaService.estaOnline(usuario.id),
      desde: amizade.respondidoEm ?? amizade.criadoEm,
    };
  }

  private mapearSolicitacaoRecebida(amizade: AmizadeComUsuarios) {
    return {
      id: amizade.id,
      usuario: amizade.solicitante,
      status: amizade.status,
      criadoEm: amizade.criadoEm,
    };
  }

  private mapearSolicitacaoEnviada(amizade: AmizadeComUsuarios) {
    return {
      id: amizade.id,
      usuario: amizade.destinatario,
      status: amizade.status,
      criadoEm: amizade.criadoEm,
    };
  }

  async resolverUsuario(identificador: string): Promise<UsuarioResumo> {
    const valor = this.normalizarIdentificador(identificador);

    if (valor.includes('@')) {
      const usuario = await this.prisma.usuario.findUnique({
        where: {
          email: valor.toLowerCase(),
          AND: [usuarioAtivoVerificadoWhere],
        },
        select: usuarioResumoSelect,
      });

      if (!usuario) {
        throw new UsuarioEmailNaoEncontradoException(valor);
      }

      return usuario;
    }

    const usuarios = await this.prisma.usuario.findMany({
      where: {
        apelido: { equals: valor },
        ...usuarioAtivoVerificadoWhere,
      },
      select: usuarioResumoSelect,
      take: 2,
    });

    if (usuarios.length === 0) {
      throw new UsuarioApelidoNaoEncontradoException(valor);
    }

    if (usuarios.length > 1) {
      throw new UsuarioApelidoDuplicadoException(valor);
    }

    return usuarios[0];
  }

  private async resolverUsuarioPorId(
    usuarioId: number,
  ): Promise<UsuarioResumo> {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
        AND: [usuarioAtivoVerificadoWhere],
      },
      select: usuarioResumoSelect,
    });

    if (!usuario) {
      throw new UsuarioNaoEncontradoException(usuarioId);
    }

    return usuario;
  }

  private async resolverDestinoSolicitacao(
    destino: CriarSolicitacaoDestino,
  ): Promise<UsuarioResumo> {
    if (typeof destino === 'string') {
      return this.resolverUsuario(destino);
    }

    const identificador =
      typeof destino.identificador === 'string'
        ? this.normalizarIdentificador(destino.identificador)
        : '';
    const recebeuIdentificador = identificador.length > 0;
    const recebeuUsuarioId =
      destino.usuarioId !== undefined && destino.usuarioId !== null;
    const usuarioIdValido =
      typeof destino.usuarioId === 'number' &&
      Number.isInteger(destino.usuarioId) &&
      destino.usuarioId > 0;

    if (
      recebeuIdentificador === recebeuUsuarioId ||
      (recebeuUsuarioId && !usuarioIdValido)
    ) {
      throw new AmizadeDestinoSolicitacaoInvalidoException();
    }

    if (recebeuUsuarioId) {
      return this.resolverUsuarioPorId(destino.usuarioId as number);
    }

    return this.resolverUsuario(identificador);
  }

  async listarAmigos(usuarioId: number) {
    const amizades = await this.prisma.amizade.findMany({
      where: {
        status: StatusAmizade.ACEITA,
        OR: [
          {
            usuarioAId: usuarioId,
            usuarioB: usuarioAtivoVerificadoWhere,
          },
          {
            usuarioBId: usuarioId,
            usuarioA: usuarioAtivoVerificadoWhere,
          },
        ],
      },
      include: amizadeIncludeUsuarios,
      orderBy: { atualizadoEm: 'desc' },
    });

    return amizades
      .map((amizade) =>
        this.mapearAmigo(amizade as AmizadeComUsuarios, usuarioId),
      )
      .sort((a, b) => a.apelido.localeCompare(b.apelido, 'pt-BR'));
  }

  async listarAmigoIds(usuarioId: number): Promise<number[]> {
    const amizades = await this.prisma.amizade.findMany({
      where: {
        status: StatusAmizade.ACEITA,
        OR: [
          {
            usuarioAId: usuarioId,
            usuarioB: usuarioAtivoVerificadoWhere,
          },
          {
            usuarioBId: usuarioId,
            usuarioA: usuarioAtivoVerificadoWhere,
          },
        ],
      },
      select: { usuarioAId: true, usuarioBId: true },
    });

    return amizades
      .map((amizade) =>
        amizade.usuarioAId === usuarioId
          ? amizade.usuarioBId
          : amizade.usuarioAId,
      )
      .sort((a, b) => a - b);
  }

  async listarSolicitacoes(usuarioId: number) {
    const [recebidas, enviadas] = await Promise.all([
      this.prisma.amizade.findMany({
        where: {
          destinatarioId: usuarioId,
          solicitante: usuarioAtivoVerificadoWhere,
          status: StatusAmizade.PENDENTE,
        },
        include: amizadeIncludeUsuarios,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.amizade.findMany({
        where: {
          solicitanteId: usuarioId,
          destinatario: usuarioAtivoVerificadoWhere,
          status: StatusAmizade.PENDENTE,
        },
        include: amizadeIncludeUsuarios,
        orderBy: { criadoEm: 'desc' },
      }),
    ]);

    return {
      recebidas: recebidas.map((amizade) =>
        this.mapearSolicitacaoRecebida(amizade as AmizadeComUsuarios),
      ),
      enviadas: enviadas.map((amizade) =>
        this.mapearSolicitacaoEnviada(amizade as AmizadeComUsuarios),
      ),
    };
  }

  async criarSolicitacao(usuarioId: number, destino: CriarSolicitacaoDestino) {
    const destinatario = await this.resolverDestinoSolicitacao(destino);

    if (destinatario.id === usuarioId) {
      throw new AmizadeSelfException(usuarioId);
    }

    const par = this.normalizarPar(usuarioId, destinatario.id);
    const existente = await this.prisma.amizade.findUnique({
      where: { usuarioAId_usuarioBId: par },
    });

    if (existente?.status === StatusAmizade.PENDENTE) {
      throw new AmizadeSolicitacaoDuplicadaException(
        usuarioId,
        destinatario.id,
      );
    }

    if (existente?.status === StatusAmizade.ACEITA) {
      throw new AmizadeJaExisteException(usuarioId, destinatario.id);
    }

    if (existente) {
      return this.prisma.amizade.update({
        where: { id: existente.id },
        data: {
          solicitanteId: usuarioId,
          destinatarioId: destinatario.id,
          status: StatusAmizade.PENDENTE,
          respondidoEm: null,
        },
        include: amizadeIncludeUsuarios,
      });
    }

    return this.prisma.amizade.create({
      data: {
        ...par,
        solicitanteId: usuarioId,
        destinatarioId: destinatario.id,
      },
      include: amizadeIncludeUsuarios,
    });
  }

  async aceitarSolicitacao(usuarioId: number, amizadeId: number) {
    const amizade = await this.prisma.amizade.findUnique({
      where: { id: amizadeId },
    });

    if (!amizade || amizade.status !== StatusAmizade.PENDENTE) {
      throw new AmizadeSolicitacaoNaoEncontradaException(amizadeId);
    }

    if (amizade.destinatarioId !== usuarioId) {
      throw new AmizadeAcaoNaoPermitidaException('aceitar', amizadeId);
    }

    return this.prisma.amizade.update({
      where: { id: amizadeId },
      data: {
        status: StatusAmizade.ACEITA,
        respondidoEm: new Date(),
      },
      include: amizadeIncludeUsuarios,
    });
  }

  async recusarSolicitacao(usuarioId: number, amizadeId: number) {
    const amizade = await this.prisma.amizade.findUnique({
      where: { id: amizadeId },
    });

    if (!amizade || amizade.status !== StatusAmizade.PENDENTE) {
      throw new AmizadeSolicitacaoNaoEncontradaException(amizadeId);
    }

    if (amizade.destinatarioId !== usuarioId) {
      throw new AmizadeAcaoNaoPermitidaException('recusar', amizadeId);
    }

    return this.prisma.amizade.update({
      where: { id: amizadeId },
      data: {
        status: StatusAmizade.RECUSADA,
        respondidoEm: new Date(),
      },
    });
  }

  async cancelarSolicitacao(usuarioId: number, amizadeId: number) {
    const amizade = await this.prisma.amizade.findUnique({
      where: { id: amizadeId },
    });

    if (!amizade || amizade.status !== StatusAmizade.PENDENTE) {
      throw new AmizadeSolicitacaoNaoEncontradaException(amizadeId);
    }

    if (amizade.solicitanteId !== usuarioId) {
      throw new AmizadeAcaoNaoPermitidaException('cancelar', amizadeId);
    }

    return this.prisma.amizade.update({
      where: { id: amizadeId },
      data: {
        status: StatusAmizade.CANCELADA,
        respondidoEm: new Date(),
      },
    });
  }

  async removerAmizade(usuarioId: number, amigoId: number) {
    const par = this.normalizarPar(usuarioId, amigoId);
    const amizade = await this.prisma.amizade.findUnique({
      where: { usuarioAId_usuarioBId: par },
    });

    if (!amizade || amizade.status !== StatusAmizade.ACEITA) {
      throw new AmizadeNaoEncontradaException(amigoId);
    }

    return this.prisma.amizade.update({
      where: { id: amizade.id },
      data: {
        status: StatusAmizade.REMOVIDA,
        respondidoEm: new Date(),
      },
    });
  }
}
