import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { StatusAmizade } from '@prisma/client';
import { PresencaService } from 'src/amizades/presenca.service';
import { PrismaService } from 'src/prisma/prisma.service';

type UsuarioResumo = {
  id: number;
  apelido: string;
};

type MensagemResumo = {
  id: number;
  conversaId: number;
  autorId: number;
  conteudo: string;
  removidoEm: Date | null;
  criadoEm: Date;
};

type ConversaResumo = {
  id: number;
  usuarioAId: number;
  usuarioBId: number;
  atualizadoEm: Date;
};

const usuarioResumoSelect = {
  id: true,
  apelido: true,
} as const;

@Injectable()
export class ChatAmigosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presencaService: PresencaService,
  ) {}

  async listarConversas(usuarioId: number) {
    const amizades = await this.prisma.amizade.findMany({
      where: {
        status: StatusAmizade.ACEITA,
        OR: [{ usuarioAId: usuarioId }, { usuarioBId: usuarioId }],
      },
      include: {
        usuarioA: { select: usuarioResumoSelect },
        usuarioB: { select: usuarioResumoSelect },
      },
      orderBy: { atualizadoEm: 'desc' },
    });

    const conversas = await this.prisma.conversaAmizade.findMany({
      where: {
        OR: [{ usuarioAId: usuarioId }, { usuarioBId: usuarioId }],
      },
      include: {
        mensagens: {
          where: { removidoEm: null },
          orderBy: { id: 'desc' },
          take: 1,
        },
        leituras: {
          where: { usuarioId },
          take: 1,
        },
      },
    });

    const conversasPorAmigo = new Map<number, (typeof conversas)[number]>();
    for (const conversa of conversas) {
      const amigoId =
        conversa.usuarioAId === usuarioId
          ? conversa.usuarioBId
          : conversa.usuarioAId;
      conversasPorAmigo.set(amigoId, conversa);
    }

    const itens = await Promise.all(
      amizades.map(async (amizade) => {
        const amigo =
          amizade.usuarioAId === usuarioId
            ? amizade.usuarioB
            : amizade.usuarioA;
        const conversa = conversasPorAmigo.get(amigo.id);
        const leitura = conversa?.leituras[0];
        const naoLidas = conversa
          ? await this.contarNaoLidas(
              conversa.id,
              usuarioId,
              leitura?.lidaAteMensagemId ?? null,
            )
          : 0;

        return {
          amigo: this.mapearUsuario(amigo),
          conversaId: conversa?.id ?? null,
          ultimaMensagem: conversa?.mensagens[0]
            ? this.mapearMensagem(conversa.mensagens[0], conversa)
            : null,
          naoLidas,
          atualizadoEm:
            conversa?.atualizadoEm ?? amizade.respondidoEm ?? amizade.criadoEm,
          online: this.presencaService.estaOnline(amigo.id),
        };
      }),
    );

    return itens.sort((a, b) => {
      if (a.naoLidas !== b.naoLidas) return b.naoLidas - a.naoLidas;
      return (
        new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime()
      );
    });
  }

  async listarMensagens(
    usuarioId: number,
    amigoId: number,
    params: { cursor?: number; limit?: number },
  ) {
    await this.garantirAmizadeAceita(usuarioId, amigoId);
    const conversa = await this.obterConversa(usuarioId, amigoId);
    if (!conversa) {
      return { itens: [], nextCursor: null };
    }

    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);
    const mensagens = await this.prisma.mensagemAmizade.findMany({
      where: {
        conversaId: conversa.id,
        removidoEm: null,
        ...(params.cursor ? { id: { lt: params.cursor } } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
    });

    const pagina = mensagens.slice(0, limit);
    const nextCursor =
      mensagens.length > limit && pagina.length > 0
        ? pagina[pagina.length - 1].id
        : null;

    return {
      itens: pagina
        .reverse()
        .map((mensagem) => this.mapearMensagem(mensagem, conversa)),
      nextCursor,
    };
  }

  async enviarMensagem(usuarioId: number, amigoId: number, conteudo: string) {
    const texto = conteudo.trim();
    if (!texto) {
      throw new BadRequestException('Mensagem vazia.');
    }

    await this.garantirAmizadeAceita(usuarioId, amigoId);
    const conversa = await this.obterOuCriarConversa(usuarioId, amigoId);

    const mensagem = await this.prisma.mensagemAmizade.create({
      data: {
        conversaId: conversa.id,
        autorId: usuarioId,
        conteudo: texto,
      },
    });

    await this.marcarMensagemComoLida(conversa.id, usuarioId, mensagem.id);

    return {
      conversa: this.mapearConversa(conversa),
      mensagem: this.mapearMensagem(mensagem, conversa),
    };
  }

  async marcarComoLida(usuarioId: number, amigoId: number) {
    await this.garantirAmizadeAceita(usuarioId, amigoId);
    const conversa = await this.obterConversa(usuarioId, amigoId);
    if (!conversa) {
      return { ok: true, conversaId: null, lidaAteMensagemId: null };
    }

    const ultimaMensagem = await this.prisma.mensagemAmizade.findFirst({
      where: { conversaId: conversa.id, removidoEm: null },
      orderBy: { id: 'desc' },
      select: { id: true },
    });

    await this.marcarMensagemComoLida(
      conversa.id,
      usuarioId,
      ultimaMensagem?.id ?? null,
    );

    return {
      ok: true,
      conversaId: conversa.id,
      lidaAteMensagemId: ultimaMensagem?.id ?? null,
      amigoId,
    };
  }

  private normalizarPar(usuarioId: number, amigoId: number) {
    return {
      usuarioAId: Math.min(usuarioId, amigoId),
      usuarioBId: Math.max(usuarioId, amigoId),
    };
  }

  private async garantirAmizadeAceita(usuarioId: number, amigoId: number) {
    if (usuarioId === amigoId) {
      throw new BadRequestException('Não e possível conversar consigo mesmo.');
    }

    const amizade = await this.prisma.amizade.findUnique({
      where: { usuarioAId_usuarioBId: this.normalizarPar(usuarioId, amigoId) },
      select: { status: true },
    });

    if (!amizade || amizade.status !== StatusAmizade.ACEITA) {
      throw new ForbiddenException('Conversa disponível apenas entre amigos.');
    }
  }

  private async obterConversa(usuarioId: number, amigoId: number) {
    return this.prisma.conversaAmizade.findUnique({
      where: { usuarioAId_usuarioBId: this.normalizarPar(usuarioId, amigoId) },
    });
  }

  private async obterOuCriarConversa(usuarioId: number, amigoId: number) {
    const par = this.normalizarPar(usuarioId, amigoId);
    return this.prisma.conversaAmizade.upsert({
      where: { usuarioAId_usuarioBId: par },
      update: {},
      create: par,
    });
  }

  private async marcarMensagemComoLida(
    conversaId: number,
    usuarioId: number,
    mensagemId: number | null,
  ) {
    await this.prisma.leituraConversaAmizade.upsert({
      where: { conversaId_usuarioId: { conversaId, usuarioId } },
      update: {
        lidaAteMensagemId: mensagemId,
        lidaEm: new Date(),
      },
      create: {
        conversaId,
        usuarioId,
        lidaAteMensagemId: mensagemId,
        lidaEm: new Date(),
      },
    });
  }

  private contarNaoLidas(
    conversaId: number,
    usuarioId: number,
    lidaAteMensagemId: number | null,
  ) {
    return this.prisma.mensagemAmizade.count({
      where: {
        conversaId,
        autorId: { not: usuarioId },
        removidoEm: null,
        ...(lidaAteMensagemId ? { id: { gt: lidaAteMensagemId } } : {}),
      },
    });
  }

  private mapearUsuario(usuario: UsuarioResumo) {
    return {
      id: usuario.id,
      apelido: usuario.apelido,
    };
  }

  private mapearConversa(conversa: ConversaResumo) {
    return {
      id: conversa.id,
      usuarioAId: conversa.usuarioAId,
      usuarioBId: conversa.usuarioBId,
      atualizadoEm: conversa.atualizadoEm,
    };
  }

  private mapearMensagem(
    mensagem: MensagemResumo,
    conversa: { usuarioAId: number; usuarioBId: number },
  ) {
    return {
      id: mensagem.id,
      conversaId: mensagem.conversaId,
      autorId: mensagem.autorId,
      destinatarioId:
        mensagem.autorId === conversa.usuarioAId
          ? conversa.usuarioBId
          : conversa.usuarioAId,
      conteudo: mensagem.removidoEm ? '' : mensagem.conteudo,
      removidoEm: mensagem.removidoEm,
      criadoEm: mensagem.criadoEm,
    };
  }
}
