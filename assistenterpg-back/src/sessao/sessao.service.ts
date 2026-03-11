import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CampanhaAcessoNegadoException,
  CampanhaApenasMestreException,
  CampanhaNaoEncontradaException,
  NpcSessaoNaoEncontradoException,
  SessaoCampanhaNaoEncontradaException,
  SessaoTurnoIndisponivelEmCenaLivreException,
  UsuarioNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import { NpcAmeacaNaoEncontradaException } from 'src/common/exceptions/npc-ameaca.exception';
import { CreateSessaoCampanhaDto } from './dto/create-sessao-campanha.dto';
import { AtualizarCenaSessaoDto } from './dto/atualizar-cena-sessao.dto';
import { AdicionarNpcSessaoDto } from './dto/adicionar-npc-sessao.dto';
import { AtualizarNpcSessaoDto } from './dto/atualizar-npc-sessao.dto';

type AcessoCampanha = {
  campanha: {
    id: number;
    donoId: number;
    membros: Array<{
      usuarioId: number;
      papel: string;
    }>;
  };
  ehDono: boolean;
  ehMestre: boolean;
};

type EventoChatMapeado = {
  id: number;
  criadoEm: Date;
  mensagem: string;
  autor: {
    usuarioId: number | null;
    apelido: string;
    personagemNome: string | null;
  };
};

@Injectable()
export class SessaoService {
  constructor(private readonly prisma: PrismaService) {}

  async listarSessoesCampanha(campanhaId: number, usuarioId: number) {
    await this.obterAcessoCampanha(campanhaId, usuarioId);

    const sessoes = await this.prisma.sessao.findMany({
      where: { campanhaId },
      orderBy: { iniciadoEm: 'desc' },
      include: {
        _count: {
          select: {
            personagens: true,
            eventos: true,
          },
        },
      },
    });

    return sessoes.map((sessao) => {
      const controleTurnosAtivo = sessao.cenaAtualTipo !== 'LIVRE';

      return {
        id: sessao.id,
        campanhaId: sessao.campanhaId,
        titulo: sessao.titulo,
        status: sessao.status,
        rodadaAtual: controleTurnosAtivo ? sessao.rodadaAtual : null,
        indiceTurnoAtual: controleTurnosAtivo ? sessao.indiceTurnoAtual : null,
        cenaAtualTipo: sessao.cenaAtualTipo,
        cenaAtualNome: sessao.cenaAtualNome,
        controleTurnosAtivo,
        iniciadoEm: sessao.iniciadoEm,
        encerradoEm: sessao.encerradoEm,
        totalPersonagens: sessao._count.personagens,
        totalEventos: sessao._count.eventos,
      };
    });
  }

  async criarSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    dto: CreateSessaoCampanhaDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'iniciar sessao');

    const titulo =
      dto.titulo?.trim() || `Sessao ${new Date().toLocaleDateString('pt-BR')}`;

    const sessaoCriada = await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.create({
        data: {
          campanhaId,
          titulo,
        },
      });

      const cenaInicial = await tx.cena.create({
        data: {
          sessaoId: sessao.id,
        },
      });

      const personagensCampanha = await tx.personagemCampanha.findMany({
        where: {
          campanhaId,
        },
        select: {
          id: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      if (personagensCampanha.length > 0) {
        await tx.personagemSessao.createMany({
          data: personagensCampanha.map((personagem) => ({
            sessaoId: sessao.id,
            cenaId: cenaInicial.id,
            personagemCampanhaId: personagem.id,
          })),
        });
      }

      await tx.eventoSessao.create({
        data: {
          sessaoId: sessao.id,
          cenaId: cenaInicial.id,
          tipoEvento: 'SESSAO_INICIADA',
          dados: {
            titulo,
            iniciadoPorId: usuarioId,
          },
        },
      });

      return sessao;
    });

    return this.buscarDetalheSessao(campanhaId, sessaoCriada.id, usuarioId);
  }

  async encerrarSessaoCampanha(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'encerrar sessao');

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        select: {
          id: true,
          campanhaId: true,
          status: true,
          cenas: {
            select: { id: true },
            orderBy: { id: 'desc' },
            take: 1,
          },
        },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      if (sessao.status === 'ENCERRADA') {
        return;
      }

      await tx.sessao.update({
        where: { id: sessaoId },
        data: {
          status: 'ENCERRADA',
          encerradoEm: new Date(),
        },
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: sessao.cenas[0]?.id ?? null,
          tipoEvento: 'SESSAO_ENCERRADA',
          dados: {
            encerradoPorId: usuarioId,
          },
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async buscarDetalheSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    const sessao = await this.prisma.sessao.findUnique({
      where: { id: sessaoId },
      include: {
        cenas: {
          select: {
            id: true,
          },
          orderBy: {
            id: 'desc',
          },
          take: 1,
        },
        personagens: {
          orderBy: { id: 'asc' },
          include: {
            personagemCampanha: {
              select: {
                id: true,
                personagemBaseId: true,
                nome: true,
                donoId: true,
                pvAtual: true,
                pvMax: true,
                peAtual: true,
                peMax: true,
                eaAtual: true,
                eaMax: true,
                sanAtual: true,
                sanMax: true,
                dono: {
                  select: {
                    id: true,
                    apelido: true,
                  },
                },
              },
            },
          },
        },
        npcs: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!sessao || sessao.campanhaId !== campanhaId) {
      throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
    }

    const personagensOrdenados = sessao.personagens;
    const cenaAtualId = sessao.cenas[0]?.id ?? null;
    const totalPersonagens = personagensOrdenados.length;
    const controleTurnosAtivo = sessao.cenaAtualTipo !== 'LIVRE';
    const indiceTurno = controleTurnosAtivo
      ? this.clampIndiceTurno(sessao.indiceTurnoAtual, totalPersonagens)
      : null;
    const personagemTurnoAtual =
      controleTurnosAtivo && totalPersonagens > 0 && indiceTurno !== null
        ? personagensOrdenados[indiceTurno]
        : null;

    return {
      id: sessao.id,
      campanhaId: sessao.campanhaId,
      titulo: sessao.titulo,
      status: sessao.status,
      rodadaAtual: controleTurnosAtivo ? sessao.rodadaAtual : null,
      indiceTurnoAtual: controleTurnosAtivo ? indiceTurno : null,
      cenaAtual: {
        id: cenaAtualId,
        tipo: sessao.cenaAtualTipo,
        nome: sessao.cenaAtualNome,
        controleTurnosAtivo,
      },
      controleTurnosAtivo,
      turnoAtual: personagemTurnoAtual
        ? {
            personagemSessaoId: personagemTurnoAtual.id,
            personagemCampanhaId: personagemTurnoAtual.personagemCampanha.id,
            donoId: personagemTurnoAtual.personagemCampanha.donoId,
            nomeJogador: personagemTurnoAtual.personagemCampanha.dono.apelido,
            nomePersonagem: personagemTurnoAtual.personagemCampanha.nome,
          }
        : null,
      permissoes: {
        ehMestre: acesso.ehMestre,
        podeEditarTodos: acesso.ehMestre,
      },
      cards: personagensOrdenados.map((personagem) => {
        const podeEditar =
          acesso.ehMestre || personagem.personagemCampanha.donoId === usuarioId;
        const visibilidade = podeEditar ? 'completa' : 'resumida';

        return {
          personagemSessaoId: personagem.id,
          personagemCampanhaId: personagem.personagemCampanha.id,
          personagemBaseId: personagem.personagemCampanha.personagemBaseId,
          donoId: personagem.personagemCampanha.donoId,
          nomeJogador: personagem.personagemCampanha.dono.apelido,
          nomePersonagem: personagem.personagemCampanha.nome,
          podeEditar,
          visibilidade,
          recursos:
            visibilidade === 'completa'
              ? {
                  pvAtual: personagem.personagemCampanha.pvAtual,
                  pvMax: personagem.personagemCampanha.pvMax,
                  peAtual: personagem.personagemCampanha.peAtual,
                  peMax: personagem.personagemCampanha.peMax,
                  eaAtual: personagem.personagemCampanha.eaAtual,
                  eaMax: personagem.personagemCampanha.eaMax,
                  sanAtual: personagem.personagemCampanha.sanAtual,
                  sanMax: personagem.personagemCampanha.sanMax,
                }
              : null,
        };
      }),
      npcs: sessao.npcs
        .filter((npc) => npc.cenaId === cenaAtualId)
        .map((npc) => ({
          npcSessaoId: npc.id,
          npcAmeacaId: npc.npcAmeacaId,
          nome: npc.nomeExibicao,
          fichaTipo: npc.fichaTipo,
          tipo: npc.tipo,
          vd: npc.vd,
          defesa: npc.defesa,
          pontosVidaAtual: npc.pontosVidaAtual,
          pontosVidaMax: npc.pontosVidaMax,
          machucado: npc.machucado,
          deslocamentoMetros: npc.deslocamentoMetros,
          notasCena: npc.notasCena,
          passivas: this.mapearListaObjeto(npc.passivasGuia),
          acoes: this.mapearListaObjeto(npc.acoesGuia),
          podeEditar: acesso.ehMestre,
        })),
      iniciadoEm: sessao.iniciadoEm,
      encerradoEm: sessao.encerradoEm,
    };
  }

  async listarChatSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    afterId?: number,
  ) {
    await this.obterSessaoComAcesso(campanhaId, sessaoId, usuarioId);

    const eventos = await this.prisma.eventoSessao.findMany({
      where: {
        sessaoId,
        tipoEvento: 'CHAT',
        ...(afterId ? { id: { gt: afterId } } : {}),
      },
      include: {
        personagemAtor: {
          include: {
            personagemCampanha: {
              select: {
                nome: true,
                donoId: true,
                dono: {
                  select: {
                    apelido: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
      take: 150,
    });

    return eventos.map((evento) => this.mapearEventoChat(evento));
  }

  async enviarMensagemChatSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    mensagem: string,
  ) {
    await this.obterSessaoComAcesso(campanhaId, sessaoId, usuarioId);

    const mensagemLimpa = mensagem.trim();

    const personagemDoUsuario = await this.prisma.personagemSessao.findFirst({
      where: {
        sessaoId,
        personagemCampanha: {
          donoId: usuarioId,
        },
      },
      include: {
        personagemCampanha: {
          select: {
            nome: true,
            donoId: true,
            dono: {
              select: {
                apelido: true,
              },
            },
          },
        },
      },
    });

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { apelido: true },
    });

    if (!usuario) {
      throw new UsuarioNaoEncontradoException(usuarioId);
    }

    const evento = await this.prisma.eventoSessao.create({
      data: {
        sessaoId,
        tipoEvento: 'CHAT',
        personagemAtorId: personagemDoUsuario?.id ?? null,
        dados: {
          mensagem: mensagemLimpa,
          autorApelido: personagemDoUsuario
            ? personagemDoUsuario.personagemCampanha.dono.apelido
            : usuario.apelido,
        },
      },
      include: {
        personagemAtor: {
          include: {
            personagemCampanha: {
              select: {
                nome: true,
                donoId: true,
                dono: {
                  select: {
                    apelido: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapearEventoChat(evento);
  }

  async avancarTurnoSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'avancar turno');

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      if (sessao.cenaAtualTipo === 'LIVRE') {
        throw new SessaoTurnoIndisponivelEmCenaLivreException(
          sessaoId,
          campanhaId,
        );
      }

      const personagens = await tx.personagemSessao.findMany({
        where: { sessaoId },
        orderBy: { id: 'asc' },
        select: {
          id: true,
        },
      });

      if (personagens.length === 0) return;

      const indiceAnterior = this.clampIndiceTurno(
        sessao.indiceTurnoAtual,
        personagens.length,
      );
      const indiceNovo = (indiceAnterior + 1) % personagens.length;
      const rodadaNova = sessao.rodadaAtual + (indiceNovo === 0 ? 1 : 0);

      await tx.sessao.update({
        where: { id: sessaoId },
        data: {
          indiceTurnoAtual: indiceNovo,
          rodadaAtual: rodadaNova,
        },
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          tipoEvento: 'TURNO_AVANCADO',
          dados: {
            indiceAnterior,
            indiceNovo,
            rodadaNova,
            avancadoPorId: usuarioId,
          },
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async atualizarCenaSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    dto: AtualizarCenaSessaoDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'alterar cena');

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      const cena = await tx.cena.create({
        data: {
          sessaoId,
        },
      });

      await tx.personagemSessao.updateMany({
        where: { sessaoId },
        data: { cenaId: cena.id },
      });

      await tx.sessao.update({
        where: { id: sessaoId },
        data: {
          cenaAtualTipo: dto.tipo,
          cenaAtualNome: dto.nome?.trim() || null,
          rodadaAtual: dto.tipo === 'LIVRE' ? 1 : sessao.rodadaAtual,
          indiceTurnoAtual: dto.tipo === 'LIVRE' ? 0 : sessao.indiceTurnoAtual,
        },
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: cena.id,
          tipoEvento: 'CENA_ATUALIZADA',
          dados: {
            tipo: dto.tipo,
            nome: dto.nome?.trim() || null,
            atualizadoPorId: usuarioId,
          },
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async adicionarNpcSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    dto: AdicionarNpcSessaoDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'adicionar NPC/Ameaca na cena');

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        select: {
          id: true,
          campanhaId: true,
        },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      const npcBase = await tx.npcAmeaca.findFirst({
        where: {
          id: dto.npcAmeacaId,
          donoId: usuarioId,
        },
      });

      if (!npcBase) {
        throw new NpcAmeacaNaoEncontradaException(dto.npcAmeacaId);
      }

      const cenaAtual = await this.obterCenaAtualSessaoTx(tx, sessaoId);
      const pontosVidaMax = dto.pontosVidaMax ?? npcBase.pontosVida;
      const pontosVidaAtual = this.clampNumero(
        dto.pontosVidaAtual ?? pontosVidaMax,
        0,
        pontosVidaMax,
      );
      const nomeExibicao = dto.nomeExibicao?.trim() || npcBase.nome;
      const notasCena = dto.notasCena?.trim() || null;

      const npcSessao = await tx.npcAmeacaSessao.create({
        data: {
          sessaoId,
          cenaId: cenaAtual.id,
          npcAmeacaId: npcBase.id,
          nomeExibicao,
          fichaTipo: npcBase.fichaTipo,
          tipo: npcBase.tipo,
          vd: dto.vd ?? npcBase.vd,
          defesa: dto.defesa ?? npcBase.defesa,
          pontosVidaAtual,
          pontosVidaMax,
          machucado:
            dto.machucado === undefined ? npcBase.machucado : dto.machucado,
          deslocamentoMetros: dto.deslocamentoMetros ?? npcBase.deslocamentoMetros,
          passivasGuia: this.jsonParaPersistencia(npcBase.passivas),
          acoesGuia: this.jsonParaPersistencia(npcBase.acoes),
          notasCena,
        },
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: cenaAtual.id,
          tipoEvento: 'NPC_ADICIONADO',
          dados: {
            npcSessaoId: npcSessao.id,
            npcAmeacaId: npcBase.id,
            nome: npcSessao.nomeExibicao,
            adicionadoPorId: usuarioId,
          },
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async atualizarNpcSessao(
    campanhaId: number,
    sessaoId: number,
    npcSessaoId: number,
    usuarioId: number,
    dto: AtualizarNpcSessaoDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'editar NPC/Ameaca da cena');

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        select: {
          id: true,
          campanhaId: true,
        },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      const npcSessaoAtual = await tx.npcAmeacaSessao.findFirst({
        where: {
          id: npcSessaoId,
          sessaoId,
        },
      });

      if (!npcSessaoAtual) {
        throw new NpcSessaoNaoEncontradoException(
          npcSessaoId,
          sessaoId,
          campanhaId,
        );
      }

      const pontosVidaMax = dto.pontosVidaMax ?? npcSessaoAtual.pontosVidaMax;
      const pontosVidaAtual = this.clampNumero(
        dto.pontosVidaAtual ?? npcSessaoAtual.pontosVidaAtual,
        0,
        pontosVidaMax,
      );

      const data: Prisma.NpcAmeacaSessaoUpdateInput = {
        pontosVidaMax,
        pontosVidaAtual,
      };

      if (dto.nomeExibicao !== undefined) {
        data.nomeExibicao = dto.nomeExibicao.trim() || npcSessaoAtual.nomeExibicao;
      }
      if (dto.vd !== undefined) data.vd = dto.vd;
      if (dto.defesa !== undefined) data.defesa = dto.defesa;
      if (dto.machucado !== undefined) data.machucado = dto.machucado;
      if (dto.deslocamentoMetros !== undefined) {
        data.deslocamentoMetros = dto.deslocamentoMetros;
      }
      if (dto.notasCena !== undefined) {
        data.notasCena = dto.notasCena.trim() || null;
      }

      await tx.npcAmeacaSessao.update({
        where: {
          id: npcSessaoId,
        },
        data,
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: npcSessaoAtual.cenaId,
          tipoEvento: 'NPC_ATUALIZADO',
          dados: {
            npcSessaoId,
            atualizadoPorId: usuarioId,
          },
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async removerNpcSessao(
    campanhaId: number,
    sessaoId: number,
    npcSessaoId: number,
    usuarioId: number,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'remover NPC/Ameaca da cena');

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        select: {
          id: true,
          campanhaId: true,
        },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      const npcSessaoAtual = await tx.npcAmeacaSessao.findFirst({
        where: {
          id: npcSessaoId,
          sessaoId,
        },
      });

      if (!npcSessaoAtual) {
        throw new NpcSessaoNaoEncontradoException(
          npcSessaoId,
          sessaoId,
          campanhaId,
        );
      }

      await tx.npcAmeacaSessao.delete({
        where: {
          id: npcSessaoId,
        },
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: npcSessaoAtual.cenaId,
          tipoEvento: 'NPC_REMOVIDO',
          dados: {
            npcSessaoId,
            nome: npcSessaoAtual.nomeExibicao,
            removidoPorId: usuarioId,
          },
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  private async obterAcessoCampanha(
    campanhaId: number,
    usuarioId: number,
  ): Promise<AcessoCampanha> {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: {
        id: true,
        donoId: true,
        membros: {
          select: {
            usuarioId: true,
            papel: true,
          },
        },
      },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    const ehDono = campanha.donoId === usuarioId;
    const membroAtual = campanha.membros.find((m) => m.usuarioId === usuarioId);

    if (!ehDono && !membroAtual) {
      throw new CampanhaAcessoNegadoException(campanhaId, usuarioId);
    }

    const ehMestre = ehDono || membroAtual?.papel === 'MESTRE';

    return {
      campanha,
      ehDono,
      ehMestre,
    };
  }

  private async obterSessaoComAcesso(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    const sessao = await this.prisma.sessao.findUnique({
      where: { id: sessaoId },
      select: {
        id: true,
        campanhaId: true,
      },
    });

    if (!sessao || sessao.campanhaId !== campanhaId) {
      throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
    }

    return {
      acesso,
      sessao,
    };
  }

  private async obterCenaAtualSessaoTx(
    tx: Prisma.TransactionClient,
    sessaoId: number,
  ): Promise<{ id: number }> {
    const cenaAtual = await tx.cena.findFirst({
      where: { sessaoId },
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
      },
    });

    if (cenaAtual) {
      return cenaAtual;
    }

    return tx.cena.create({
      data: { sessaoId },
      select: {
        id: true,
      },
    });
  }

  private assertMestre(acesso: AcessoCampanha, acao: string): void {
    if (!acesso.ehMestre) {
      throw new CampanhaApenasMestreException(acao);
    }
  }

  private clampNumero(valor: number, min: number, max: number): number {
    if (valor < min) return min;
    if (valor > max) return max;
    return valor;
  }

  private clampIndiceTurno(indice: number, totalPersonagens: number): number {
    if (totalPersonagens <= 0) return 0;
    if (indice < 0) return 0;
    if (indice >= totalPersonagens) return totalPersonagens - 1;
    return indice;
  }

  private mapearListaObjeto(valor: Prisma.JsonValue | null): Prisma.JsonObject[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter(
      (item): item is Prisma.JsonObject =>
        !!item && typeof item === 'object' && !Array.isArray(item),
    );
  }

  private jsonParaPersistencia(
    valor: Prisma.JsonValue | null,
  ): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    if (valor === null) return Prisma.JsonNull;
    return valor as Prisma.InputJsonValue;
  }

  private mapearEventoChat(
    evento: Prisma.EventoSessaoGetPayload<{
      include: {
        personagemAtor: {
          include: {
            personagemCampanha: {
              select: {
                nome: true;
                donoId: true;
                dono: {
                  select: {
                    apelido: true;
                  };
                };
              };
            };
          };
        };
      };
    }>,
  ): EventoChatMapeado {
    const dados = (evento.dados ?? {}) as Record<string, unknown>;
    const mensagem = typeof dados.mensagem === 'string' ? dados.mensagem : '';
    const apelidoFallback =
      typeof dados.autorApelido === 'string' ? dados.autorApelido : 'Sistema';

    if (!evento.personagemAtor) {
      return {
        id: evento.id,
        criadoEm: evento.criadoEm,
        mensagem,
        autor: {
          usuarioId: null,
          apelido: apelidoFallback,
          personagemNome: null,
        },
      };
    }

    return {
      id: evento.id,
      criadoEm: evento.criadoEm,
      mensagem,
      autor: {
        usuarioId: evento.personagemAtor.personagemCampanha.donoId,
        apelido: evento.personagemAtor.personagemCampanha.dono.apelido,
        personagemNome: evento.personagemAtor.personagemCampanha.nome,
      },
    };
  }
}
