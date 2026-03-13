import { Injectable } from '@nestjs/common';
import { Prisma, TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CampanhaAcessoNegadoException,
  CampanhaApenasMestreException,
  CampanhaNaoEncontradaException,
  CampanhaPersonagemEdicaoNegadaException,
  NpcSessaoNaoEncontradoException,
  SessaoEventoDesfazerNaoPermitidoException,
  SessaoOrdemIniciativaInvalidaException,
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
import { AtualizarOrdemIniciativaSessaoDto } from './dto/atualizar-ordem-iniciativa-sessao.dto';
import { UsarHabilidadeSessaoDto } from './dto/usar-habilidade-sessao.dto';
import { AplicarCondicaoSessaoDto } from './dto/aplicar-condicao-sessao.dto';
import {
  atendeRequisitoBaseTecnicaNaoInata,
  atendeRequisitosGraus,
  montarMapaGraus,
} from 'src/personagem-base/regras-criacao/regras-tecnicas-nao-inatas';
import { BusinessException } from 'src/common/exceptions/business.exception';

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

type TipoParticipanteIniciativa = 'PERSONAGEM' | 'NPC';

type ParticipanteIniciativa = {
  tipoParticipante: TipoParticipanteIniciativa;
  token: string;
  personagemSessaoId: number | null;
  npcSessaoId: number | null;
  personagemCampanhaId: number | null;
  donoId: number | null;
  nomeJogador: string | null;
  nomePersonagem: string;
  podeEditar: boolean;
};

type OrdemIniciativaEvento = {
  ordemAnterior: string[];
  ordemAtual: string[];
  indiceTurnoAnterior: number;
  indiceTurnoNovo: number;
};

type VariacaoTecnicaSessaoResumo = {
  id: number;
  habilidadeTecnicaId: number;
  nome: string;
  descricao: string;
  substituiCustos: boolean;
  custoPE: number | null;
  custoEA: number | null;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
  execucao: string | null;
  area: string | null;
  alcance: string | null;
  alvo: string | null;
  duracao: string | null;
  resistencia: string | null;
  dtResistencia: string | null;
  danoFlat: number | null;
  danoFlatTipo: string | null;
  efeitoAdicional: string | null;
  escalonaPorGrau: boolean | null;
  grauTipoGrauCodigo: string | null;
  acumulosMaximos: number;
  escalonamentoCustoEA: number | null;
  escalonamentoCustoPE: number | null;
  escalonamentoTipo: string | null;
  escalonamentoEfeito: Prisma.JsonValue | null;
  escalonamentoDano: Prisma.JsonValue | null;
  requisitos: Prisma.JsonValue | null;
  ordem: number;
};

type HabilidadeTecnicaSessaoResumo = {
  id: number;
  tecnicaId: number;
  codigo: string;
  nome: string;
  descricao: string;
  requisitos: Prisma.JsonValue | null;
  execucao: string;
  area: string | null;
  alcance: string | null;
  alvo: string | null;
  duracao: string | null;
  custoPE: number;
  custoEA: number;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
  escalonaPorGrau: boolean;
  grauTipoGrauCodigo: string | null;
  acumulosMaximos: number;
  escalonamentoCustoEA: number;
  escalonamentoCustoPE: number;
  escalonamentoTipo: string;
  escalonamentoEfeito: Prisma.JsonValue | null;
  escalonamentoDano: Prisma.JsonValue | null;
  danoFlat: number | null;
  danoFlatTipo: string | null;
  efeito: string;
  ordem: number;
  variacoes: VariacaoTecnicaSessaoResumo[];
};

type TecnicaSessaoResumo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  tipo: string;
  habilidades: HabilidadeTecnicaSessaoResumo[];
};

type CustoHabilidadeResolvido = {
  nomeVariacao: string | null;
  variacaoHabilidadeId: number | null;
  custoEA: number;
  custoPE: number;
  duracao: string | null;
  isSustentada: boolean;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
  acumulosSolicitados: number;
  acumulosAplicados: number;
  acumulosMaximos: number;
  custoEscalonamentoEA: number;
  custoEscalonamentoPE: number;
  custoEscalonamentoTotalEA: number;
  custoEscalonamentoTotalPE: number;
  escalonamentoTipo: string;
  escalonamentoEfeito: Prisma.JsonValue | null;
  resumoEscalonamento: string | null;
  isUsoBaseSemEscalonamento: boolean;
};

type CondicaoAtivaSessaoResumo = {
  id: number;
  condicaoId: number;
  nome: string;
  descricao: string;
  automatica: boolean;
  chaveAutomacao: string | null;
  duracaoModo: string;
  duracaoValor: number | null;
  restanteDuracao: number | null;
  contadorTurnos: number;
  origemDescricao: string | null;
  observacao: string | null;
  turnoAplicacao: number;
};

type VariacaoTecnicaSessaoRaw = {
  id: number;
  habilidadeTecnicaId: number;
  nome: string;
  descricao: string;
  substituiCustos: boolean;
  custoPE: number | null;
  custoEA: number | null;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
  execucao: string | null;
  area: string | null;
  alcance: string | null;
  alvo: string | null;
  duracao: string | null;
  resistencia: string | null;
  dtResistencia: string | null;
  danoFlat: number | null;
  danoFlatTipo: string | null;
  efeitoAdicional: string | null;
  escalonaPorGrau: boolean | null;
  escalonamentoCustoEA: number | null;
  escalonamentoCustoPE: number | null;
  escalonamentoTipo: string | null;
  escalonamentoEfeito: Prisma.JsonValue | null;
  escalonamentoDano: Prisma.JsonValue | null;
  requisitos: Prisma.JsonValue | null;
  ordem: number;
};

type HabilidadeTecnicaSessaoRaw = {
  id: number;
  tecnicaId: number;
  codigo: string;
  nome: string;
  descricao: string;
  requisitos: Prisma.JsonValue | null;
  execucao: string;
  area: string | null;
  alcance: string | null;
  alvo: string | null;
  duracao: string | null;
  custoPE: number;
  custoEA: number;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
  escalonaPorGrau: boolean;
  grauTipoGrauCodigo: string | null;
  escalonamentoCustoEA: number;
  escalonamentoCustoPE: number;
  escalonamentoTipo: string;
  escalonamentoEfeito: Prisma.JsonValue | null;
  escalonamentoDano: Prisma.JsonValue | null;
  danoFlat: number | null;
  danoFlatTipo: string | null;
  efeito: string;
  ordem: number;
  variacoes: VariacaoTecnicaSessaoRaw[];
};

type TecnicaSessaoRaw = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  requisitos: Prisma.JsonValue | null;
  habilidades: HabilidadeTecnicaSessaoRaw[];
};

type RelacaoTecnicaSessaoRaw = {
  tecnica: TecnicaSessaoRaw;
};

type GrauSessaoRaw = {
  valor: number;
  tipoGrau: {
    codigo: string;
  };
};

type PersonagemCampanhaTecnicasSessaoRaw = {
  tecnicaInata: TecnicaSessaoRaw | null;
  tecnicasAprendidas: RelacaoTecnicaSessaoRaw[];
  grausAprimoramento: GrauSessaoRaw[];
  personagemBase?: {
    tecnicasAprendidas: RelacaoTecnicaSessaoRaw[];
    grausAprimoramento: GrauSessaoRaw[];
  } | null;
};

const TIPOS_EVENTO_REVERSIVEIS = new Set<string>([
  'TURNO_AVANCADO',
  'TURNO_RECUADO',
  'TURNO_PULADO',
  'ORDEM_INICIATIVA_ATUALIZADA',
  'CENA_ATUALIZADA',
  'NPC_ADICIONADO',
  'NPC_ATUALIZADO',
  'NPC_REMOVIDO',
  'CONDICAO_APLICADA',
  'CONDICAO_REMOVIDA',
]);

const CONDICAO_DURACAO_MODOS = {
  ATE_REMOVER: 'ATE_REMOVER',
  RODADAS: 'RODADAS',
  TURNOS_ALVO: 'TURNOS_ALVO',
} as const;

const CONDICAO_AUTOMACAO_CHAVES = {
  MACHUCADO: 'MACHUCADO',
  MORRENDO: 'MORRENDO',
  CAIDO: 'CAIDO',
  ENLOUQUECENDO: 'ENLOUQUECENDO',
  INSANO: 'INSANO',
  MORTO: 'MORTO',
} as const;

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
    await this.sincronizarCondicoesAutomaticasSessao(sessaoId);

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
                tecnicaInata: {
                  include: {
                    habilidades: {
                      include: {
                        variacoes: {
                          orderBy: { ordem: 'asc' },
                        },
                      },
                      orderBy: { ordem: 'asc' },
                    },
                  },
                },
                tecnicasAprendidas: {
                  include: {
                    tecnica: {
                      include: {
                        habilidades: {
                          include: {
                            variacoes: {
                              orderBy: { ordem: 'asc' },
                            },
                          },
                          orderBy: { ordem: 'asc' },
                        },
                      },
                    },
                  },
                },
                grausAprimoramento: {
                  include: {
                    tipoGrau: {
                      select: {
                        codigo: true,
                      },
                    },
                  },
                },
                personagemBase: {
                  select: {
                    grausAprimoramento: {
                      include: {
                        tipoGrau: {
                          select: {
                            codigo: true,
                          },
                        },
                      },
                    },
                    tecnicasAprendidas: {
                      include: {
                        tecnica: {
                          include: {
                            habilidades: {
                              include: {
                                variacoes: {
                                  orderBy: { ordem: 'asc' },
                                },
                              },
                              orderBy: { ordem: 'asc' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                dono: {
                  select: {
                    id: true,
                    apelido: true,
                  },
                },
              },
            },
            condicoes: {
              where: {
                ativo: true,
              },
              orderBy: {
                id: 'asc',
              },
              select: {
                id: true,
                condicaoId: true,
                turnoAplicacao: true,
                duracaoModo: true,
                duracaoValor: true,
                restanteDuracao: true,
                automatica: true,
                chaveAutomacao: true,
                contadorTurnos: true,
                origemDescricao: true,
                observacao: true,
                condicao: {
                  select: {
                    nome: true,
                    descricao: true,
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
          include: {
            condicoes: {
              where: {
                ativo: true,
              },
              orderBy: {
                id: 'asc',
              },
              select: {
                id: true,
                condicaoId: true,
                turnoAplicacao: true,
                duracaoModo: true,
                duracaoValor: true,
                restanteDuracao: true,
                automatica: true,
                chaveAutomacao: true,
                contadorTurnos: true,
                origemDescricao: true,
                observacao: true,
                condicao: {
                  select: {
                    nome: true,
                    descricao: true,
                  },
                },
              },
            },
          },
        },
        habilidadesSustentadas: {
          where: {
            ativa: true,
          },
          orderBy: {
            id: 'asc',
          },
          select: {
            id: true,
            personagemSessaoId: true,
            habilidadeTecnicaId: true,
            variacaoHabilidadeId: true,
            nomeHabilidade: true,
            nomeVariacao: true,
            custoSustentacaoEA: true,
            custoSustentacaoPE: true,
            ativadaNaRodada: true,
            ultimaCobrancaRodada: true,
            criadoEm: true,
          },
        },
      },
    });

    if (!sessao || sessao.campanhaId !== campanhaId) {
      throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
    }

    const personagensOrdenados = sessao.personagens;
    const cenaAtualId = sessao.cenas[0]?.id ?? null;
    const npcsCenaAtual = sessao.npcs.filter((npc) => npc.cenaId === cenaAtualId);
    const participantesIniciativaPadrao = this.montarParticipantesIniciativa(
      personagensOrdenados,
      npcsCenaAtual,
      acesso.ehMestre,
      usuarioId,
    );
    const ordemPersistida = await this.obterOrdemIniciativaPersistida(
      this.prisma,
      sessaoId,
    );
    const participantesIniciativa = this.aplicarOrdemIniciativaPersistida(
      participantesIniciativaPadrao,
      ordemPersistida,
    );
    const totalParticipantesIniciativa = participantesIniciativa.length;
    const valorIniciativaBase = Math.max(20, totalParticipantesIniciativa);
    const obterValorIniciativa = (indice: number) => valorIniciativaBase - indice;
    const controleTurnosAtivo = sessao.cenaAtualTipo !== 'LIVRE';
    const indiceTurno = controleTurnosAtivo
      ? this.clampIndiceTurno(
          sessao.indiceTurnoAtual,
          totalParticipantesIniciativa,
        )
      : null;
    const personagemTurnoAtual =
      controleTurnosAtivo &&
      totalParticipantesIniciativa > 0 &&
      indiceTurno !== null
        ? participantesIniciativa[indiceTurno]
        : null;
    const sustentacoesPorPersonagemSessao = new Map<
      number,
      Array<{
        id: number;
        habilidadeTecnicaId: number;
        variacaoHabilidadeId: number | null;
        nomeHabilidade: string;
        nomeVariacao: string | null;
        custoSustentacaoEA: number;
        custoSustentacaoPE: number;
        ativadaNaRodada: number;
        ultimaCobrancaRodada: number;
        criadaEm: Date;
      }>
    >();
    for (const sustentacao of sessao.habilidadesSustentadas) {
      const listaAtual =
        sustentacoesPorPersonagemSessao.get(sustentacao.personagemSessaoId) ?? [];
      listaAtual.push({
        id: sustentacao.id,
        habilidadeTecnicaId: sustentacao.habilidadeTecnicaId,
        variacaoHabilidadeId: sustentacao.variacaoHabilidadeId,
        nomeHabilidade: sustentacao.nomeHabilidade,
        nomeVariacao: sustentacao.nomeVariacao,
        custoSustentacaoEA: sustentacao.custoSustentacaoEA,
        custoSustentacaoPE: sustentacao.custoSustentacaoPE,
        ativadaNaRodada: sustentacao.ativadaNaRodada,
        ultimaCobrancaRodada: sustentacao.ultimaCobrancaRodada,
        criadaEm: sustentacao.criadoEm,
      });
      sustentacoesPorPersonagemSessao.set(sustentacao.personagemSessaoId, listaAtual);
    }
    const tecnicasNaoInatasCatalogo = await this.listarTecnicasNaoInatasCatalogo(
      this.prisma,
    );

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
            tipoParticipante: personagemTurnoAtual.tipoParticipante,
            personagemSessaoId: personagemTurnoAtual.personagemSessaoId,
            npcSessaoId: personagemTurnoAtual.npcSessaoId,
            personagemCampanhaId: personagemTurnoAtual.personagemCampanhaId,
            donoId: personagemTurnoAtual.donoId,
            nomeJogador: personagemTurnoAtual.nomeJogador,
            nomePersonagem: personagemTurnoAtual.nomePersonagem,
            valorIniciativa:
              indiceTurno === null ? null : obterValorIniciativa(indiceTurno),
          }
        : null,
      iniciativa: {
        indiceAtual: controleTurnosAtivo ? indiceTurno : null,
        ordem: participantesIniciativa.map((participante, indice) => ({
          tipoParticipante: participante.tipoParticipante,
          personagemSessaoId: participante.personagemSessaoId,
          npcSessaoId: participante.npcSessaoId,
          personagemCampanhaId: participante.personagemCampanhaId,
          donoId: participante.donoId,
          nomeJogador: participante.nomeJogador,
          nomePersonagem: participante.nomePersonagem,
          podeEditar: participante.podeEditar,
          valorIniciativa: obterValorIniciativa(indice),
        })),
      },
      permissoes: {
        ehMestre: acesso.ehMestre,
        podeEditarTodos: acesso.ehMestre,
      },
      participantes: this.mapearParticipantesCampanha(acesso.campanha),
      cards: personagensOrdenados.map((personagem) => {
        const podeEditar =
          acesso.ehMestre || personagem.personagemCampanha.donoId === usuarioId;
        const visibilidade = podeEditar ? 'completa' : 'resumida';
        const tecnicas = this.resolverTecnicasSessaoPersonagem(
          personagem.personagemCampanha,
          tecnicasNaoInatasCatalogo,
        );
        const sustentacoesAtivas =
          sustentacoesPorPersonagemSessao.get(personagem.id) ?? [];
        const condicoesAtivas = this.mapearCondicoesAtivasSessao(personagem.condicoes);

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
          tecnicaInata: visibilidade === 'completa' ? tecnicas.tecnicaInata : null,
          tecnicasNaoInatas:
            visibilidade === 'completa' ? tecnicas.tecnicasNaoInatas : [],
          sustentacoesAtivas:
            visibilidade === 'completa' ? sustentacoesAtivas : [],
          condicoesAtivas,
        };
      }),
      npcs: npcsCenaAtual.map((npc) => ({
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
          condicoesAtivas: this.mapearCondicoesAtivasSessao(npc.condicoes),
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
        case 'TURNO_AVANCADO':
        case 'TURNO_RECUADO':
        case 'TURNO_PULADO': {
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
                tipoEventoOriginal: evento.tipoEvento,
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
        case 'ORDEM_INICIATIVA_ATUALIZADA': {
          const ordemEvento = this.lerOrdemIniciativaEvento(dadosEvento);
          if (!ordemEvento) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          const cenaAtual = await this.obterCenaAtualSessaoTx(tx, sessaoId);
          const participantesPadrao = await this.carregarParticipantesIniciativa(
            tx,
            sessaoId,
            cenaAtual.id,
            acesso.ehMestre,
            usuarioId,
          );
          const ordemRestaurada = this.aplicarOrdemIniciativaPersistida(
            participantesPadrao,
            ordemEvento.ordemAnterior,
          );

          if (ordemRestaurada.length === 0) {
            break;
          }

          const indiceTurnoRestaurado = this.clampIndiceTurno(
            ordemEvento.indiceTurnoAnterior,
            ordemRestaurada.length,
          );

          await tx.sessao.update({
            where: { id: sessaoId },
            data: {
              indiceTurnoAtual: indiceTurnoRestaurado,
            },
          });

          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: cenaAtual.id,
              tipoEvento: 'ORDEM_INICIATIVA_DESFEITA',
              dados: this.jsonParaPersistencia({
                eventoOriginalId: evento.id,
                ordemAtual: ordemRestaurada.map(
                  (participante) => participante.token,
                ),
                indiceTurnoRestaurado,
                desfeitoPorId: usuarioId,
                motivo: motivoLimpo,
              }),
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
          await tx.npcAmeacaSessao.updateMany({
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
        case 'CONDICAO_APLICADA': {
          const condicaoSessaoId = this.lerInteiroRegistro(
            dadosEvento,
            'condicaoSessaoId',
          );
          const modoOperacao = this.lerTextoOpcionalRegistro(
            dadosEvento,
            'modoOperacao',
          );
          if (condicaoSessaoId === null) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          const condicaoAtual = await tx.condicaoPersonagemSessao.findFirst({
            where: {
              id: condicaoSessaoId,
              sessaoId,
            },
          });

          if (!condicaoAtual) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          if (modoOperacao === 'ATUALIZADA') {
            const snapshotAnterior = this.lerSnapshotCondicaoRegistro(
              dadosEvento,
              'snapshotAnterior',
            );
            if (!snapshotAnterior) {
              throw new SessaoEventoDesfazerNaoPermitidoException(
                eventoId,
                sessaoId,
                evento.tipoEvento,
              );
            }
            await tx.condicaoPersonagemSessao.update({
              where: {
                id: condicaoSessaoId,
              },
              data: this.montarUpdateCondicaoPorSnapshot(snapshotAnterior),
            });
          } else {
            await tx.condicaoPersonagemSessao.update({
              where: {
                id: condicaoSessaoId,
              },
              data: {
                ativo: false,
                removidaEm: new Date(),
                motivoRemocao: 'Aplicacao de condicao desfeita.',
              },
            });
          }

          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: condicaoAtual.cenaId,
              personagemAtorId: condicaoAtual.personagemSessaoId,
              tipoEvento: 'CONDICAO_APLICACAO_DESFEITA',
              dados: {
                eventoOriginalId: evento.id,
                condicaoSessaoId,
                desfeitoPorId: usuarioId,
                motivo: motivoLimpo,
              },
            },
          });
          break;
        }
        case 'CONDICAO_REMOVIDA': {
          const condicaoSessaoId = this.lerInteiroRegistro(
            dadosEvento,
            'condicaoSessaoId',
          );
          const snapshot = this.lerSnapshotCondicaoRegistro(dadosEvento, 'snapshot');
          if (condicaoSessaoId === null || !snapshot) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          const condicaoAtual = await tx.condicaoPersonagemSessao.findFirst({
            where: {
              id: condicaoSessaoId,
              sessaoId,
            },
          });

          if (!condicaoAtual) {
            throw new SessaoEventoDesfazerNaoPermitidoException(
              eventoId,
              sessaoId,
              evento.tipoEvento,
            );
          }

          await tx.condicaoPersonagemSessao.update({
            where: {
              id: condicaoSessaoId,
            },
            data: this.montarUpdateCondicaoPorSnapshot(snapshot),
          });

          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: snapshot.cenaId,
              personagemAtorId: snapshot.personagemSessaoId,
              tipoEvento: 'CONDICAO_REMOCAO_DESFEITA',
              dados: {
                eventoOriginalId: evento.id,
                condicaoSessaoId,
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
    await this.aplicarAjusteTurnoSessao(
      campanhaId,
      sessaoId,
      usuarioId,
      'AVANCAR',
    );

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async voltarTurnoSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
  ) {
    await this.aplicarAjusteTurnoSessao(campanhaId, sessaoId, usuarioId, 'VOLTAR');

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async pularTurnoSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
  ) {
    await this.aplicarAjusteTurnoSessao(campanhaId, sessaoId, usuarioId, 'PULAR');

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async atualizarOrdemIniciativaSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    dto: AtualizarOrdemIniciativaSessaoDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'atualizar ordem de iniciativa');

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

      const cenaAtual = await this.obterCenaAtualSessaoTx(tx, sessaoId);
      const participantesPadrao = await this.carregarParticipantesIniciativa(
        tx,
        sessaoId,
        cenaAtual.id,
        acesso.ehMestre,
        usuarioId,
      );

      if (participantesPadrao.length === 0) {
        return;
      }

      const ordemPersistida = await this.obterOrdemIniciativaPersistida(tx, sessaoId);
      const ordemAtual = this.aplicarOrdemIniciativaPersistida(
        participantesPadrao,
        ordemPersistida,
      );
      const tokensAtuais = ordemAtual.map((participante) => participante.token);
      const tokensNovos = dto.ordem.map((item) =>
        this.criarTokenParticipante(item.tipoParticipante, item.id),
      );
      const ordemNovaNormalizada = this.validarEOrdenarIniciativaPorTokens(
        ordemAtual,
        tokensNovos,
        sessaoId,
        campanhaId,
      );
      const tokensNovaOrdem = ordemNovaNormalizada.map(
        (participante) => participante.token,
      );

      const indiceAnterior = this.clampIndiceTurno(
        sessao.indiceTurnoAtual,
        ordemAtual.length,
      );

      const tokenTurnoAnterior = ordemAtual[indiceAnterior]?.token ?? null;
      const indiceTurnoNovoInformado =
        typeof dto.indiceTurnoAtual === 'number'
          ? this.clampIndiceTurno(dto.indiceTurnoAtual, ordemNovaNormalizada.length)
          : null;
      const indiceTurnoNovo =
        tokenTurnoAnterior
          ? this.clampIndiceTurno(
              ordemNovaNormalizada.findIndex(
                (participante) => participante.token === tokenTurnoAnterior,
              ),
              ordemNovaNormalizada.length,
            )
          : indiceTurnoNovoInformado ??
            this.clampIndiceTurno(sessao.indiceTurnoAtual, ordemNovaNormalizada.length);

      await tx.sessao.update({
        where: { id: sessaoId },
        data: {
          indiceTurnoAtual: indiceTurnoNovo,
        },
      });

      const dadosEvento: OrdemIniciativaEvento & { atualizadoPorId: number } = {
        ordemAnterior: tokensAtuais,
        ordemAtual: tokensNovaOrdem,
        indiceTurnoAnterior: indiceAnterior,
        indiceTurnoNovo,
        atualizadoPorId: usuarioId,
      };

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: cenaAtual.id,
          tipoEvento: 'ORDEM_INICIATIVA_ATUALIZADA',
          dados: this.jsonParaPersistencia(dadosEvento),
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
      await tx.npcAmeacaSessao.updateMany({
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

  async usarHabilidadeSessao(
    campanhaId: number,
    sessaoId: number,
    personagemSessaoId: number,
    usuarioId: number,
    dto: UsarHabilidadeSessaoDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        select: {
          id: true,
          campanhaId: true,
          status: true,
          cenaAtualTipo: true,
          rodadaAtual: true,
          indiceTurnoAtual: true,
        },
      });

      if (!sessao || sessao.campanhaId !== campanhaId) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      if (sessao.status === 'ENCERRADA') {
        throw new BusinessException(
          'Sessao encerrada nao permite uso de habilidades',
          'SESSAO_ENCERRADA',
          {
            campanhaId,
            sessaoId,
          },
        );
      }

      const personagemSessao = await tx.personagemSessao.findFirst({
        where: {
          id: personagemSessaoId,
          sessaoId,
        },
        include: {
          personagemCampanha: {
            select: {
              id: true,
              personagemBaseId: true,
              donoId: true,
              nome: true,
              peAtual: true,
              peMax: true,
              eaAtual: true,
              eaMax: true,
              limitePeEaPorTurno: true,
              tecnicaInata: {
                include: {
                  habilidades: {
                    include: {
                      variacoes: {
                        orderBy: { ordem: 'asc' },
                      },
                    },
                    orderBy: { ordem: 'asc' },
                  },
                },
              },
              tecnicasAprendidas: {
                include: {
                  tecnica: {
                    include: {
                      habilidades: {
                        include: {
                          variacoes: {
                            orderBy: { ordem: 'asc' },
                          },
                        },
                        orderBy: { ordem: 'asc' },
                      },
                    },
                  },
                },
              },
              grausAprimoramento: {
                include: {
                  tipoGrau: {
                    select: {
                      codigo: true,
                    },
                  },
                },
              },
              personagemBase: {
                select: {
                  grausAprimoramento: {
                    include: {
                      tipoGrau: {
                        select: {
                          codigo: true,
                        },
                      },
                    },
                  },
                  tecnicasAprendidas: {
                    include: {
                      tecnica: {
                        include: {
                          habilidades: {
                            include: {
                              variacoes: {
                                orderBy: { ordem: 'asc' },
                              },
                            },
                            orderBy: { ordem: 'asc' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!personagemSessao) {
        throw new BusinessException(
          'Personagem nao encontrado nesta sessao',
          'SESSAO_PERSONAGEM_NOT_FOUND',
          {
            campanhaId,
            sessaoId,
            personagemSessaoId,
          },
        );
      }

      if (
        !acesso.ehMestre &&
        personagemSessao.personagemCampanha.donoId !== usuarioId
      ) {
        throw new CampanhaPersonagemEdicaoNegadaException(
          campanhaId,
          personagemSessao.personagemCampanha.id,
          usuarioId,
        );
      }

      const tecnicasNaoInatasCatalogo = await this.listarTecnicasNaoInatasCatalogo(
        tx,
      );
      const tecnicasDisponiveis = this.resolverTecnicasSessaoPersonagem(
        personagemSessao.personagemCampanha,
        tecnicasNaoInatasCatalogo,
      );
      const habilidade = this.buscarHabilidadeTecnicaDisponivel(
        tecnicasDisponiveis,
        dto.habilidadeTecnicaId,
      );

      if (!habilidade) {
        throw new BusinessException(
          'Habilidade nao disponivel para este personagem',
          'SESSAO_HABILIDADE_NAO_DISPONIVEL',
          {
            campanhaId,
            sessaoId,
            personagemSessaoId,
            habilidadeTecnicaId: dto.habilidadeTecnicaId,
          },
        );
      }

      const custo = this.resolverCustoUsoHabilidade(
        habilidade,
        this.montarMapaGrausPersonagemSessao(personagemSessao.personagemCampanha),
        dto.variacaoHabilidadeId,
        dto.acumulos ?? 0,
      );

      const recursosAtuais = personagemSessao.personagemCampanha;
      if (recursosAtuais.eaAtual < custo.custoEA || recursosAtuais.peAtual < custo.custoPE) {
        throw new BusinessException(
          'Recursos insuficientes para usar esta habilidade',
          'SESSAO_RECURSO_INSUFICIENTE',
          {
            campanhaId,
            sessaoId,
            personagemSessaoId,
            habilidadeTecnicaId: dto.habilidadeTecnicaId,
            variacaoHabilidadeId: custo.variacaoHabilidadeId,
            custoEA: custo.custoEA,
            custoPE: custo.custoPE,
            eaAtual: recursosAtuais.eaAtual,
            peAtual: recursosAtuais.peAtual,
          },
        );
      }

      const turnoReferencia = this.montarReferenciaTurnoAtualSessao(sessao);
      const limitePeEaPorTurno = Math.max(
        0,
        Math.trunc(recursosAtuais.limitePeEaPorTurno ?? 0),
      );
      const custoTotalUso = custo.custoEA + custo.custoPE;

      let gastoPeEaNoTurnoAntesUso = 0;
      if (turnoReferencia) {
        gastoPeEaNoTurnoAntesUso = await this.calcularGastoPeEaNoTurnoAtual(
          tx,
          sessaoId,
          personagemSessaoId,
          turnoReferencia,
        );

        const bloqueadoPorLimiteTurno = this.deveBloquearPorLimitePeEaTurno(
          limitePeEaPorTurno,
          gastoPeEaNoTurnoAntesUso,
          custoTotalUso,
          custo.isUsoBaseSemEscalonamento,
        );
        if (bloqueadoPorLimiteTurno) {
          throw new BusinessException(
            'Limite de PE/EA por turno excedido para esta acao',
            'SESSAO_LIMITE_PEEA_EXCEDIDO',
            {
              campanhaId,
              sessaoId,
              personagemSessaoId,
              habilidadeTecnicaId: dto.habilidadeTecnicaId,
              variacaoHabilidadeId: custo.variacaoHabilidadeId,
              limitePeEaPorTurno,
              gastoPeEaNoTurnoAtual: gastoPeEaNoTurnoAntesUso,
              custoEA: custo.custoEA,
              custoPE: custo.custoPE,
              custoTotal: custoTotalUso,
              turnoReferencia,
              usoBaseSemEscalonamento: custo.isUsoBaseSemEscalonamento,
            },
          );
        }
      }
      const gastoPeEaNoTurnoAposUso = turnoReferencia
        ? gastoPeEaNoTurnoAntesUso + custoTotalUso
        : null;

      await tx.personagemCampanha.update({
        where: { id: personagemSessao.personagemCampanha.id },
        data: {
          eaAtual: recursosAtuais.eaAtual - custo.custoEA,
          peAtual: recursosAtuais.peAtual - custo.custoPE,
        },
      });

      if (
        custo.isSustentada &&
        ((custo.custoSustentacaoEA ?? 0) > 0 || (custo.custoSustentacaoPE ?? 0) > 0)
      ) {
        await tx.personagemSessaoHabilidadeSustentada.create({
          data: {
            sessaoId,
            personagemSessaoId,
            habilidadeTecnicaId: habilidade.id,
            variacaoHabilidadeId: custo.variacaoHabilidadeId,
            nomeHabilidade: habilidade.nome,
            nomeVariacao: custo.nomeVariacao,
            custoSustentacaoEA: custo.custoSustentacaoEA ?? 1,
            custoSustentacaoPE: custo.custoSustentacaoPE ?? 0,
            ativadaNaRodada: sessao.rodadaAtual,
            ultimaCobrancaRodada: sessao.rodadaAtual,
            criadaPorUsuarioId: usuarioId,
          },
        });
      }

      const cenaAtual = await this.obterCenaAtualSessaoTx(tx, sessaoId);
      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: cenaAtual.id,
          personagemAtorId: personagemSessaoId,
          tipoEvento: 'HABILIDADE_USADA',
          dados: this.jsonParaPersistencia({
            habilidadeTecnicaId: habilidade.id,
            habilidadeNome: habilidade.nome,
            variacaoHabilidadeId: custo.variacaoHabilidadeId,
            variacaoNome: custo.nomeVariacao,
            custoEA: custo.custoEA,
            custoPE: custo.custoPE,
            duracao: custo.duracao,
            sustentada: custo.isSustentada,
            custoSustentacaoEA: custo.custoSustentacaoEA,
            custoSustentacaoPE: custo.custoSustentacaoPE,
            acumulosSolicitados: custo.acumulosSolicitados,
            acumulosAplicados: custo.acumulosAplicados,
            acumulosMaximos: custo.acumulosMaximos,
            custoEscalonamentoEA: custo.custoEscalonamentoEA,
            custoEscalonamentoPE: custo.custoEscalonamentoPE,
            custoEscalonamentoTotalEA: custo.custoEscalonamentoTotalEA,
            custoEscalonamentoTotalPE: custo.custoEscalonamentoTotalPE,
            escalonamentoTipo: custo.escalonamentoTipo,
            escalonamentoEfeito: custo.escalonamentoEfeito,
            resumoEscalonamento: custo.resumoEscalonamento,
            usoBaseSemEscalonamento: custo.isUsoBaseSemEscalonamento,
            turnoReferencia,
            limitePeEaPorTurno: limitePeEaPorTurno > 0 ? limitePeEaPorTurno : null,
            gastoPeEaNoTurnoAntesUso: turnoReferencia
              ? gastoPeEaNoTurnoAntesUso
              : null,
            gastoPeEaNoTurnoAposUso,
            usadoPorId: usuarioId,
          }),
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async aplicarCondicaoSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    dto: AplicarCondicaoSessaoDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'aplicar condicao');

    await this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        select: {
          id: true,
          campanhaId: true,
          rodadaAtual: true,
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

      const condicao = await tx.condicao.findUnique({
        where: { id: dto.condicaoId },
        select: {
          id: true,
          nome: true,
          descricao: true,
        },
      });

      if (!condicao) {
        throw new BusinessException(
          'Condicao nao encontrada',
          'SESSAO_CONDICAO_NOT_FOUND',
          {
            campanhaId,
            sessaoId,
            condicaoId: dto.condicaoId,
          },
        );
      }

      const alvo = await this.resolverAlvoCondicaoSessaoTx(tx, sessaoId, dto);
      const duracao = this.resolverDuracaoCondicao(
        dto.duracaoModo,
        dto.duracaoValor,
      );
      const cenaAtualId = sessao.cenas[0]?.id ?? alvo.cenaId;

      if (!cenaAtualId) {
        throw new BusinessException(
          'Cena atual da sessao nao encontrada para aplicar condicao',
          'SESSAO_CENA_ATUAL_NOT_FOUND',
          {
            campanhaId,
            sessaoId,
          },
        );
      }

      const existente = await tx.condicaoPersonagemSessao.findFirst({
        where: {
          sessaoId,
          condicaoId: condicao.id,
          ativo: true,
          personagemSessaoId: alvo.personagemSessaoId,
          npcSessaoId: alvo.npcSessaoId,
        },
      });

      const snapshotAnterior = existente
        ? this.snapshotCondicaoSessao(existente)
        : null;

      const condicaoAtiva = existente
        ? await tx.condicaoPersonagemSessao.update({
            where: {
              id: existente.id,
            },
            data: {
              cenaId: alvo.cenaId ?? cenaAtualId,
              turnoAplicacao: sessao.rodadaAtual,
              duracaoTurnos: duracao.duracaoTurnos,
              duracaoModo: duracao.duracaoModo,
              duracaoValor: duracao.duracaoValor,
              restanteDuracao: duracao.restanteDuracao,
              ativo: true,
              automatica: false,
              chaveAutomacao: null,
              contadorTurnos: 0,
              origemDescricao: dto.origemDescricao?.trim() || null,
              observacao: dto.observacao?.trim() || null,
              removidaEm: null,
              motivoRemocao: null,
            },
          })
        : await tx.condicaoPersonagemSessao.create({
            data: {
              sessaoId,
              personagemSessaoId: alvo.personagemSessaoId,
              npcSessaoId: alvo.npcSessaoId,
              condicaoId: condicao.id,
              cenaId: alvo.cenaId ?? cenaAtualId,
              turnoAplicacao: sessao.rodadaAtual,
              duracaoTurnos: duracao.duracaoTurnos,
              duracaoModo: duracao.duracaoModo,
              duracaoValor: duracao.duracaoValor,
              restanteDuracao: duracao.restanteDuracao,
              ativo: true,
              automatica: false,
              origemDescricao: dto.origemDescricao?.trim() || null,
              observacao: dto.observacao?.trim() || null,
            },
          });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: alvo.cenaId ?? cenaAtualId,
          personagemAtorId: alvo.personagemSessaoId,
          tipoEvento: 'CONDICAO_APLICADA',
          dados: this.jsonParaPersistencia({
            condicaoSessaoId: condicaoAtiva.id,
            condicaoId: condicao.id,
            condicaoNome: condicao.nome,
            alvoTipo: dto.alvoTipo,
            personagemSessaoId: alvo.personagemSessaoId,
            npcSessaoId: alvo.npcSessaoId,
            alvoNome: alvo.nome,
            duracaoModo: duracao.duracaoModo,
            duracaoValor: duracao.duracaoValor,
            restanteDuracao: duracao.restanteDuracao,
            origemDescricao: dto.origemDescricao?.trim() || null,
            observacao: dto.observacao?.trim() || null,
            modoOperacao: existente ? 'ATUALIZADA' : 'CRIADA',
            snapshotAnterior,
            aplicadaPorId: usuarioId,
          }),
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async removerCondicaoSessao(
    campanhaId: number,
    sessaoId: number,
    condicaoSessaoId: number,
    usuarioId: number,
    motivo?: string,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, 'remover condicao');
    const motivoLimpo = motivo?.trim() || null;

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

      const condicaoSessao = await tx.condicaoPersonagemSessao.findFirst({
        where: {
          id: condicaoSessaoId,
          sessaoId,
          ativo: true,
        },
        include: {
          condicao: {
            select: {
              id: true,
              nome: true,
            },
          },
          personagemSessao: {
            include: {
              personagemCampanha: {
                select: {
                  nome: true,
                },
              },
            },
          },
          npcSessao: {
            select: {
              nomeExibicao: true,
            },
          },
        },
      });

      if (!condicaoSessao) {
        throw new BusinessException(
          'Condicao ativa nao encontrada nesta sessao',
          'SESSAO_CONDICAO_ATIVA_NOT_FOUND',
          {
            campanhaId,
            sessaoId,
            condicaoSessaoId,
          },
        );
      }

      const snapshot = this.snapshotCondicaoSessao(condicaoSessao);
      const alvoNome =
        condicaoSessao.personagemSessao?.personagemCampanha.nome ??
        condicaoSessao.npcSessao?.nomeExibicao ??
        'Alvo';

      await tx.condicaoPersonagemSessao.update({
        where: {
          id: condicaoSessao.id,
        },
        data: {
          ativo: false,
          removidaEm: new Date(),
          motivoRemocao: motivoLimpo,
        },
      });

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: condicaoSessao.cenaId,
          personagemAtorId: condicaoSessao.personagemSessaoId,
          tipoEvento: 'CONDICAO_REMOVIDA',
          dados: this.jsonParaPersistencia({
            condicaoSessaoId: condicaoSessao.id,
            condicaoId: condicaoSessao.condicao.id,
            condicaoNome: condicaoSessao.condicao.nome,
            personagemSessaoId: condicaoSessao.personagemSessaoId,
            npcSessaoId: condicaoSessao.npcSessaoId,
            alvoNome,
            motivo: motivoLimpo,
            snapshot,
            removidaPorId: usuarioId,
          }),
        },
      });
    });

    return this.buscarDetalheSessao(campanhaId, sessaoId, usuarioId);
  }

  async encerrarSustentacaoHabilidadeSessao(
    campanhaId: number,
    sessaoId: number,
    personagemSessaoId: number,
    sustentacaoId: number,
    usuarioId: number,
    motivo?: string,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    const motivoLimpo = motivo?.trim() || null;

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

      const personagemSessao = await tx.personagemSessao.findFirst({
        where: {
          id: personagemSessaoId,
          sessaoId,
        },
        select: {
          id: true,
          personagemCampanha: {
            select: {
              id: true,
              donoId: true,
            },
          },
        },
      });

      if (!personagemSessao) {
        throw new BusinessException(
          'Personagem nao encontrado nesta sessao',
          'SESSAO_PERSONAGEM_NOT_FOUND',
          {
            campanhaId,
            sessaoId,
            personagemSessaoId,
          },
        );
      }

      if (
        !acesso.ehMestre &&
        personagemSessao.personagemCampanha.donoId !== usuarioId
      ) {
        throw new CampanhaPersonagemEdicaoNegadaException(
          campanhaId,
          personagemSessao.personagemCampanha.id,
          usuarioId,
        );
      }

      const sustentacao = await tx.personagemSessaoHabilidadeSustentada.findFirst({
        where: {
          id: sustentacaoId,
          sessaoId,
          personagemSessaoId,
          ativa: true,
        },
        select: {
          id: true,
          nomeHabilidade: true,
          nomeVariacao: true,
          habilidadeTecnicaId: true,
          variacaoHabilidadeId: true,
          sessaoId: true,
          personagemSessaoId: true,
        },
      });

      if (!sustentacao) {
        throw new BusinessException(
          'Sustentacao ativa nao encontrada',
          'SESSAO_SUSTENTACAO_NOT_FOUND',
          {
            campanhaId,
            sessaoId,
            personagemSessaoId,
            sustentacaoId,
          },
        );
      }

      await tx.personagemSessaoHabilidadeSustentada.update({
        where: { id: sustentacao.id },
        data: {
          ativa: false,
          desativadaEm: new Date(),
          desativadaPorUsuarioId: usuarioId,
          motivoDesativacao: motivoLimpo,
        },
      });

      const cenaAtual = await this.obterCenaAtualSessaoTx(tx, sessaoId);
      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: cenaAtual.id,
          personagemAtorId: personagemSessaoId,
          tipoEvento: 'HABILIDADE_SUSTENTADA_ENCERRADA',
          dados: this.jsonParaPersistencia({
            sustentacaoId: sustentacao.id,
            habilidadeTecnicaId: sustentacao.habilidadeTecnicaId,
            habilidadeNome: sustentacao.nomeHabilidade,
            variacaoHabilidadeId: sustentacao.variacaoHabilidadeId,
            variacaoNome: sustentacao.nomeVariacao,
            encerradaPorId: usuarioId,
            motivo: motivoLimpo,
            motivoSistema: null,
          }),
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

  private normalizarTextoComparacao(valor: string | null | undefined): string {
    if (!valor) return '';
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private duracaoEhSustentada(duracao: string | null | undefined): boolean {
    const normalizado = this.normalizarTextoComparacao(duracao);
    return (
      normalizado.includes('SUSTENTAD') ||
      normalizado.includes('SUSTAIN') ||
      normalizado.includes('CONCENTRACAO')
    );
  }

  private normalizarCustoPositivo(
    valor: number | null | undefined,
    fallback: number,
  ): number {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      return Math.max(0, Math.trunc(fallback));
    }
    return Math.max(0, Math.trunc(valor));
  }

  private normalizarTipoEscalonamento(
    tipo: string | null | undefined,
    escalonamentoDano?: Prisma.JsonValue | null,
  ): string {
    const tipoNormalizado = (tipo ?? '').trim().toUpperCase();
    if (
      tipoNormalizado === 'DANO' ||
      tipoNormalizado === 'CURA' ||
      tipoNormalizado === 'NUMERICO' ||
      tipoNormalizado === 'REGRAS' ||
      tipoNormalizado === 'OUTRO'
    ) {
      return tipoNormalizado;
    }
    if (escalonamentoDano) {
      return 'DANO';
    }
    return 'OUTRO';
  }

  private resolverEfeitoEscalonamento(
    escalonamentoEfeito: Prisma.JsonValue | null | undefined,
    escalonamentoDano: Prisma.JsonValue | null | undefined,
  ): Prisma.JsonValue | null {
    if (
      escalonamentoEfeito &&
      typeof escalonamentoEfeito === 'object' &&
      !Array.isArray(escalonamentoEfeito)
    ) {
      return escalonamentoEfeito;
    }
    if (
      escalonamentoDano &&
      typeof escalonamentoDano === 'object' &&
      !Array.isArray(escalonamentoDano)
    ) {
      return escalonamentoDano;
    }
    return null;
  }

  private montarResumoEscalonamento(
    tipoEscalonamento: string,
    efeitoEscalonamento: Prisma.JsonValue | null,
    acumulos: number,
  ): string | null {
    if (acumulos <= 0 || !efeitoEscalonamento) return null;

    const efeito = this.extrairRegistro(efeitoEscalonamento);
    switch (tipoEscalonamento) {
      case 'DANO':
      case 'CURA': {
        const quantidade = this.lerInteiroRegistro(efeito, 'quantidade') ?? 0;
        const dado = this.lerTextoOpcionalRegistro(efeito, 'dado');
        const bonusFixo = this.lerInteiroRegistro(efeito, 'bonusFixo') ?? 0;
        const totalQuantidade = quantidade * acumulos;
        const totalBonusFixo = bonusFixo * acumulos;
        const partes: string[] = [];
        if (totalQuantidade > 0 && dado) partes.push(`${totalQuantidade}${dado}`);
        if (totalBonusFixo > 0) partes.push(`+${totalBonusFixo}`);
        if (partes.length === 0) return null;
        return `${tipoEscalonamento === 'CURA' ? 'Cura' : 'Dano'} escalonado: ${partes.join(' ')}`;
      }
      case 'NUMERICO': {
        const incremento = this.lerInteiroRegistro(efeito, 'incremento') ?? 0;
        const unidade = this.lerTextoOpcionalRegistro(efeito, 'unidade') ?? '';
        const label = this.lerTextoOpcionalRegistro(efeito, 'label') ?? 'Valor';
        if (incremento === 0) return null;
        const total = incremento * acumulos;
        return `${label}: +${total}${unidade ? ` ${unidade}` : ''}`;
      }
      case 'REGRAS': {
        const incrementoRegras =
          this.lerInteiroRegistro(efeito, 'incrementoRegras') ?? 1;
        const totalRegras = incrementoRegras * acumulos;
        return `Regras adicionais: +${totalRegras}`;
      }
      case 'OUTRO':
      default: {
        const descricao =
          this.lerTextoOpcionalRegistro(efeito, 'descricaoPorAcumulo') ??
          this.lerTextoOpcionalRegistro(efeito, 'descricao');
        if (!descricao) return null;
        return `${descricao} (x${acumulos})`;
      }
    }
  }

  private mapearHabilidadeTecnicaResumo(
    habilidade: HabilidadeTecnicaSessaoRaw,
    grausMap: Map<string, number>,
  ): HabilidadeTecnicaSessaoResumo | null {
    if (!atendeRequisitosGraus(habilidade.requisitos, grausMap)) {
      return null;
    }

    const tipoGrauEscalonamento = habilidade.grauTipoGrauCodigo?.trim() || null;
    const acumulosMaximosHabilidade =
      habilidade.escalonaPorGrau && tipoGrauEscalonamento
        ? Math.max(0, grausMap.get(tipoGrauEscalonamento) ?? 0)
        : 0;

    const variacoes = (habilidade.variacoes ?? [])
      .filter((variacao) => atendeRequisitosGraus(variacao.requisitos, grausMap))
      .sort((a, b) => a.ordem - b.ordem)
      .map((variacao): VariacaoTecnicaSessaoResumo => {
        const variacaoEscalonavel =
          typeof variacao.escalonaPorGrau === 'boolean'
            ? variacao.escalonaPorGrau
            : habilidade.escalonaPorGrau;

        const acumulosMaximosVariacao =
          variacaoEscalonavel && tipoGrauEscalonamento
            ? Math.max(0, grausMap.get(tipoGrauEscalonamento) ?? 0)
            : 0;

        const tipoEscalonamentoVariacao = this.normalizarTipoEscalonamento(
          variacao.escalonamentoTipo,
          variacao.escalonamentoDano,
        );
        const efeitoEscalonamentoVariacao = this.resolverEfeitoEscalonamento(
          variacao.escalonamentoEfeito,
          variacao.escalonamentoDano,
        );

        return {
          id: variacao.id,
          habilidadeTecnicaId: variacao.habilidadeTecnicaId,
          nome: variacao.nome,
          descricao: variacao.descricao,
          substituiCustos: variacao.substituiCustos,
          custoPE: variacao.custoPE,
          custoEA: variacao.custoEA,
          custoSustentacaoEA: variacao.custoSustentacaoEA,
          custoSustentacaoPE: variacao.custoSustentacaoPE,
          execucao: variacao.execucao,
          area: variacao.area,
          alcance: variacao.alcance,
          alvo: variacao.alvo,
          duracao: variacao.duracao,
          resistencia: variacao.resistencia,
          dtResistencia: variacao.dtResistencia,
          danoFlat: variacao.danoFlat,
          danoFlatTipo: variacao.danoFlatTipo,
          efeitoAdicional: variacao.efeitoAdicional,
          escalonaPorGrau: variacao.escalonaPorGrau,
          grauTipoGrauCodigo: tipoGrauEscalonamento,
          acumulosMaximos: acumulosMaximosVariacao,
          escalonamentoCustoEA: variacao.escalonamentoCustoEA,
          escalonamentoCustoPE: variacao.escalonamentoCustoPE,
          escalonamentoTipo: tipoEscalonamentoVariacao,
          escalonamentoEfeito: efeitoEscalonamentoVariacao,
          escalonamentoDano: variacao.escalonamentoDano,
          requisitos: variacao.requisitos,
          ordem: variacao.ordem,
        };
      });

    const tipoEscalonamentoHabilidade = this.normalizarTipoEscalonamento(
      habilidade.escalonamentoTipo,
      habilidade.escalonamentoDano,
    );
    const efeitoEscalonamentoHabilidade = this.resolverEfeitoEscalonamento(
      habilidade.escalonamentoEfeito,
      habilidade.escalonamentoDano,
    );

    return {
      id: habilidade.id,
      tecnicaId: habilidade.tecnicaId,
      codigo: habilidade.codigo,
      nome: habilidade.nome,
      descricao: habilidade.descricao,
      requisitos: habilidade.requisitos,
      execucao: habilidade.execucao,
      area: habilidade.area,
      alcance: habilidade.alcance,
      alvo: habilidade.alvo,
      duracao: habilidade.duracao,
      custoPE: habilidade.custoPE,
      custoEA: habilidade.custoEA,
      custoSustentacaoEA: habilidade.custoSustentacaoEA,
      custoSustentacaoPE: habilidade.custoSustentacaoPE,
      escalonaPorGrau: habilidade.escalonaPorGrau,
      grauTipoGrauCodigo: tipoGrauEscalonamento,
      acumulosMaximos: acumulosMaximosHabilidade,
      escalonamentoCustoEA: habilidade.escalonamentoCustoEA,
      escalonamentoCustoPE: habilidade.escalonamentoCustoPE,
      escalonamentoTipo: tipoEscalonamentoHabilidade,
      escalonamentoEfeito: efeitoEscalonamentoHabilidade,
      escalonamentoDano: habilidade.escalonamentoDano,
      danoFlat: habilidade.danoFlat,
      danoFlatTipo: habilidade.danoFlatTipo,
      efeito: habilidade.efeito,
      ordem: habilidade.ordem,
      variacoes,
    };
  }

  private filtrarTecnicaPorGrausSessao(
    tecnica: TecnicaSessaoRaw,
    grausMap: Map<string, number>,
  ): TecnicaSessaoResumo | null {
    if (
      tecnica.tipo === 'NAO_INATA' &&
      !atendeRequisitoBaseTecnicaNaoInata(tecnica.codigo, grausMap)
    ) {
      return null;
    }

    if (!atendeRequisitosGraus(tecnica.requisitos, grausMap)) {
      return null;
    }

    const habilidades = (tecnica.habilidades ?? [])
      .map((habilidade) => this.mapearHabilidadeTecnicaResumo(habilidade, grausMap))
      .filter((habilidade): habilidade is HabilidadeTecnicaSessaoResumo => !!habilidade)
      .sort((a, b) => a.ordem - b.ordem);

    return {
      id: tecnica.id,
      codigo: tecnica.codigo,
      nome: tecnica.nome,
      descricao: tecnica.descricao ?? '',
      tipo: tecnica.tipo,
      habilidades,
    };
  }

  private async listarTecnicasNaoInatasCatalogo(
    prismaLike: PrismaService | Prisma.TransactionClient,
  ): Promise<TecnicaSessaoRaw[]> {
    return prismaLike.tecnicaAmaldicoada.findMany({
      where: {
        tipo: 'NAO_INATA',
      },
      include: {
        habilidades: {
          include: {
            variacoes: {
              orderBy: { ordem: 'asc' },
            },
          },
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    }) as Promise<TecnicaSessaoRaw[]>;
  }

  private resolverTecnicasSessaoPersonagem(
    personagemCampanha: PersonagemCampanhaTecnicasSessaoRaw,
    tecnicasNaoInatasCatalogo: TecnicaSessaoRaw[] = [],
  ): {
    tecnicaInata: TecnicaSessaoResumo | null;
    tecnicasNaoInatas: TecnicaSessaoResumo[];
  } {
    const grausMap = this.montarMapaGrausPersonagemSessao(personagemCampanha);

    const tecnicaInata = personagemCampanha.tecnicaInata
      ? this.filtrarTecnicaPorGrausSessao(personagemCampanha.tecnicaInata, grausMap)
      : null;

    const mapaTecnicas = new Map<number, TecnicaSessaoRaw>();

    for (const tecnicaCatalogo of tecnicasNaoInatasCatalogo) {
      if (!tecnicaCatalogo || tecnicaCatalogo.tipo !== 'NAO_INATA') continue;
      mapaTecnicas.set(tecnicaCatalogo.id, tecnicaCatalogo);
    }

    // Compatibilidade com dados antigos que so possuem relacoes salvas.
    const tecnicasCampanha = personagemCampanha.tecnicasAprendidas ?? [];
    const tecnicasBase = personagemCampanha.personagemBase?.tecnicasAprendidas ?? [];
    for (const relacao of [...tecnicasCampanha, ...tecnicasBase]) {
      const tecnica = relacao?.tecnica;
      if (!tecnica || tecnica.tipo !== 'NAO_INATA') continue;
      if (!mapaTecnicas.has(tecnica.id)) {
        mapaTecnicas.set(tecnica.id, tecnica);
      }
    }

    const tecnicasNaoInatas = Array.from(mapaTecnicas.values())
      .map((tecnica) => this.filtrarTecnicaPorGrausSessao(tecnica, grausMap))
      .filter((tecnica): tecnica is TecnicaSessaoResumo => !!tecnica)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return {
      tecnicaInata,
      tecnicasNaoInatas,
    };
  }

  private buscarHabilidadeTecnicaDisponivel(
    tecnicasDisponiveis: {
      tecnicaInata: TecnicaSessaoResumo | null;
      tecnicasNaoInatas: TecnicaSessaoResumo[];
    },
    habilidadeTecnicaId: number,
  ): HabilidadeTecnicaSessaoResumo | null {
    const listaTecnicas = [
      ...(tecnicasDisponiveis.tecnicaInata
        ? [tecnicasDisponiveis.tecnicaInata]
        : []),
      ...tecnicasDisponiveis.tecnicasNaoInatas,
    ];

    for (const tecnica of listaTecnicas) {
      const habilidade = tecnica.habilidades.find(
        (item) => item.id === habilidadeTecnicaId,
      );
      if (habilidade) return habilidade;
    }

    return null;
  }

  private resolverCustoUsoHabilidade(
    habilidade: HabilidadeTecnicaSessaoResumo,
    grausMap: Map<string, number>,
    variacaoHabilidadeId?: number,
    acumulosSolicitados = 0,
  ): CustoHabilidadeResolvido {
    const variacaoSelecionada =
      typeof variacaoHabilidadeId === 'number'
        ? habilidade.variacoes.find((variacao) => variacao.id === variacaoHabilidadeId)
        : null;

    if (typeof variacaoHabilidadeId === 'number' && !variacaoSelecionada) {
      throw new BusinessException(
        'Variacao da habilidade nao encontrada',
        'SESSAO_VARIACAO_HABILIDADE_NOT_FOUND',
        {
          habilidadeTecnicaId: habilidade.id,
          variacaoHabilidadeId,
        },
      );
    }

    const acumulosNormalizados = Math.max(
      0,
      Math.trunc(Number.isFinite(acumulosSolicitados) ? acumulosSolicitados : 0),
    );

    const baseEA = this.normalizarCustoPositivo(habilidade.custoEA, 0);
    const basePE = this.normalizarCustoPositivo(habilidade.custoPE, 0);

    let custoEA = baseEA;
    let custoPE = basePE;
    let duracao = habilidade.duracao;
    let custoSustentacaoEA = habilidade.custoSustentacaoEA;
    let custoSustentacaoPE = habilidade.custoSustentacaoPE;
    let escalonaPorGrau = habilidade.escalonaPorGrau;
    let escalonamentoCustoEA = habilidade.escalonamentoCustoEA;
    let escalonamentoCustoPE = habilidade.escalonamentoCustoPE;
    let escalonamentoTipo = habilidade.escalonamentoTipo;
    let escalonamentoEfeito = habilidade.escalonamentoEfeito;
    let escalonamentoDano = habilidade.escalonamentoDano;
    let grauTipoGrauCodigo = habilidade.grauTipoGrauCodigo;

    if (variacaoSelecionada) {
      if (variacaoSelecionada.substituiCustos) {
        custoEA = this.normalizarCustoPositivo(variacaoSelecionada.custoEA, custoEA);
        custoPE = this.normalizarCustoPositivo(variacaoSelecionada.custoPE, custoPE);
      } else {
        custoEA += this.normalizarCustoPositivo(variacaoSelecionada.custoEA, 0);
        custoPE += this.normalizarCustoPositivo(variacaoSelecionada.custoPE, 0);
      }

      if (variacaoSelecionada.duracao) {
        duracao = variacaoSelecionada.duracao;
      }
      if (variacaoSelecionada.custoSustentacaoEA !== null) {
        custoSustentacaoEA = variacaoSelecionada.custoSustentacaoEA;
      }
      if (variacaoSelecionada.custoSustentacaoPE !== null) {
        custoSustentacaoPE = variacaoSelecionada.custoSustentacaoPE;
      }
      if (typeof variacaoSelecionada.escalonaPorGrau === 'boolean') {
        escalonaPorGrau = variacaoSelecionada.escalonaPorGrau;
      }
      if (typeof variacaoSelecionada.escalonamentoCustoEA === 'number') {
        escalonamentoCustoEA = variacaoSelecionada.escalonamentoCustoEA;
      }
      if (typeof variacaoSelecionada.escalonamentoCustoPE === 'number') {
        escalonamentoCustoPE = variacaoSelecionada.escalonamentoCustoPE;
      }
      if (typeof variacaoSelecionada.escalonamentoTipo === 'string') {
        escalonamentoTipo = variacaoSelecionada.escalonamentoTipo;
      }
      if (variacaoSelecionada.escalonamentoEfeito !== null) {
        escalonamentoEfeito = variacaoSelecionada.escalonamentoEfeito;
      }
      if (variacaoSelecionada.escalonamentoDano !== null) {
        escalonamentoDano = variacaoSelecionada.escalonamentoDano;
      }
    }

    const podeEscalonar = escalonaPorGrau === true;
    const tipoGrauEscalonamento = grauTipoGrauCodigo?.trim() || null;
    const acumulosMaximos =
      podeEscalonar && tipoGrauEscalonamento
        ? Math.max(0, grausMap.get(tipoGrauEscalonamento) ?? 0)
        : 0;

    if (acumulosNormalizados > 0 && !podeEscalonar) {
      throw new BusinessException(
        'Esta habilidade nao possui escalonamento por acumulos',
        'SESSAO_HABILIDADE_SEM_ESCALONAMENTO',
        {
          habilidadeTecnicaId: habilidade.id,
          variacaoHabilidadeId: variacaoSelecionada?.id ?? null,
          acumulosSolicitados: acumulosNormalizados,
        },
      );
    }

    if (acumulosNormalizados > acumulosMaximos) {
      throw new BusinessException(
        'Quantidade de acumulos excede o grau de aprimoramento permitido',
        'SESSAO_ACUMULO_EXCEDE_GRAU',
        {
          habilidadeTecnicaId: habilidade.id,
          variacaoHabilidadeId: variacaoSelecionada?.id ?? null,
          acumulosSolicitados: acumulosNormalizados,
          acumulosMaximos,
          tipoGrauCodigo: tipoGrauEscalonamento,
        },
      );
    }

    let custoEscalonamentoEA = 0;
    let custoEscalonamentoPE = 0;
    if (acumulosNormalizados > 0) {
      const fallbackEscalonamentoEA =
        tipoGrauEscalonamento === 'TECNICA_REVERSA' ? 2 : 1;
      custoEscalonamentoEA = this.normalizarCustoPositivo(
        escalonamentoCustoEA,
        fallbackEscalonamentoEA,
      );
      if (custoEscalonamentoEA <= 0) {
        custoEscalonamentoEA = fallbackEscalonamentoEA;
      }
      custoEA += custoEscalonamentoEA * acumulosNormalizados;

      custoEscalonamentoPE = this.normalizarCustoPositivo(escalonamentoCustoPE, 0);
      if (custoEscalonamentoPE > 0) {
        custoPE += custoEscalonamentoPE * acumulosNormalizados;
      }
    }

    const isUsoBaseSemEscalonamento =
      variacaoSelecionada === null && acumulosNormalizados === 0;

    const isSustentada = this.duracaoEhSustentada(duracao);
    const custoSustentacaoEANormalizado = isSustentada
      ? this.normalizarCustoPositivo(custoSustentacaoEA, 1)
      : null;
    const custoSustentacaoPENormalizado = isSustentada
      ? this.normalizarCustoPositivo(custoSustentacaoPE, 0)
      : null;
    const tipoEscalonamentoNormalizado = this.normalizarTipoEscalonamento(
      escalonamentoTipo,
      escalonamentoDano,
    );
    const efeitoEscalonamentoNormalizado = this.resolverEfeitoEscalonamento(
      escalonamentoEfeito,
      escalonamentoDano,
    );
    const resumoEscalonamento = this.montarResumoEscalonamento(
      tipoEscalonamentoNormalizado,
      efeitoEscalonamentoNormalizado,
      acumulosNormalizados,
    );

    return {
      nomeVariacao: variacaoSelecionada?.nome ?? null,
      variacaoHabilidadeId: variacaoSelecionada?.id ?? null,
      custoEA: this.normalizarCustoPositivo(custoEA, 0),
      custoPE: this.normalizarCustoPositivo(custoPE, 0),
      duracao: duracao ?? null,
      isSustentada,
      custoSustentacaoEA: custoSustentacaoEANormalizado,
      custoSustentacaoPE: custoSustentacaoPENormalizado,
      acumulosSolicitados: acumulosNormalizados,
      acumulosAplicados: acumulosNormalizados,
      acumulosMaximos,
      custoEscalonamentoEA,
      custoEscalonamentoPE,
      custoEscalonamentoTotalEA: custoEscalonamentoEA * acumulosNormalizados,
      custoEscalonamentoTotalPE: custoEscalonamentoPE * acumulosNormalizados,
      escalonamentoTipo: tipoEscalonamentoNormalizado,
      escalonamentoEfeito: efeitoEscalonamentoNormalizado,
      resumoEscalonamento,
      isUsoBaseSemEscalonamento,
    };
  }

  private montarMapaGrausPersonagemSessao(
    personagemCampanha: PersonagemCampanhaTecnicasSessaoRaw,
  ): Map<string, number> {
    const grausPreferenciais = personagemCampanha.grausAprimoramento?.length
      ? personagemCampanha.grausAprimoramento
      : (personagemCampanha.personagemBase?.grausAprimoramento ?? []);

    return montarMapaGraus(
      grausPreferenciais.map((grau) => ({
        tipoGrauCodigo: grau.tipoGrau.codigo,
        valor: grau.valor,
      })),
    );
  }

  private montarReferenciaTurnoAtualSessao(sessao: {
    cenaAtualTipo: string;
    rodadaAtual: number;
    indiceTurnoAtual: number;
  }): string | null {
    if (sessao.cenaAtualTipo === 'LIVRE') return null;
    return `${sessao.rodadaAtual}:${sessao.indiceTurnoAtual}`;
  }

  private async calcularGastoPeEaNoTurnoAtual(
    tx: Prisma.TransactionClient,
    sessaoId: number,
    personagemSessaoId: number,
    turnoReferencia: string,
  ): Promise<number> {
    const eventos = await tx.eventoSessao.findMany({
      where: {
        sessaoId,
        personagemAtorId: personagemSessaoId,
        tipoEvento: 'HABILIDADE_USADA',
      },
      orderBy: {
        id: 'desc',
      },
      take: 400,
      select: {
        dados: true,
      },
    });

    let gasto = 0;
    for (const evento of eventos) {
      const dados = this.extrairRegistro(evento.dados);
      const turnoEvento = this.lerTextoOpcionalRegistro(dados, 'turnoReferencia');
      if (turnoEvento !== turnoReferencia) continue;
      if (this.eventoJaFoiDesfeito(evento.dados)) continue;

      const custoEA = this.lerInteiroRegistro(dados, 'custoEA') ?? 0;
      const custoPE = this.lerInteiroRegistro(dados, 'custoPE') ?? 0;
      gasto += Math.max(0, custoEA) + Math.max(0, custoPE);
    }

    return gasto;
  }

  private deveBloquearPorLimitePeEaTurno(
    limitePeEaPorTurno: number,
    gastoPeEaNoTurnoAntesUso: number,
    custoTotalUso: number,
    isUsoBaseSemEscalonamento: boolean,
  ): boolean {
    const limiteNormalizado = Math.max(
      0,
      Math.trunc(Number.isFinite(limitePeEaPorTurno) ? limitePeEaPorTurno : 0),
    );
    if (limiteNormalizado <= 0) return false;

    const gastoAtual = Math.max(
      0,
      Math.trunc(
        Number.isFinite(gastoPeEaNoTurnoAntesUso) ? gastoPeEaNoTurnoAntesUso : 0,
      ),
    );
    const custoUso = Math.max(
      0,
      Math.trunc(Number.isFinite(custoTotalUso) ? custoTotalUso : 0),
    );
    const gastoTotal = gastoAtual + custoUso;

    // Regra especial: uso base sem escalonamento pode ultrapassar o limite
    // apenas quando for o primeiro uso do turno.
    if (isUsoBaseSemEscalonamento && gastoAtual === 0) {
      return false;
    }

    return gastoTotal > limiteNormalizado;
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

  private criarTokenParticipante(
    tipoParticipante: TipoParticipanteIniciativa,
    id: number,
  ): string {
    return `${tipoParticipante}:${id}`;
  }

  private lerTokenParticipante(
    token: string,
  ): { tipoParticipante: TipoParticipanteIniciativa; id: number } | null {
    const [tipo, idTexto] = token.split(':');
    if (tipo !== 'PERSONAGEM' && tipo !== 'NPC') {
      return null;
    }
    const id = Number(idTexto);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }
    return {
      tipoParticipante: tipo,
      id,
    };
  }

  private lerListaTokensRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): string[] | null {
    const valor = registro[chave];
    if (!Array.isArray(valor)) return null;

    const tokens: string[] = [];
    for (const item of valor) {
      if (typeof item !== 'string') {
        continue;
      }
      const token = item.trim();
      if (!this.lerTokenParticipante(token)) {
        continue;
      }
      if (!tokens.includes(token)) {
        tokens.push(token);
      }
    }

    return tokens.length > 0 ? tokens : null;
  }

  private lerOrdemIniciativaEvento(
    registro: Record<string, unknown>,
  ): OrdemIniciativaEvento | null {
    const ordemAnterior = this.lerListaTokensRegistro(registro, 'ordemAnterior');
    const ordemAtual = this.lerListaTokensRegistro(registro, 'ordemAtual');
    const indiceTurnoAnterior = this.lerInteiroRegistro(
      registro,
      'indiceTurnoAnterior',
    );
    const indiceTurnoNovo = this.lerInteiroRegistro(registro, 'indiceTurnoNovo');

    if (
      !ordemAnterior ||
      !ordemAtual ||
      indiceTurnoAnterior === null ||
      indiceTurnoNovo === null
    ) {
      return null;
    }

    return {
      ordemAnterior,
      ordemAtual,
      indiceTurnoAnterior,
      indiceTurnoNovo,
    };
  }

  private montarParticipantesIniciativa(
    personagens: Array<{
      id: number;
      personagemCampanha: {
        id: number;
        nome: string;
        donoId: number;
        dono: {
          apelido: string;
        };
      };
    }>,
    npcs: Array<{
      id: number;
      nomeExibicao: string;
    }>,
    ehMestre: boolean,
    usuarioId: number,
  ): ParticipanteIniciativa[] {
    const participantesPersonagens: ParticipanteIniciativa[] = personagens.map(
      (personagem) => {
        const token = this.criarTokenParticipante('PERSONAGEM', personagem.id);
        const podeEditar = ehMestre || personagem.personagemCampanha.donoId === usuarioId;

        return {
          tipoParticipante: 'PERSONAGEM',
          token,
          personagemSessaoId: personagem.id,
          npcSessaoId: null,
          personagemCampanhaId: personagem.personagemCampanha.id,
          donoId: personagem.personagemCampanha.donoId,
          nomeJogador: personagem.personagemCampanha.dono.apelido,
          nomePersonagem: personagem.personagemCampanha.nome,
          podeEditar,
        };
      },
    );

    const participantesNpcs: ParticipanteIniciativa[] = npcs.map((npc) => ({
      tipoParticipante: 'NPC',
      token: this.criarTokenParticipante('NPC', npc.id),
      personagemSessaoId: null,
      npcSessaoId: npc.id,
      personagemCampanhaId: null,
      donoId: null,
      nomeJogador: null,
      nomePersonagem: npc.nomeExibicao,
      podeEditar: ehMestre,
    }));

    return [...participantesPersonagens, ...participantesNpcs];
  }

  private aplicarOrdemIniciativaPersistida(
    participantesPadrao: ParticipanteIniciativa[],
    tokensPersistidos: string[] | null,
  ): ParticipanteIniciativa[] {
    if (!tokensPersistidos || tokensPersistidos.length === 0) {
      return participantesPadrao;
    }

    const porToken = new Map(
      participantesPadrao.map((participante) => [participante.token, participante]),
    );
    const tokensUsados = new Set<string>();
    const ordenados: ParticipanteIniciativa[] = [];

    for (const token of tokensPersistidos) {
      const participante = porToken.get(token);
      if (!participante || tokensUsados.has(token)) continue;
      tokensUsados.add(token);
      ordenados.push(participante);
    }

    for (const participante of participantesPadrao) {
      if (tokensUsados.has(participante.token)) continue;
      ordenados.push(participante);
    }

    return ordenados;
  }

  private validarEOrdenarIniciativaPorTokens(
    participantesAtuais: ParticipanteIniciativa[],
    tokensRecebidos: string[],
    sessaoId: number,
    campanhaId: number,
  ): ParticipanteIniciativa[] {
    const tokensAtuais = participantesAtuais.map((participante) => participante.token);
    const mapaAtuais = new Map(
      participantesAtuais.map((participante) => [participante.token, participante]),
    );
    const tokensRecebidosUnicos = Array.from(new Set(tokensRecebidos));

    if (
      tokensRecebidosUnicos.length !== tokensAtuais.length ||
      tokensRecebidosUnicos.some((token) => !mapaAtuais.has(token))
    ) {
      throw new SessaoOrdemIniciativaInvalidaException(sessaoId, campanhaId);
    }

    return tokensRecebidosUnicos.map((token) => mapaAtuais.get(token)!);
  }

  private async obterOrdemIniciativaPersistida(
    tx: Prisma.TransactionClient | PrismaService,
    sessaoId: number,
  ): Promise<string[] | null> {
    const eventos = await tx.eventoSessao.findMany({
      where: {
        sessaoId,
        tipoEvento: {
          in: ['ORDEM_INICIATIVA_ATUALIZADA', 'ORDEM_INICIATIVA_DESFEITA'],
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: 120,
      select: {
        dados: true,
      },
    });

    for (const evento of eventos) {
      if (this.eventoJaFoiDesfeito(evento.dados)) continue;
      const dados = this.extrairRegistro(evento.dados);
      const tokens =
        this.lerListaTokensRegistro(dados, 'ordemAtual') ??
        this.lerListaTokensRegistro(dados, 'ordem');
      if (tokens && tokens.length > 0) {
        return tokens;
      }
    }

    return null;
  }

  private async carregarParticipantesIniciativa(
    tx: Prisma.TransactionClient,
    sessaoId: number,
    cenaAtualId: number,
    ehMestre: boolean,
    usuarioId: number,
  ): Promise<ParticipanteIniciativa[]> {
    const [personagens, npcs] = await Promise.all([
      tx.personagemSessao.findMany({
        where: { sessaoId },
        orderBy: { id: 'asc' },
        select: {
          id: true,
          personagemCampanha: {
            select: {
              id: true,
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
      }),
      tx.npcAmeacaSessao.findMany({
        where: {
          sessaoId,
          cenaId: cenaAtualId,
        },
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          nomeExibicao: true,
        },
      }),
    ]);

    return this.montarParticipantesIniciativa(
      personagens,
      npcs,
      ehMestre,
      usuarioId,
    );
  }

  private async aplicarAjusteTurnoSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    acao: 'AVANCAR' | 'VOLTAR' | 'PULAR',
  ): Promise<void> {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso, acao === 'VOLTAR' ? 'voltar turno' : acao === 'PULAR' ? 'pular turno' : 'avancar turno');

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

      const cenaAtual = await this.obterCenaAtualSessaoTx(tx, sessaoId);
      const participantesPadrao = await this.carregarParticipantesIniciativa(
        tx,
        sessaoId,
        cenaAtual.id,
        acesso.ehMestre,
        usuarioId,
      );
      const ordemPersistida = await this.obterOrdemIniciativaPersistida(tx, sessaoId);
      const participantes = this.aplicarOrdemIniciativaPersistida(
        participantesPadrao,
        ordemPersistida,
      );

      if (participantes.length === 0) {
        return;
      }

      const indiceAnterior = this.clampIndiceTurno(
        sessao.indiceTurnoAtual,
        participantes.length,
      );
      let indiceNovo = indiceAnterior;
      let rodadaNova = sessao.rodadaAtual;

      if (acao === 'VOLTAR') {
        indiceNovo =
          (indiceAnterior - 1 + participantes.length) % participantes.length;
        rodadaNova = this.clampNumero(
          sessao.rodadaAtual - (indiceAnterior === 0 ? 1 : 0),
          1,
          Number.MAX_SAFE_INTEGER,
        );
      } else {
        indiceNovo = (indiceAnterior + 1) % participantes.length;
        rodadaNova = sessao.rodadaAtual + (indiceNovo === 0 ? 1 : 0);
      }

      await tx.sessao.update({
        where: { id: sessaoId },
        data: {
          indiceTurnoAtual: indiceNovo,
          rodadaAtual: rodadaNova,
        },
      });

      if (rodadaNova > sessao.rodadaAtual) {
        const sustentacoesAtivas = await tx.personagemSessaoHabilidadeSustentada.findMany({
          where: {
            sessaoId,
            ativa: true,
          },
          orderBy: {
            id: 'asc',
          },
          select: {
            id: true,
            sessaoId: true,
            personagemSessaoId: true,
            nomeHabilidade: true,
            nomeVariacao: true,
            custoSustentacaoEA: true,
            custoSustentacaoPE: true,
            ultimaCobrancaRodada: true,
            habilidadeTecnicaId: true,
            variacaoHabilidadeId: true,
            personagemSessao: {
              select: {
                personagemCampanha: {
                  select: {
                    id: true,
                    eaAtual: true,
                    peAtual: true,
                  },
                },
              },
            },
          },
        });

        const eaAtualPorPersonagemCampanha = new Map<number, number>();
        const peAtualPorPersonagemCampanha = new Map<number, number>();

        for (const sustentacao of sustentacoesAtivas) {
          if (sustentacao.ultimaCobrancaRodada >= rodadaNova) {
            continue;
          }

          const personagemCampanhaId =
            sustentacao.personagemSessao.personagemCampanha.id;
          const eaAtual =
            eaAtualPorPersonagemCampanha.get(personagemCampanhaId) ??
            sustentacao.personagemSessao.personagemCampanha.eaAtual;
          const peAtual =
            peAtualPorPersonagemCampanha.get(personagemCampanhaId) ??
            sustentacao.personagemSessao.personagemCampanha.peAtual;
          const custoSustentacaoEA = this.normalizarCustoPositivo(
            sustentacao.custoSustentacaoEA,
            1,
          );
          const custoSustentacaoPE = this.normalizarCustoPositivo(
            sustentacao.custoSustentacaoPE,
            0,
          );

          if (eaAtual >= custoSustentacaoEA && peAtual >= custoSustentacaoPE) {
            const novoEa = eaAtual - custoSustentacaoEA;
            const novoPe = peAtual - custoSustentacaoPE;
            eaAtualPorPersonagemCampanha.set(personagemCampanhaId, novoEa);
            peAtualPorPersonagemCampanha.set(personagemCampanhaId, novoPe);

            await tx.personagemCampanha.update({
              where: { id: personagemCampanhaId },
              data: {
                eaAtual: novoEa,
                peAtual: novoPe,
              },
            });

            await tx.personagemSessaoHabilidadeSustentada.update({
              where: {
                id: sustentacao.id,
              },
              data: {
                ultimaCobrancaRodada: rodadaNova,
              },
            });

            await tx.eventoSessao.create({
              data: {
                sessaoId,
                cenaId: cenaAtual.id,
                personagemAtorId: sustentacao.personagemSessaoId,
                tipoEvento: 'HABILIDADE_SUSTENTADA_COBRADA',
                dados: this.jsonParaPersistencia({
                  sustentacaoId: sustentacao.id,
                  habilidadeTecnicaId: sustentacao.habilidadeTecnicaId,
                  variacaoHabilidadeId: sustentacao.variacaoHabilidadeId,
                  habilidadeNome: sustentacao.nomeHabilidade,
                  variacaoNome: sustentacao.nomeVariacao,
                  custoEA: custoSustentacaoEA,
                  custoPE: custoSustentacaoPE,
                  rodada: rodadaNova,
                }),
              },
            });
          } else {
            const recursosInsuficientes: string[] = [];
            if (eaAtual < custoSustentacaoEA) recursosInsuficientes.push('EA');
            if (peAtual < custoSustentacaoPE) recursosInsuficientes.push('PE');
            const motivoSistema = `${recursosInsuficientes.join(' e ')} insuficiente(s) para sustentar habilidade na rodada ${rodadaNova}.`;
            await tx.personagemSessaoHabilidadeSustentada.update({
              where: {
                id: sustentacao.id,
              },
              data: {
                ativa: false,
                desativadaEm: new Date(),
                desativadaPorUsuarioId: null,
                motivoDesativacao: motivoSistema,
              },
            });

            await tx.eventoSessao.create({
              data: {
                sessaoId,
                cenaId: cenaAtual.id,
                personagemAtorId: sustentacao.personagemSessaoId,
                tipoEvento: 'HABILIDADE_SUSTENTADA_ENCERRADA',
                dados: this.jsonParaPersistencia({
                  sustentacaoId: sustentacao.id,
                  habilidadeTecnicaId: sustentacao.habilidadeTecnicaId,
                  variacaoHabilidadeId: sustentacao.variacaoHabilidadeId,
                  habilidadeNome: sustentacao.nomeHabilidade,
                  variacaoNome: sustentacao.nomeVariacao,
                  encerradaPorId: null,
                  motivo: null,
                  motivoSistema,
                  rodada: rodadaNova,
                }),
              },
            });
          }
        }
      }

      if (acao !== 'VOLTAR') {
        await this.processarCondicoesNoAvancoTurnoTx(tx, {
          sessaoId,
          cenaId: cenaAtual.id,
          rodadaAnterior: sessao.rodadaAtual,
          rodadaNova,
          participanteTurnoNovo: participantes[indiceNovo] ?? null,
        });
      }

      const tipoEvento =
        acao === 'AVANCAR'
          ? 'TURNO_AVANCADO'
          : acao === 'VOLTAR'
            ? 'TURNO_RECUADO'
            : 'TURNO_PULADO';

      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: cenaAtual.id,
          tipoEvento,
          dados: this.jsonParaPersistencia({
            indiceAnterior,
            indiceNovo,
            rodadaAnterior: sessao.rodadaAtual,
            rodadaNova,
            tokenAnterior: participantes[indiceAnterior]?.token ?? null,
            tokenNovo: participantes[indiceNovo]?.token ?? null,
            ...(acao === 'PULAR'
              ? { tokenPulado: participantes[indiceAnterior]?.token ?? null }
              : {}),
            ajustadoPorId: usuarioId,
          }),
        },
      });
    });
  }

  private mapearCondicoesAtivasSessao(
    condicoes: Array<{
      id: number;
      condicaoId: number;
      turnoAplicacao: number;
      duracaoModo: string;
      duracaoValor: number | null;
      restanteDuracao: number | null;
      automatica: boolean;
      chaveAutomacao: string | null;
      contadorTurnos: number;
      origemDescricao: string | null;
      observacao: string | null;
      condicao: {
        nome: string;
        descricao: string;
      };
    }>,
  ): CondicaoAtivaSessaoResumo[] {
    return condicoes.map((condicaoAtiva) => ({
      id: condicaoAtiva.id,
      condicaoId: condicaoAtiva.condicaoId,
      nome: condicaoAtiva.condicao.nome,
      descricao: condicaoAtiva.condicao.descricao,
      automatica: condicaoAtiva.automatica,
      chaveAutomacao: condicaoAtiva.chaveAutomacao,
      duracaoModo: condicaoAtiva.duracaoModo,
      duracaoValor: condicaoAtiva.duracaoValor,
      restanteDuracao: condicaoAtiva.restanteDuracao,
      contadorTurnos: condicaoAtiva.contadorTurnos,
      origemDescricao: condicaoAtiva.origemDescricao,
      observacao: condicaoAtiva.observacao,
      turnoAplicacao: condicaoAtiva.turnoAplicacao,
    }));
  }

  private snapshotCondicaoSessao(condicao: {
    id: number;
    sessaoId: number | null;
    personagemSessaoId: number | null;
    npcSessaoId: number | null;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos: number | null;
    duracaoModo: string;
    duracaoValor: number | null;
    restanteDuracao: number | null;
    ativo: boolean;
    automatica: boolean;
    chaveAutomacao: string | null;
    contadorTurnos: number;
    origemDescricao: string | null;
    observacao: string | null;
    removidaEm?: Date | null;
    motivoRemocao?: string | null;
  }) {
    return {
      id: condicao.id,
      sessaoId: condicao.sessaoId,
      personagemSessaoId: condicao.personagemSessaoId,
      npcSessaoId: condicao.npcSessaoId,
      condicaoId: condicao.condicaoId,
      cenaId: condicao.cenaId,
      turnoAplicacao: condicao.turnoAplicacao,
      duracaoTurnos: condicao.duracaoTurnos,
      duracaoModo: condicao.duracaoModo,
      duracaoValor: condicao.duracaoValor,
      restanteDuracao: condicao.restanteDuracao,
      ativo: condicao.ativo,
      automatica: condicao.automatica,
      chaveAutomacao: condicao.chaveAutomacao,
      contadorTurnos: condicao.contadorTurnos,
      origemDescricao: condicao.origemDescricao,
      observacao: condicao.observacao,
      removidaEm: condicao.removidaEm
        ? condicao.removidaEm.toISOString()
        : null,
      motivoRemocao: condicao.motivoRemocao ?? null,
    };
  }

  private resolverDuracaoCondicao(
    duracaoModo: string | undefined,
    duracaoValor: number | undefined,
  ): {
    duracaoModo: string;
    duracaoValor: number | null;
    restanteDuracao: number | null;
    duracaoTurnos: number | null;
  } {
    const modo = this.normalizarTextoComparacao(duracaoModo) || CONDICAO_DURACAO_MODOS.ATE_REMOVER;
    if (
      modo !== CONDICAO_DURACAO_MODOS.ATE_REMOVER &&
      modo !== CONDICAO_DURACAO_MODOS.RODADAS &&
      modo !== CONDICAO_DURACAO_MODOS.TURNOS_ALVO
    ) {
      throw new BusinessException(
        'Modo de duracao de condicao invalido',
        'SESSAO_CONDICAO_DURACAO_INVALIDA',
        { duracaoModo },
      );
    }

    if (modo === CONDICAO_DURACAO_MODOS.ATE_REMOVER) {
      return {
        duracaoModo: modo,
        duracaoValor: null,
        restanteDuracao: null,
        duracaoTurnos: null,
      };
    }

    const valor = Number.isFinite(duracaoValor ?? NaN)
      ? Math.max(1, Math.trunc(duracaoValor as number))
      : null;
    if (!valor) {
      throw new BusinessException(
        'Duracao numerica da condicao e obrigatoria',
        'SESSAO_CONDICAO_DURACAO_VALOR_REQUIRED',
        { duracaoModo: modo },
      );
    }

    return {
      duracaoModo: modo,
      duracaoValor: valor,
      restanteDuracao: valor,
      duracaoTurnos: valor,
    };
  }

  private async resolverAlvoCondicaoSessaoTx(
    tx: Prisma.TransactionClient,
    sessaoId: number,
    dto: AplicarCondicaoSessaoDto,
  ): Promise<{
    personagemSessaoId: number | null;
    npcSessaoId: number | null;
    cenaId: number | null;
    nome: string;
  }> {
    if (dto.alvoTipo === 'PERSONAGEM') {
      const personagem = await tx.personagemSessao.findFirst({
        where: {
          id: dto.personagemSessaoId,
          sessaoId,
        },
        select: {
          id: true,
          cenaId: true,
          personagemCampanha: {
            select: {
              nome: true,
            },
          },
        },
      });

      if (!personagem) {
        throw new BusinessException(
          'Personagem da sessao nao encontrado para aplicar condicao',
          'SESSAO_CONDICAO_ALVO_PERSONAGEM_NOT_FOUND',
          {
            sessaoId,
            personagemSessaoId: dto.personagemSessaoId,
          },
        );
      }

      return {
        personagemSessaoId: personagem.id,
        npcSessaoId: null,
        cenaId: personagem.cenaId,
        nome: personagem.personagemCampanha.nome,
      };
    }

    const npc = await tx.npcAmeacaSessao.findFirst({
      where: {
        id: dto.npcSessaoId,
        sessaoId,
      },
      select: {
        id: true,
        cenaId: true,
        nomeExibicao: true,
      },
    });

    if (!npc) {
      throw new BusinessException(
        'NPC/Ameaca da sessao nao encontrado para aplicar condicao',
        'SESSAO_CONDICAO_ALVO_NPC_NOT_FOUND',
        {
          sessaoId,
          npcSessaoId: dto.npcSessaoId,
        },
      );
    }

    return {
      personagemSessaoId: null,
      npcSessaoId: npc.id,
      cenaId: npc.cenaId,
      nome: npc.nomeExibicao,
    };
  }

  private async sincronizarCondicoesAutomaticasSessao(sessaoId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.sincronizarCondicoesAutomaticasSessaoTx(tx, sessaoId);
    });
  }

  private async obterMapaCondicoesSistemaTx(tx: Prisma.TransactionClient) {
    const condicaoDelegate = (
      tx as Prisma.TransactionClient & {
        condicao?: { findMany?: typeof tx.condicao.findMany };
      }
    ).condicao;
    if (!condicaoDelegate?.findMany) {
      return {
        machucadoId: null,
        morrendoId: null,
        caidoId: null,
        enlouquecendoId: null,
        insanoId: null,
        mortoId: null,
      };
    }

    const condicoes = await condicaoDelegate.findMany({
      select: {
        id: true,
        nome: true,
      },
    });

    const porNomeNormalizado = new Map<string, number>();
    for (const condicao of condicoes) {
      porNomeNormalizado.set(this.normalizarTextoComparacao(condicao.nome), condicao.id);
    }

    const resolverPorAliases = (aliases: string[]): number | null => {
      for (const alias of aliases) {
        const condicaoId = porNomeNormalizado.get(this.normalizarTextoComparacao(alias));
        if (condicaoId) return condicaoId;
      }
      return null;
    };

    return {
      machucadoId: resolverPorAliases(['MACHUCADO']),
      morrendoId: resolverPorAliases(['MORRENDO']),
      caidoId: resolverPorAliases(['CAIDO']),
      enlouquecendoId: resolverPorAliases(['ENLOUQUECENDO']),
      insanoId: resolverPorAliases(['INSANO', 'LOUCO', 'ENLOUQUECIDO']),
      mortoId: resolverPorAliases(['MORTO', 'MORTA', 'MORTE']),
    };
  }

  private async sincronizarCondicaoAutomaticaAlvoTx(
    tx: Prisma.TransactionClient,
    args: {
      sessaoId: number;
      cenaId: number;
      rodadaAtual: number;
      personagemSessaoId: number | null;
      npcSessaoId: number | null;
      condicaoId: number | null;
      chaveAutomacao: string;
      ativa: boolean;
      origemDescricao: string;
    },
  ): Promise<void> {
    if (!args.condicaoId) return;

    const existente = await tx.condicaoPersonagemSessao.findFirst({
      where: {
        sessaoId: args.sessaoId,
        condicaoId: args.condicaoId,
        personagemSessaoId: args.personagemSessaoId,
        npcSessaoId: args.npcSessaoId,
        automatica: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (args.ativa) {
      if (existente) {
        if (!existente.ativo) {
          await tx.condicaoPersonagemSessao.update({
            where: { id: existente.id },
            data: {
              ativo: true,
              removidaEm: null,
              motivoRemocao: null,
              cenaId: args.cenaId,
              turnoAplicacao: args.rodadaAtual,
            },
          });
        }
        return;
      }

      await tx.condicaoPersonagemSessao.create({
        data: {
          sessaoId: args.sessaoId,
          personagemSessaoId: args.personagemSessaoId,
          npcSessaoId: args.npcSessaoId,
          condicaoId: args.condicaoId,
          cenaId: args.cenaId,
          turnoAplicacao: args.rodadaAtual,
          duracaoModo: CONDICAO_DURACAO_MODOS.ATE_REMOVER,
          ativo: true,
          automatica: true,
          chaveAutomacao: args.chaveAutomacao,
          contadorTurnos: 0,
          origemDescricao: args.origemDescricao,
          observacao: null,
        },
      });
      return;
    }

    if (existente?.ativo) {
      await tx.condicaoPersonagemSessao.update({
        where: { id: existente.id },
        data: {
          ativo: false,
          removidaEm: new Date(),
          motivoRemocao: 'Condicao automatica removida por mudanca de estado.',
        },
      });
    }
  }

  private async sincronizarCondicoesAutomaticasSessaoTx(
    tx: Prisma.TransactionClient,
    sessaoId: number,
  ): Promise<void> {
    const sessao = await tx.sessao.findUnique({
      where: { id: sessaoId },
      select: {
        id: true,
        rodadaAtual: true,
        cenas: {
          select: { id: true },
          orderBy: { id: 'desc' },
          take: 1,
        },
        personagens: {
          select: {
            id: true,
            cenaId: true,
            personagemCampanha: {
              select: {
                pvAtual: true,
                pvMax: true,
                sanAtual: true,
              },
            },
          },
        },
        npcs: {
          select: {
            id: true,
            cenaId: true,
            pontosVidaAtual: true,
            pontosVidaMax: true,
          },
        },
      },
    });

    if (!sessao) return;

    const mapaSistema = await this.obterMapaCondicoesSistemaTx(tx);
    const cenas = Array.isArray(sessao.cenas) ? sessao.cenas : [];
    const personagens = Array.isArray(sessao.personagens)
      ? sessao.personagens
      : [];
    const npcs = Array.isArray(sessao.npcs) ? sessao.npcs : [];
    const cenaAtualId = cenas[0]?.id ?? null;

    for (const personagem of personagens) {
      const pvAtual = personagem.personagemCampanha.pvAtual;
      const pvMax = Math.max(1, personagem.personagemCampanha.pvMax);
      const sanAtual = personagem.personagemCampanha.sanAtual;
      const machucado = pvAtual > 0 && pvAtual <= Math.floor(pvMax / 2);
      const morrendo = pvAtual <= 0;
      const caido = pvAtual <= 0;
      const enlouquecendo = sanAtual <= 0;
      const cenaId = personagem.cenaId ?? cenaAtualId;
      if (!cenaId) continue;

      await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
        sessaoId,
        cenaId,
        rodadaAtual: sessao.rodadaAtual,
        personagemSessaoId: personagem.id,
        npcSessaoId: null,
        condicaoId: mapaSistema.machucadoId,
        chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.MACHUCADO,
        ativa: machucado,
        origemDescricao: 'Automatica por PV <= metade.',
      });

      await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
        sessaoId,
        cenaId,
        rodadaAtual: sessao.rodadaAtual,
        personagemSessaoId: personagem.id,
        npcSessaoId: null,
        condicaoId: mapaSistema.morrendoId,
        chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.MORRENDO,
        ativa: morrendo,
        origemDescricao: 'Automatica por PV <= 0.',
      });

      await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
        sessaoId,
        cenaId,
        rodadaAtual: sessao.rodadaAtual,
        personagemSessaoId: personagem.id,
        npcSessaoId: null,
        condicaoId: mapaSistema.caidoId,
        chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.CAIDO,
        ativa: caido,
        origemDescricao: 'Automatica por PV <= 0.',
      });

      await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
        sessaoId,
        cenaId,
        rodadaAtual: sessao.rodadaAtual,
        personagemSessaoId: personagem.id,
        npcSessaoId: null,
        condicaoId: mapaSistema.enlouquecendoId,
        chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.ENLOUQUECENDO,
        ativa: enlouquecendo,
        origemDescricao: 'Automatica por SAN <= 0.',
      });
    }

    for (const npc of npcs) {
      const pvAtual = npc.pontosVidaAtual;
      const pvMax = Math.max(1, npc.pontosVidaMax);
      const machucado = pvAtual > 0 && pvAtual <= Math.floor(pvMax / 2);
      const morrendo = pvAtual <= 0;
      const caido = pvAtual <= 0;
      const cenaId = npc.cenaId ?? cenaAtualId;
      if (!cenaId) continue;

      await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
        sessaoId,
        cenaId,
        rodadaAtual: sessao.rodadaAtual,
        personagemSessaoId: null,
        npcSessaoId: npc.id,
        condicaoId: mapaSistema.machucadoId,
        chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.MACHUCADO,
        ativa: machucado,
        origemDescricao: 'Automatica por PV <= metade.',
      });

      await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
        sessaoId,
        cenaId,
        rodadaAtual: sessao.rodadaAtual,
        personagemSessaoId: null,
        npcSessaoId: npc.id,
        condicaoId: mapaSistema.morrendoId,
        chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.MORRENDO,
        ativa: morrendo,
        origemDescricao: 'Automatica por PV <= 0.',
      });

      await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
        sessaoId,
        cenaId,
        rodadaAtual: sessao.rodadaAtual,
        personagemSessaoId: null,
        npcSessaoId: npc.id,
        condicaoId: mapaSistema.caidoId,
        chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.CAIDO,
        ativa: caido,
        origemDescricao: 'Automatica por PV <= 0.',
      });
    }
  }

  private async processarCondicoesNoAvancoTurnoTx(
    tx: Prisma.TransactionClient,
    args: {
      sessaoId: number;
      cenaId: number;
      rodadaAnterior: number;
      rodadaNova: number;
      participanteTurnoNovo: ParticipanteIniciativa | null;
    },
  ): Promise<void> {
    const { sessaoId, cenaId, rodadaAnterior, rodadaNova, participanteTurnoNovo } =
      args;
    if (!participanteTurnoNovo) return;

    await this.sincronizarCondicoesAutomaticasSessaoTx(tx, sessaoId);

    const condicaoSessaoDelegate = (
      tx as Prisma.TransactionClient & {
        condicaoPersonagemSessao?: {
          findMany?: typeof tx.condicaoPersonagemSessao.findMany;
          update?: typeof tx.condicaoPersonagemSessao.update;
        };
      }
    ).condicaoPersonagemSessao;
    if (!condicaoSessaoDelegate?.findMany || !condicaoSessaoDelegate.update) {
      return;
    }

    if (rodadaNova > rodadaAnterior) {
      const condicoesPorRodada = await condicaoSessaoDelegate.findMany({
        where: {
          sessaoId,
          ativo: true,
          automatica: false,
          duracaoModo: CONDICAO_DURACAO_MODOS.RODADAS,
          restanteDuracao: { not: null },
        },
        orderBy: { id: 'asc' },
      });

      for (const condicao of condicoesPorRodada) {
        const restanteAnterior = Math.max(0, condicao.restanteDuracao ?? 0);
        const restanteNovo = Math.max(0, restanteAnterior - 1);
        const expirada = restanteNovo <= 0;

        await condicaoSessaoDelegate.update({
          where: { id: condicao.id },
          data: {
            restanteDuracao: expirada ? 0 : restanteNovo,
            ativo: !expirada,
            removidaEm: expirada ? new Date() : null,
            motivoRemocao: expirada ? 'Duracao em rodadas encerrada.' : null,
          },
        });

        if (expirada) {
          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: condicao.cenaId ?? cenaId,
              personagemAtorId: condicao.personagemSessaoId,
              tipoEvento: 'CONDICAO_EXPIRADA',
              dados: this.jsonParaPersistencia({
                condicaoSessaoId: condicao.id,
                personagemSessaoId: condicao.personagemSessaoId,
                npcSessaoId: condicao.npcSessaoId,
                modo: CONDICAO_DURACAO_MODOS.RODADAS,
              }),
            },
          });
        }
      }
    }

    if (participanteTurnoNovo.tipoParticipante === 'PERSONAGEM') {
      const personagemSessaoId = participanteTurnoNovo.personagemSessaoId;
      if (personagemSessaoId) {
        const condicoesPorTurno = await condicaoSessaoDelegate.findMany({
          where: {
            sessaoId,
            ativo: true,
            automatica: false,
            duracaoModo: CONDICAO_DURACAO_MODOS.TURNOS_ALVO,
            personagemSessaoId,
            restanteDuracao: { not: null },
          },
          orderBy: { id: 'asc' },
        });

        for (const condicao of condicoesPorTurno) {
          const restanteAnterior = Math.max(0, condicao.restanteDuracao ?? 0);
          const restanteNovo = Math.max(0, restanteAnterior - 1);
          const expirada = restanteNovo <= 0;

          await condicaoSessaoDelegate.update({
            where: { id: condicao.id },
            data: {
              restanteDuracao: expirada ? 0 : restanteNovo,
              ativo: !expirada,
              removidaEm: expirada ? new Date() : null,
              motivoRemocao: expirada ? 'Duracao em turnos do alvo encerrada.' : null,
            },
          });

          if (expirada) {
            await tx.eventoSessao.create({
              data: {
                sessaoId,
                cenaId: condicao.cenaId ?? cenaId,
                personagemAtorId: condicao.personagemSessaoId,
                tipoEvento: 'CONDICAO_EXPIRADA',
                dados: this.jsonParaPersistencia({
                  condicaoSessaoId: condicao.id,
                  personagemSessaoId: condicao.personagemSessaoId,
                  npcSessaoId: condicao.npcSessaoId,
                  modo: CONDICAO_DURACAO_MODOS.TURNOS_ALVO,
                }),
              },
            });
          }
        }

        const mapaSistema = await this.obterMapaCondicoesSistemaTx(tx);
        const personagem = await tx.personagemSessao.findFirst({
          where: {
            id: personagemSessaoId,
            sessaoId,
          },
          select: {
            id: true,
            cenaId: true,
            personagemCampanha: {
              select: {
                turnosMorrendo: true,
                turnosEnlouquecendo: true,
              },
            },
          },
        });

        if (personagem) {
          const condicoesAutomaticas = await condicaoSessaoDelegate.findMany({
            where: {
              sessaoId,
              personagemSessaoId: personagem.id,
              ativo: true,
              automatica: true,
              chaveAutomacao: {
                in: [
                  CONDICAO_AUTOMACAO_CHAVES.MORRENDO,
                  CONDICAO_AUTOMACAO_CHAVES.ENLOUQUECENDO,
                ],
              },
            },
            orderBy: { id: 'asc' },
          });

          for (const condicao of condicoesAutomaticas) {
            const contadorNovo = Math.max(0, condicao.contadorTurnos + 1);
            await condicaoSessaoDelegate.update({
              where: { id: condicao.id },
              data: {
                contadorTurnos: contadorNovo,
              },
            });

            const cenaCondicao = personagem.cenaId ?? cenaId;
            if (
              condicao.chaveAutomacao === CONDICAO_AUTOMACAO_CHAVES.MORRENDO &&
              contadorNovo >= personagem.personagemCampanha.turnosMorrendo
            ) {
              await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
                sessaoId,
                cenaId: cenaCondicao,
                rodadaAtual: rodadaNova,
                personagemSessaoId: personagem.id,
                npcSessaoId: null,
                condicaoId: mapaSistema.mortoId,
                chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.MORTO,
                ativa: true,
                origemDescricao: 'Automatica por exceder turnos morrendo.',
              });
            }

            if (
              condicao.chaveAutomacao ===
                CONDICAO_AUTOMACAO_CHAVES.ENLOUQUECENDO &&
              contadorNovo >= personagem.personagemCampanha.turnosEnlouquecendo
            ) {
              await this.sincronizarCondicaoAutomaticaAlvoTx(tx, {
                sessaoId,
                cenaId: cenaCondicao,
                rodadaAtual: rodadaNova,
                personagemSessaoId: personagem.id,
                npcSessaoId: null,
                condicaoId: mapaSistema.insanoId,
                chaveAutomacao: CONDICAO_AUTOMACAO_CHAVES.INSANO,
                ativa: true,
                origemDescricao: 'Automatica por exceder turnos enlouquecendo.',
              });
            }
          }
        }
      }
    } else if (participanteTurnoNovo.tipoParticipante === 'NPC') {
      const npcSessaoId = participanteTurnoNovo.npcSessaoId;
      if (npcSessaoId) {
        const condicoesPorTurno = await condicaoSessaoDelegate.findMany({
          where: {
            sessaoId,
            ativo: true,
            automatica: false,
            duracaoModo: CONDICAO_DURACAO_MODOS.TURNOS_ALVO,
            npcSessaoId,
            restanteDuracao: { not: null },
          },
          orderBy: { id: 'asc' },
        });

        for (const condicao of condicoesPorTurno) {
          const restanteAnterior = Math.max(0, condicao.restanteDuracao ?? 0);
          const restanteNovo = Math.max(0, restanteAnterior - 1);
          const expirada = restanteNovo <= 0;

          await condicaoSessaoDelegate.update({
            where: { id: condicao.id },
            data: {
              restanteDuracao: expirada ? 0 : restanteNovo,
              ativo: !expirada,
              removidaEm: expirada ? new Date() : null,
              motivoRemocao: expirada ? 'Duracao em turnos do alvo encerrada.' : null,
            },
          });

          if (expirada) {
            await tx.eventoSessao.create({
              data: {
                sessaoId,
                cenaId: condicao.cenaId ?? cenaId,
                personagemAtorId: null,
                tipoEvento: 'CONDICAO_EXPIRADA',
                dados: this.jsonParaPersistencia({
                  condicaoSessaoId: condicao.id,
                  personagemSessaoId: condicao.personagemSessaoId,
                  npcSessaoId: condicao.npcSessaoId,
                  modo: CONDICAO_DURACAO_MODOS.TURNOS_ALVO,
                }),
              },
            });
          }
        }
      }
    }
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

  private lerSnapshotCondicaoRegistro(
    registro: Record<string, unknown>,
    chave: string,
  ): {
    id: number;
    sessaoId: number | null;
    personagemSessaoId: number | null;
    npcSessaoId: number | null;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos: number | null;
    duracaoModo: string;
    duracaoValor: number | null;
    restanteDuracao: number | null;
    ativo: boolean;
    automatica: boolean;
    chaveAutomacao: string | null;
    contadorTurnos: number;
    origemDescricao: string | null;
    observacao: string | null;
    removidaEm: string | null;
    motivoRemocao: string | null;
  } | null {
    const bruto = this.lerRegistroOpcionalRegistro(registro, chave);
    if (!bruto) return null;

    const id = this.lerInteiroRegistro(bruto, 'id');
    const condicaoId = this.lerInteiroRegistro(bruto, 'condicaoId');
    const cenaId = this.lerInteiroRegistro(bruto, 'cenaId');
    const turnoAplicacao = this.lerInteiroRegistro(bruto, 'turnoAplicacao');
    const duracaoModo = this.lerTextoRegistro(bruto, 'duracaoModo');
    const contadorTurnos = this.lerInteiroRegistro(bruto, 'contadorTurnos');

    if (
      id === null ||
      condicaoId === null ||
      cenaId === null ||
      turnoAplicacao === null ||
      !duracaoModo ||
      contadorTurnos === null
    ) {
      return null;
    }

    return {
      id,
      sessaoId: this.lerInteiroOpcionalRegistro(bruto, 'sessaoId'),
      personagemSessaoId: this.lerInteiroOpcionalRegistro(bruto, 'personagemSessaoId'),
      npcSessaoId: this.lerInteiroOpcionalRegistro(bruto, 'npcSessaoId'),
      condicaoId,
      cenaId,
      turnoAplicacao,
      duracaoTurnos: this.lerInteiroOpcionalRegistro(bruto, 'duracaoTurnos'),
      duracaoModo,
      duracaoValor: this.lerInteiroOpcionalRegistro(bruto, 'duracaoValor'),
      restanteDuracao: this.lerInteiroOpcionalRegistro(bruto, 'restanteDuracao'),
      ativo: bruto.ativo === true,
      automatica: bruto.automatica === true,
      chaveAutomacao: this.lerTextoOpcionalRegistro(bruto, 'chaveAutomacao'),
      contadorTurnos,
      origemDescricao: this.lerTextoOpcionalRegistro(bruto, 'origemDescricao'),
      observacao: this.lerTextoOpcionalRegistro(bruto, 'observacao'),
      removidaEm: this.lerTextoOpcionalRegistro(bruto, 'removidaEm'),
      motivoRemocao: this.lerTextoOpcionalRegistro(bruto, 'motivoRemocao'),
    };
  }

  private montarUpdateCondicaoPorSnapshot(
    snapshot: ReturnType<SessaoService['lerSnapshotCondicaoRegistro']>,
  ): Prisma.CondicaoPersonagemSessaoUncheckedUpdateInput {
    if (!snapshot) {
      throw new BusinessException(
        'Snapshot de condicao invalido',
        'SESSAO_CONDICAO_SNAPSHOT_INVALIDO',
      );
    }

    return {
      sessaoId: snapshot.sessaoId,
      personagemSessaoId: snapshot.personagemSessaoId,
      npcSessaoId: snapshot.npcSessaoId,
      condicaoId: snapshot.condicaoId,
      cenaId: snapshot.cenaId,
      turnoAplicacao: snapshot.turnoAplicacao,
      duracaoTurnos: snapshot.duracaoTurnos,
      duracaoModo: snapshot.duracaoModo,
      duracaoValor: snapshot.duracaoValor,
      restanteDuracao: snapshot.restanteDuracao,
      ativo: snapshot.ativo,
      automatica: snapshot.automatica,
      chaveAutomacao: snapshot.chaveAutomacao,
      contadorTurnos: snapshot.contadorTurnos,
      origemDescricao: snapshot.origemDescricao,
      observacao: snapshot.observacao,
      removidaEm: snapshot.removidaEm ? new Date(snapshot.removidaEm) : null,
      motivoRemocao: snapshot.motivoRemocao,
    } satisfies Prisma.CondicaoPersonagemSessaoUncheckedUpdateInput;
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
      case 'TURNO_RECUADO': {
        const rodada = this.lerInteiroRegistro(dados, 'rodadaNova');
        return `Turno recuado${rodada !== null ? ` (rodada ${rodada})` : ''}`;
      }
      case 'TURNO_PULADO': {
        const rodada = this.lerInteiroRegistro(dados, 'rodadaNova');
        return `Turno pulado${rodada !== null ? ` (rodada ${rodada})` : ''}`;
      }
      case 'TURNO_DESFEITO':
        return 'Ultimo ajuste de turno desfeito';
      case 'ORDEM_INICIATIVA_ATUALIZADA':
        return 'Ordem de iniciativa atualizada';
      case 'ORDEM_INICIATIVA_DESFEITA':
        return 'Reordenacao de iniciativa desfeita';
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
      case 'HABILIDADE_USADA': {
        const habilidade = this.lerTextoOpcionalRegistro(dados, 'habilidadeNome');
        const variacao = this.lerTextoOpcionalRegistro(dados, 'variacaoNome');
        const resumoEscalonamento = this.lerTextoOpcionalRegistro(
          dados,
          'resumoEscalonamento',
        );
        return `Habilidade usada${habilidade ? `: ${habilidade}` : ''}${variacao ? ` (${variacao})` : ''}${resumoEscalonamento ? ` | ${resumoEscalonamento}` : ''}`;
      }
      case 'HABILIDADE_SUSTENTADA_COBRADA': {
        const habilidade = this.lerTextoOpcionalRegistro(dados, 'habilidadeNome');
        const custoEA = this.lerInteiroRegistro(dados, 'custoEA');
        const custoPE = this.lerInteiroRegistro(dados, 'custoPE');
        const partesCusto: string[] = [];
        if (custoEA !== null && custoEA > 0) partesCusto.push(`EA -${custoEA}`);
        if (custoPE !== null && custoPE > 0) partesCusto.push(`PE -${custoPE}`);
        return `Sustentacao cobrada${habilidade ? `: ${habilidade}` : ''}${partesCusto.length > 0 ? ` (${partesCusto.join(' | ')})` : ''}`;
      }
      case 'HABILIDADE_SUSTENTADA_ENCERRADA': {
        const habilidade = this.lerTextoOpcionalRegistro(dados, 'habilidadeNome');
        const motivoSistema = this.lerTextoOpcionalRegistro(dados, 'motivoSistema');
        return `Sustentacao encerrada${habilidade ? `: ${habilidade}` : ''}${motivoSistema ? ` (${motivoSistema})` : ''}`;
      }
      case 'CONDICAO_APLICADA': {
        const condicaoNome = this.lerTextoOpcionalRegistro(dados, 'condicaoNome');
        const alvoNome = this.lerTextoOpcionalRegistro(dados, 'alvoNome');
        return `Condicao aplicada${condicaoNome ? `: ${condicaoNome}` : ''}${alvoNome ? ` em ${alvoNome}` : ''}`;
      }
      case 'CONDICAO_REMOVIDA': {
        const condicaoNome = this.lerTextoOpcionalRegistro(dados, 'condicaoNome');
        const alvoNome = this.lerTextoOpcionalRegistro(dados, 'alvoNome');
        return `Condicao removida${condicaoNome ? `: ${condicaoNome}` : ''}${alvoNome ? ` de ${alvoNome}` : ''}`;
      }
      case 'CONDICAO_EXPIRADA':
        return 'Condicao expirada automaticamente';
      case 'CONDICAO_APLICACAO_DESFEITA':
      case 'CONDICAO_REMOCAO_DESFEITA':
        return 'Alteracao de condicao desfeita';
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
