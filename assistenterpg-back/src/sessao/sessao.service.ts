import { Injectable } from '@nestjs/common';
import { Prisma, TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CampanhaAcessoNegadoException,
  CampanhaApenasMestreException,
  CampanhaNaoEncontradaException,
  NpcSessaoNaoEncontradoException,
  SessaoEventoDesfazerNaoPermitidoException,
  SessaoEventoNaoEncontradoException,
  SessaoCampanhaNaoEncontradaException,
  SessaoTurnoIndisponivelEmCenaLivreException,
  UsuarioNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import { NpcAmeacaNaoEncontradaException } from 'src/common/exceptions/npc-ameaca.exception';
import { CreateSessaoCampanhaDto } from './dto/create-sessao-campanha.dto';
import { AtualizarCenaSessaoDto } from './dto/atualizar-cena-sessao.dto';
import { AdicionarNpcSessaoDto } from './dto/adicionar-npc-sessao.dto';
import { AtualizarNpcSessaoDto } from './dto/atualizar-npc-sessao.dto';
import { ListarEventosSessaoDto } from './dto/listar-eventos-sessao.dto';

type AcessoCampanha = {
  campanha: {
    id: number;
    donoId: number;
    dono: {
      id: number;
      apelido: string;
    };
    membros: Array<{
      usuarioId: number;
      papel: string;
      usuario: {
        id: number;
        apelido: string;
      };
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

type EventoSessaoMapeado = {
  id: number;
  sessaoId: number;
  cenaId: number | null;
  criadoEm: Date;
  tipoEvento: string;
  descricao: string;
  desfeito: boolean;
  podeDesfazer: boolean;
  dados: Prisma.JsonValue | null;
  autor: {
    usuarioId: number | null;
    apelido: string;
    personagemNome: string | null;
  } | null;
};

type SnapshotNpcSessao = {
  npcAmeacaId: number | null;
  nomeExibicao: string;
  fichaTipo: TipoFichaNpcAmeaca;
  tipo: TipoNpcAmeaca;
  vd: number;
  defesa: number;
  pontosVidaAtual: number;
  pontosVidaMax: number;
  machucado: number | null;
  deslocamentoMetros: number;
  passivasGuia: Prisma.JsonValue | null;
  acoesGuia: Prisma.JsonValue | null;
  notasCena: string | null;
  cenaId: number | null;
};

const TIPOS_EVENTO_REVERSIVEIS = new Set<string>([
  'TURNO_AVANCADO',
  'CENA_ATUALIZADA',
  'NPC_ADICIONADO',
  'NPC_ATUALIZADO',
  'NPC_REMOVIDO',
]);

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
      participantes: this.mapearParticipantesCampanha(acesso.campanha),
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

  async listarEventosSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    query: ListarEventosSessaoDto,
  ) {
    const { acesso } = await this.obterSessaoComAcesso(campanhaId, sessaoId, usuarioId);
    const limit = query.limit ?? 80;
    const incluirChat = query.incluirChat === true;

    const eventos = await this.prisma.eventoSessao.findMany({
      where: {
        sessaoId,
        ...(incluirChat ? {} : { tipoEvento: { not: 'CHAT' } }),
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
      orderBy: { id: 'desc' },
      take: limit,
    });

    const ultimoEventoReversivel = acesso.ehMestre
      ? await this.obterUltimoEventoReversivelDisponivel(this.prisma, sessaoId)
      : null;

    return eventos.map((evento) =>
      this.mapearEventoSessao(
        evento,
        acesso.ehMestre && evento.id === ultimoEventoReversivel?.id,
      ),
    );
  }

  async desfazerEventoSessao(
    campanhaId: number,
    sessaoId: number,
    eventoId: number,
    usuarioId: number,
    motivo?: string,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'desfazer evento da sessao');

    const motivoLimpo = motivo?.trim() || null;

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        select: {
          id: true,
          campanhaId: true,
          status: true,
        },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      const evento = await tx.eventoSessao.findFirst({
        where: {
          id: eventoId,
          sessaoId,
        },
      });

      if (!evento) {
        throw new SessaoEventoNaoEncontradoException(eventoId, sessaoId, campanhaId);
      }

      if (!TIPOS_EVENTO_REVERSIVEIS.has(evento.tipoEvento)) {
        throw new SessaoEventoDesfazerNaoPermitidoException(
          eventoId,
          sessaoId,
          evento.tipoEvento,
        );
      }

      if (this.eventoJaFoiDesfeito(evento.dados)) {
        throw new SessaoEventoDesfazerNaoPermitidoException(
          eventoId,
          sessaoId,
          evento.tipoEvento,
        );
      }

      const ultimoEventoReversivel = await this.obterUltimoEventoReversivelDisponivel(
        tx,
        sessaoId,
      );

      if (!ultimoEventoReversivel || ultimoEventoReversivel.id !== eventoId) {
        throw new SessaoEventoDesfazerNaoPermitidoException(
          eventoId,
          sessaoId,
          evento.tipoEvento,
        );
      }

      if (sessao.status === 'ENCERRADA') {
        throw new SessaoEventoDesfazerNaoPermitidoException(
          eventoId,
          sessaoId,
          evento.tipoEvento,
        );
      }

      const dadosEvento = this.extrairRegistro(evento.dados);

      switch (evento.tipoEvento) {
        case 'TURNO_AVANCADO': {
          const indiceAnterior = this.lerInteiroRegistro(
            dadosEvento,
            'indiceAnterior',
          );
          const indiceNovo = this.lerInteiroRegistro(dadosEvento, 'indiceNovo');
          const rodadaNova = this.lerInteiroRegistro(dadosEvento, 'rodadaNova');
          const rodadaAnteriorInformada = this.lerInteiroOpcionalRegistro(
            dadosEvento,
            'rodadaAnterior',
          );
          if (
            indiceAnterior === null ||
            indiceNovo === null ||
            rodadaNova === null
          ) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }
          const rodadaAnterior =
            rodadaAnteriorInformada ??
            Math.max(1, rodadaNova - (indiceNovo === 0 ? 1 : 0));

          await tx.sessao.update({
            where: { id: sessaoId },
            data: {
              indiceTurnoAtual: indiceAnterior,
              rodadaAtual: rodadaAnterior,
            },
          });

          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: evento.cenaId,
              tipoEvento: 'TURNO_DESFEITO',
              dados: {
                eventoOriginalId: evento.id,
                indiceAnterior,
                indiceNovo,
                rodadaAnterior,
                rodadaNova,
                desfeitoPorId: usuarioId,
                motivo: motivoLimpo,
              },
            },
          });
          break;
        }
        case 'CENA_ATUALIZADA': {
          const cenaAnteriorId = this.lerInteiroRegistro(dadosEvento, 'cenaAnteriorId');
          const tipoAnterior = this.lerTextoRegistro(dadosEvento, 'tipoAnterior');
          const nomeAnterior = this.lerTextoOpcionalRegistro(
            dadosEvento,
            'nomeAnterior',
          );
          const rodadaAnterior = this.lerInteiroRegistro(dadosEvento, 'rodadaAnterior');
          const indiceTurnoAnterior = this.lerInteiroRegistro(
            dadosEvento,
            'indiceTurnoAnterior',
          );
          if (
            cenaAnteriorId === null ||
            tipoAnterior === null ||
            rodadaAnterior === null ||
            indiceTurnoAnterior === null
          ) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          const cenaAnteriorExiste = await tx.cena.findFirst({
            where: {
              id: cenaAnteriorId,
              sessaoId,
            },
            select: {
              id: true,
            },
          });

          if (!cenaAnteriorExiste) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          await tx.personagemSessao.updateMany({
            where: { sessaoId },
            data: { cenaId: cenaAnteriorId },
          });

          await tx.sessao.update({
            where: { id: sessaoId },
            data: {
              cenaAtualTipo: tipoAnterior,
              cenaAtualNome: nomeAnterior,
              rodadaAtual: rodadaAnterior,
              indiceTurnoAtual: indiceTurnoAnterior,
            },
          });

          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: cenaAnteriorId,
              tipoEvento: 'CENA_DESFEITA',
              dados: {
                eventoOriginalId: evento.id,
                cenaAnteriorId,
                tipoAnterior,
                nomeAnterior,
                desfeitoPorId: usuarioId,
                motivo: motivoLimpo,
              },
            },
          });
          break;
        }
        case 'NPC_ADICIONADO': {
          const npcSessaoId = this.lerInteiroRegistro(dadosEvento, 'npcSessaoId');
          if (npcSessaoId === null) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }
          const npcSessaoAtual = await tx.npcAmeacaSessao.findFirst({
            where: {
              id: npcSessaoId,
              sessaoId,
            },
          });

          if (!npcSessaoAtual) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
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
              tipoEvento: 'NPC_ADICAO_DESFEITA',
              dados: {
                eventoOriginalId: evento.id,
                npcSessaoId,
                nome: npcSessaoAtual.nomeExibicao,
                desfeitoPorId: usuarioId,
                motivo: motivoLimpo,
              },
            },
          });
          break;
        }
        case 'NPC_ATUALIZADO': {
          const npcSessaoId = this.lerInteiroRegistro(dadosEvento, 'npcSessaoId');
          const anterior = this.lerRegistroOpcionalRegistro(dadosEvento, 'anterior');

          if (npcSessaoId === null || !anterior) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          const npcSessaoAtual = await tx.npcAmeacaSessao.findFirst({
            where: {
              id: npcSessaoId,
              sessaoId,
            },
          });

          if (!npcSessaoAtual) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          const dataAnterior = this.montarUpdateNpcPorSnapshot(anterior);
          if (!dataAnterior) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          await tx.npcAmeacaSessao.update({
            where: {
              id: npcSessaoId,
            },
            data: dataAnterior,
          });

          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: npcSessaoAtual.cenaId,
              tipoEvento: 'NPC_ATUALIZACAO_DESFEITA',
              dados: {
                eventoOriginalId: evento.id,
                npcSessaoId,
                nome: npcSessaoAtual.nomeExibicao,
                desfeitoPorId: usuarioId,
                motivo: motivoLimpo,
              },
            },
          });
          break;
        }
        case 'NPC_REMOVIDO': {
          const snapshot = this.lerSnapshotNpcRegistro(dadosEvento, 'snapshot');
          if (!snapshot) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          const npcRestaurado = await tx.npcAmeacaSessao.create({
            data: {
              sessaoId,
              cenaId: snapshot.cenaId ?? evento.cenaId ?? null,
              npcAmeacaId: snapshot.npcAmeacaId,
              nomeExibicao: snapshot.nomeExibicao,
              fichaTipo: snapshot.fichaTipo,
              tipo: snapshot.tipo,
              vd: snapshot.vd,
              defesa: snapshot.defesa,
              pontosVidaAtual: snapshot.pontosVidaAtual,
              pontosVidaMax: snapshot.pontosVidaMax,
              machucado: snapshot.machucado,
              deslocamentoMetros: snapshot.deslocamentoMetros,
              passivasGuia: this.jsonParaPersistencia(snapshot.passivasGuia),
              acoesGuia: this.jsonParaPersistencia(snapshot.acoesGuia),
              notasCena: snapshot.notasCena,
            },
          });

          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: snapshot.cenaId ?? evento.cenaId ?? null,
              tipoEvento: 'NPC_REMOCAO_DESFEITA',
              dados: {
                eventoOriginalId: evento.id,
                npcSessaoIdRestaurado: npcRestaurado.id,
                nome: npcRestaurado.nomeExibicao,
                desfeitoPorId: usuarioId,
                motivo: motivoLimpo,
              },
            },
          });
          break;
        }
        default:
          throw new SessaoEventoDesfazerNaoPermitidoException(
            eventoId,
            sessaoId,
            evento.tipoEvento,
          );
      }

      await this.marcarEventoComoDesfeitoTx(tx, evento, usuarioId, motivoLimpo);
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
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
            rodadaAnterior: sessao.rodadaAtual,
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

      const cenaAnterior = await this.obterCenaAtualSessaoTx(tx, sessaoId);
      const nomeNovaCena = dto.nome?.trim() || null;
      const rodadaNova = dto.tipo === 'LIVRE' ? 1 : sessao.rodadaAtual;
      const indiceTurnoNovo =
        dto.tipo === 'LIVRE' ? 0 : sessao.indiceTurnoAtual;

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
          cenaAtualNome: nomeNovaCena,
          rodadaAtual: rodadaNova,
          indiceTurnoAtual: indiceTurnoNovo,
        },
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: cena.id,
          tipoEvento: 'CENA_ATUALIZADA',
          dados: {
            tipoNovo: dto.tipo,
            nomeNovo: nomeNovaCena,
            tipoAnterior: sessao.cenaAtualTipo,
            nomeAnterior: sessao.cenaAtualNome,
            rodadaAnterior: sessao.rodadaAtual,
            rodadaNova,
            indiceTurnoAnterior: sessao.indiceTurnoAtual,
            indiceTurnoNovo,
            cenaAnteriorId: cenaAnterior.id,
            cenaNovaId: cena.id,
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
            snapshot: this.snapshotNpcSessao(npcSessao),
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

      const npcSessaoAtualizado = await tx.npcAmeacaSessao.update({
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
            anterior: this.snapshotNpcSessao(npcSessaoAtual),
            atual: this.snapshotNpcSessao(npcSessaoAtualizado),
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
            snapshot: this.snapshotNpcSessao(npcSessaoAtual),
            removidoPorId: usuarioId,
          },
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async validarAcessoSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
  ): Promise<void> {
    await this.obterSessaoComAcesso(campanhaId, sessaoId, usuarioId);
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
        dono: {
          select: {
            id: true,
            apelido: true,
          },
        },
        membros: {
          select: {
            usuarioId: true,
            papel: true,
            usuario: {
              select: {
                id: true,
                apelido: true,
              },
            },
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

  private mapearParticipantesCampanha(campanha: AcessoCampanha['campanha']) {
    const participantes = new Map<
      number,
      { usuarioId: number; apelido: string; papel: string; ehDono: boolean }
    >();

    participantes.set(campanha.dono.id, {
      usuarioId: campanha.dono.id,
      apelido: campanha.dono.apelido,
      papel: 'MESTRE',
      ehDono: true,
    });

    for (const membro of campanha.membros) {
      if (membro.usuarioId === campanha.dono.id) continue;

      participantes.set(membro.usuarioId, {
        usuarioId: membro.usuarioId,
        apelido: membro.usuario.apelido,
        papel: membro.papel,
        ehDono: false,
      });
    }

    return Array.from(participantes.values()).sort((a, b) => {
      if (a.ehDono !== b.ehDono) {
        return a.ehDono ? -1 : 1;
      }
      return a.apelido.localeCompare(b.apelido, 'pt-BR');
    });
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

  private async obterUltimoEventoReversivelDisponivel(
    tx: Prisma.TransactionClient | PrismaService,
    sessaoId: number,
  ) {
    const eventos = await tx.eventoSessao.findMany({
      where: {
        sessaoId,
        tipoEvento: {
          in: Array.from(TIPOS_EVENTO_REVERSIVEIS),
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: 120,
    });

    for (const evento of eventos) {
      if (!this.eventoJaFoiDesfeito(evento.dados)) {
        return evento;
      }
    }

    return null;
  }

  private eventoJaFoiDesfeito(dados: Prisma.JsonValue | null): boolean {
    const registro = this.extrairRegistro(dados);
    return registro.desfeito === true;
  }

  private extrairRegistro(dados: Prisma.JsonValue | null): Record<string, unknown> {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      return {};
    }
    return dados as Record<string, unknown>;
  }

  private lerInteiroRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): number | null {
    const valor = registro[chave];
    if (typeof valor === 'number' && Number.isInteger(valor)) {
      return valor;
    }
    return null;
  }

  private lerInteiroOpcionalRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): number | null {
    const valor = registro[chave];
    if (valor === undefined || valor === null) return null;
    if (typeof valor === 'number' && Number.isInteger(valor)) {
      return valor;
    }
    return null;
  }

  private lerTextoRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): string | null {
    const valor = registro[chave];
    if (typeof valor !== 'string') return null;
    const texto = valor.trim();
    return texto.length > 0 ? texto : null;
  }

  private lerTextoOpcionalRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): string | null {
    const valor = registro[chave];
    if (valor === undefined || valor === null) return null;
    if (typeof valor !== 'string') return null;
    const texto = valor.trim();
    return texto.length > 0 ? texto : null;
  }

  private lerRegistroOpcionalRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): Record<string, unknown> | null {
    const valor = registro[chave];
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
      return null;
    }
    return valor as Record<string, unknown>;
  }

  private lerSnapshotNpcRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): SnapshotNpcSessao | null {
    const bruto = this.lerRegistroOpcionalRegistro(registro, chave);
    if (!bruto) return null;

    const nomeExibicao = this.lerTextoRegistro(bruto, 'nomeExibicao');
    const fichaTipo = this.normalizarTipoFichaNpcAmeaca(
      this.lerTextoRegistro(bruto, 'fichaTipo'),
    );
    const tipo = this.normalizarTipoNpcAmeaca(this.lerTextoRegistro(bruto, 'tipo'));
    const vd = this.lerInteiroRegistro(bruto, 'vd');
    const defesa = this.lerInteiroRegistro(bruto, 'defesa');
    const pontosVidaAtual = this.lerInteiroRegistro(bruto, 'pontosVidaAtual');
    const pontosVidaMax = this.lerInteiroRegistro(bruto, 'pontosVidaMax');
    const deslocamentoMetros = this.lerInteiroRegistro(bruto, 'deslocamentoMetros');

    if (
      !nomeExibicao ||
      !fichaTipo ||
      !tipo ||
      vd === null ||
      defesa === null ||
      pontosVidaAtual === null ||
      pontosVidaMax === null ||
      deslocamentoMetros === null
    ) {
      return null;
    }

    const machucado = this.lerInteiroOpcionalRegistro(bruto, 'machucado');
    const npcAmeacaId = this.lerInteiroOpcionalRegistro(bruto, 'npcAmeacaId');
    const cenaId = this.lerInteiroOpcionalRegistro(bruto, 'cenaId');
    const notasCena = this.lerTextoOpcionalRegistro(bruto, 'notasCena');

    return {
      npcAmeacaId,
      nomeExibicao,
      fichaTipo,
      tipo,
      vd,
      defesa,
      pontosVidaAtual,
      pontosVidaMax,
      machucado,
      deslocamentoMetros,
      passivasGuia: (bruto.passivasGuia ?? null) as Prisma.JsonValue | null,
      acoesGuia: (bruto.acoesGuia ?? null) as Prisma.JsonValue | null,
      notasCena,
      cenaId,
    };
  }

  private snapshotNpcSessao(npc: {
    npcAmeacaId: number | null;
    nomeExibicao: string;
    fichaTipo: TipoFichaNpcAmeaca;
    tipo: TipoNpcAmeaca;
    vd: number;
    defesa: number;
    pontosVidaAtual: number;
    pontosVidaMax: number;
    machucado: number | null;
    deslocamentoMetros: number;
    passivasGuia: Prisma.JsonValue | null;
    acoesGuia: Prisma.JsonValue | null;
    notasCena: string | null;
    cenaId: number | null;
  }): SnapshotNpcSessao {
    return {
      npcAmeacaId: npc.npcAmeacaId,
      nomeExibicao: npc.nomeExibicao,
      fichaTipo: npc.fichaTipo,
      tipo: npc.tipo,
      vd: npc.vd,
      defesa: npc.defesa,
      pontosVidaAtual: npc.pontosVidaAtual,
      pontosVidaMax: npc.pontosVidaMax,
      machucado: npc.machucado,
      deslocamentoMetros: npc.deslocamentoMetros,
      passivasGuia: npc.passivasGuia,
      acoesGuia: npc.acoesGuia,
      notasCena: npc.notasCena,
      cenaId: npc.cenaId,
    };
  }

  private montarUpdateNpcPorSnapshot(snapshot: Record<string, unknown>) {
    const dados = this.lerSnapshotNpcRegistro({ snapshot }, 'snapshot');
    if (!dados) {
      return null;
    }

    return {
      nomeExibicao: dados.nomeExibicao,
      vd: dados.vd,
      defesa: dados.defesa,
      pontosVidaAtual: dados.pontosVidaAtual,
      pontosVidaMax: dados.pontosVidaMax,
      machucado: dados.machucado,
      deslocamentoMetros: dados.deslocamentoMetros,
      notasCena: dados.notasCena,
    } satisfies Prisma.NpcAmeacaSessaoUpdateInput;
  }

  private normalizarTipoFichaNpcAmeaca(
    valor: string | null,
  ): TipoFichaNpcAmeaca | null {
    if (!valor) return null;
    const tiposValidos: TipoFichaNpcAmeaca[] = ['NPC', 'AMEACA'];
    return tiposValidos.includes(valor as TipoFichaNpcAmeaca)
      ? (valor as TipoFichaNpcAmeaca)
      : null;
  }

  private normalizarTipoNpcAmeaca(valor: string | null): TipoNpcAmeaca | null {
    if (!valor) return null;
    const tiposValidos: TipoNpcAmeaca[] = [
      'HUMANO',
      'FEITICEIRO',
      'MALDICAO',
      'ANIMAL',
      'HIBRIDO',
      'OUTRO',
    ];
    return tiposValidos.includes(valor as TipoNpcAmeaca)
      ? (valor as TipoNpcAmeaca)
      : null;
  }

  private async marcarEventoComoDesfeitoTx(
    tx: Prisma.TransactionClient,
    evento: { id: number; dados: Prisma.JsonValue | null },
    usuarioId: number,
    motivo: string | null,
  ): Promise<void> {
    const dadosOriginais = this.extrairRegistro(evento.dados);

    await tx.eventoSessao.update({
      where: { id: evento.id },
      data: {
        dados: this.jsonParaPersistencia({
          ...dadosOriginais,
          desfeito: true,
          desfeitoEm: new Date().toISOString(),
          desfeitoPorId: usuarioId,
          motivoDesfazer: motivo,
        }),
      },
    });
  }

  private mapearEventoSessao(
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
    podeDesfazer: boolean,
  ): EventoSessaoMapeado {
    const dados = this.extrairRegistro(evento.dados);
    const desfeito = this.eventoJaFoiDesfeito(evento.dados);

    let autor: EventoSessaoMapeado['autor'] = null;
    if (evento.personagemAtor) {
      autor = {
        usuarioId: evento.personagemAtor.personagemCampanha.donoId,
        apelido: evento.personagemAtor.personagemCampanha.dono.apelido,
        personagemNome: evento.personagemAtor.personagemCampanha.nome,
      };
    } else if (typeof dados.autorApelido === 'string') {
      autor = {
        usuarioId: null,
        apelido: dados.autorApelido,
        personagemNome: null,
      };
    }

    return {
      id: evento.id,
      sessaoId: evento.sessaoId,
      cenaId: evento.cenaId,
      criadoEm: evento.criadoEm,
      tipoEvento: evento.tipoEvento,
      descricao: this.descreverEventoSessao(evento.tipoEvento, dados),
      desfeito,
      podeDesfazer: !desfeito && podeDesfazer,
      dados: evento.dados ?? null,
      autor,
    };
  }

  private descreverEventoSessao(
    tipoEvento: string,
    dados: Record<string, unknown>,
  ): string {
    switch (tipoEvento) {
      case 'SESSAO_INICIADA':
        return 'Sessao iniciada';
      case 'SESSAO_ENCERRADA':
        return 'Sessao encerrada';
      case 'CENA_ATUALIZADA': {
        const tipo = this.lerTextoRegistro(dados, 'tipoNovo');
        const nome = this.lerTextoOpcionalRegistro(dados, 'nomeNovo');
        return `Cena atualizada${tipo ? ` para ${this.labelTipoCena(tipo)}` : ''}${nome ? ` (${nome})` : ''}`;
      }
      case 'CENA_DESFEITA':
        return 'Ultima troca de cena desfeita';
      case 'TURNO_AVANCADO': {
        const rodada = this.lerInteiroRegistro(dados, 'rodadaNova');
        return `Turno avancado${rodada !== null ? ` (rodada ${rodada})` : ''}`;
      }
      case 'TURNO_DESFEITO':
        return 'Ultimo avanco de turno desfeito';
      case 'NPC_ADICIONADO':
        return `Aliado ou ameaca adicionado${this.lerTextoOpcionalRegistro(dados, 'nome') ? `: ${this.lerTextoOpcionalRegistro(dados, 'nome')}` : ''}`;
      case 'NPC_ATUALIZADO':
        return 'Ficha de aliado ou ameaca atualizada';
      case 'NPC_REMOVIDO':
        return `Aliado ou ameaca removido${this.lerTextoOpcionalRegistro(dados, 'nome') ? `: ${this.lerTextoOpcionalRegistro(dados, 'nome')}` : ''}`;
      case 'NPC_ADICAO_DESFEITA':
      case 'NPC_ATUALIZACAO_DESFEITA':
      case 'NPC_REMOCAO_DESFEITA':
        return 'Alteracao de aliado ou ameaca desfeita';
      case 'CHAT':
        return 'Mensagem no chat da sessao';
      default:
        return tipoEvento;
    }
  }

  private labelTipoCena(tipo: string): string {
    const labels: Record<string, string> = {
      LIVRE: 'Cena livre',
      INVESTIGACAO: 'Investigacao',
      FURTIVIDADE: 'Furtividade',
      COMBATE: 'Combate',
      OUTRA: 'Outra',
    };
    return labels[tipo] ?? tipo;
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
