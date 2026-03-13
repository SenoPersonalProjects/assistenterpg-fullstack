'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiAdminGetCondicoes,
  apiGetSessaoCampanha,
  apiGetMeusNpcsAmeacas,
  apiListarChatSessaoCampanha,
  apiListarEventosSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  CondicaoAtivaSessaoCampanha,
  CondicaoCatalogo,
  EventoSessaoTimeline,
  MensagemChatSessao,
  NpcAmeacaResumo,
  NpcSessaoCampanha,
  ParticipanteIniciativaSessaoCampanha,
  PersonagemCampanhaResumo,
  SessaoCampanhaDetalhe,
  TipoCenaSessaoCampanha,
} from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CampaignCharacterEditorModal } from '@/components/campanha/CampaignCharacterEditorModal';
import { MestreShieldGuide } from '@/components/campanha/MestreShieldGuide';
import {
  CharacterSessionCard,
  type AbaDetalheCard,
} from '@/components/campanha/sessao/CharacterSessionCard';
import { SessionOperationalBar } from '@/components/campanha/sessao/SessionOperationalBar';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { SessionInitiativePanel } from '@/components/campanha/sessao/SessionInitiativePanel';
import { SessionMasterControls } from '@/components/campanha/sessao/SessionMasterControls';
import { SessionSidebarTabs } from '@/components/campanha/sessao/SessionSidebarTabs';
import { ParticipantsPanel } from '@/components/campanha/sessao/ParticipantsPanel';
import { TimelinePanel } from '@/components/campanha/sessao/TimelinePanel';
import { ChatPanel } from '@/components/campanha/sessao/ChatPanel';
import { SessionNpcsPanel } from '@/components/campanha/sessao/SessionNpcsPanel';
import { AddNpcModal } from '@/components/campanha/sessao/modals/AddNpcModal';
import { ConfirmEndSessionModal } from '@/components/campanha/sessao/modals/ConfirmEndSessionModal';
import { ConfirmNpcRemovalModal } from '@/components/campanha/sessao/modals/ConfirmNpcRemovalModal';
import { CondicoesModal } from '@/components/campanha/sessao/modals/CondicoesModal';
import { EventoDetalheModal } from '@/components/campanha/sessao/modals/EventoDetalheModal';
import {
  type AlvoCondicoesModal,
  type NpcEditavel,
} from '@/components/campanha/sessao/types';
import {
  descreverDuracaoCondicao,
  labelCena,
  textoSeguro,
} from '@/lib/campanha/sessao-formatters';
import {
  formatarCustos,
  resolverCustoExibicaoSessao as resolverCustoExibicao,
} from '@/lib/campanha/sessao-habilidades';
import { formatarDataHora } from '@/lib/utils/formatters';
import {
  carregarFiltroSustentadasLobby,
  salvarFiltroSustentadasLobby,
} from '@/lib/campanha/sessao-filtro-sustentadas';
import {
  calcularIndiceProximoTurno,
  COOLDOWN_USO_HABILIDADE_MS,
  OPCOES_DURACAO_CONDICAO,
} from '@/lib/campanha/sessao-utils';
import { useSessaoLayout } from '@/hooks/useSessaoLayout';
import { useSessaoRealtime } from '@/hooks/useSessaoRealtime';
import { useSessaoCena } from '@/hooks/useSessaoCena';
import { useSessaoTurnos } from '@/hooks/useSessaoTurnos';
import { useSessaoIniciativa } from '@/hooks/useSessaoIniciativa';
import { useSessaoCondicoes } from '@/hooks/useSessaoCondicoes';
import { useSessaoHabilidades } from '@/hooks/useSessaoHabilidades';
import { useSessaoNpc } from '@/hooks/useSessaoNpc';
import {
  AJUSTE_RECURSO_PADRAO,
  type AjustesRecursos,
  type CampoAjusteRecurso,
  useSessaoRecursos,
} from '@/hooks/useSessaoRecursos';
import { useSessaoChat } from '@/hooks/useSessaoChat';
import { useSessaoEncerramento } from '@/hooks/useSessaoEncerramento';
import { useSessaoEventos } from '@/hooks/useSessaoEventos';

const OPCOES_CENA: Array<{ value: TipoCenaSessaoCampanha; label: string }> = [
  { value: 'LIVRE', label: 'Cena livre' },
  { value: 'INVESTIGACAO', label: 'Investigacao' },
  { value: 'FURTIVIDADE', label: 'Furtividade' },
  { value: 'COMBATE', label: 'Combate' },
  { value: 'OUTRA', label: 'Outra' },
];

function formatarDadosEventoParaExibicao(dados: unknown): string {
  if (dados === null || typeof dados === 'undefined') {
    return 'Sem dados adicionais.';
  }

  if (typeof dados === 'string') {
    return dados;
  }

  try {
    return JSON.stringify(dados, null, 2);
  } catch {
    return String(dados);
  }
}

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  );
}

function labelParticipanteIniciativa(
  participante: Pick<
    ParticipanteIniciativaSessaoCampanha,
    'tipoParticipante' | 'nomePersonagem' | 'nomeJogador'
  >,
): string {
  if (participante.tipoParticipante === 'NPC') {
    return `${participante.nomePersonagem} (Aliado/Ameaca)`;
  }

  if (participante.nomeJogador) {
    return `${participante.nomePersonagem} (${participante.nomeJogador})`;
  }

  return participante.nomePersonagem;
}

function montarChaveSustentacaoAtiva(
  habilidadeTecnicaId: number,
  variacaoHabilidadeId?: number | null,
): string {
  return `${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
}

function montarEdicaoNpcBase(npc: NpcSessaoCampanha): NpcEditavel {
  return {
    vd: String(npc.vd),
    defesa: String(npc.defesa),
    pontosVidaAtual: String(npc.pontosVidaAtual),
    pontosVidaMax: String(npc.pontosVidaMax),
    deslocamentoMetros: String(npc.deslocamentoMetros),
    notasCena: npc.notasCena ?? '',
  };
}

export default function SessaoCampanhaPage() {
  const params = useParams<{ id: string; sessaoId: string }>();
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const {
    isOpen: confirmacaoAberta,
    options: confirmacaoOptions,
    confirm,
    handleClose: fecharConfirmacao,
    handleConfirm: confirmarAcao,
  } = useConfirm();

  const campanhaId = Number(params.id);
  const sessaoId = Number(params.sessaoId);
  const idsValidos =
    Number.isInteger(campanhaId) &&
    campanhaId > 0 &&
    Number.isInteger(sessaoId) &&
    sessaoId > 0;

  const [detalhe, setDetalhe] = useState<SessaoCampanhaDetalhe | null>(null);
  const [chat, setChat] = useState<MensagemChatSessao[]>([]);
  const [eventosSessao, setEventosSessao] = useState<EventoSessaoTimeline[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [cenaTipo, setCenaTipo] = useState<TipoCenaSessaoCampanha>('LIVRE');
  const [cenaNome, setCenaNome] = useState('');
  const [ajustesRecursosPorCard, setAjustesRecursosPorCard] = useState<
    Record<number, AjustesRecursos>
  >({});
  const [cardsRecursosExpandidos, setCardsRecursosExpandidos] = useState<
    Record<number, boolean>
  >({});
  const [edicaoNpcs, setEdicaoNpcs] = useState<Record<number, NpcEditavel>>({});
  const [catalogoCondicoes, setCatalogoCondicoes] = useState<CondicaoCatalogo[]>([]);
  const [npcsDisponiveis, setNpcsDisponiveis] = useState<NpcAmeacaResumo[]>([]);
  const [npcSelecionadoId, setNpcSelecionadoId] = useState('');
  const [nomeNpcCustomizado, setNomeNpcCustomizado] = useState('');
  const [modalAdicionarNpcAberto, setModalAdicionarNpcAberto] = useState(false);
  const [modalCondicoesAberto, setModalCondicoesAberto] =
    useState<AlvoCondicoesModal | null>(null);
  const [buscaCondicoesModal, setBuscaCondicoesModal] = useState('');
  const [eventoDetalheModal, setEventoDetalheModal] =
    useState<EventoSessaoTimeline | null>(null);
  const [motivoDesfazerEventoModal, setMotivoDesfazerEventoModal] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acumulosHabilidade, setAcumulosHabilidade] = useState<Record<string, string>>(
    {},
  );
  const [mostrarSomenteSustentadas, setMostrarSomenteSustentadas] = useState<
    Record<number, boolean>
  >({});
  const [filtroSustentadasHydrated, setFiltroSustentadasHydrated] = useState(false);
  const [abasDetalheCard, setAbasDetalheCard] = useState<
    Record<number, AbaDetalheCard>
  >({});
  const [confirmarEncerrarSessaoAberto, setConfirmarEncerrarSessaoAberto] =
    useState(false);
  const [npcRemocaoConfirmacao, setNpcRemocaoConfirmacao] =
    useState<NpcSessaoCampanha | null>(null);
  const [personagemEmEdicao, setPersonagemEmEdicao] = useState<
    Pick<PersonagemCampanhaResumo, 'id' | 'nome' | 'recursos'> | null
  >(null);

  const chatRef = useRef<MensagemChatSessao[]>([]);
  const fimChatRef = useRef<HTMLDivElement | null>(null);
  const sincronizandoTempoRealRef = useRef(false);

  const obterAjustesRecursosCard = useCallback(
    (personagemCampanhaId: number): AjustesRecursos =>
      ajustesRecursosPorCard[personagemCampanhaId] ?? AJUSTE_RECURSO_PADRAO,
    [ajustesRecursosPorCard],
  );

  const atualizarAjusteRecursoCard = useCallback(
    (personagemCampanhaId: number, campo: CampoAjusteRecurso, valor: string) => {
      setAjustesRecursosPorCard((estadoAtual) => ({
        ...estadoAtual,
        [personagemCampanhaId]: {
          ...(estadoAtual[personagemCampanhaId] ?? AJUSTE_RECURSO_PADRAO),
          [campo]: valor,
        },
      }));
    },
    [],
  );

  const atualizarCampoEdicaoNpc = useCallback(
    (npc: NpcSessaoCampanha, campo: keyof NpcEditavel, valor: string) => {
      setEdicaoNpcs((anterior) => ({
        ...anterior,
        [npc.npcSessaoId]: {
          ...(anterior[npc.npcSessaoId] ?? montarEdicaoNpcBase(npc)),
          [campo]: valor,
        },
      }));
    },
    [],
  );

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    fimChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    if (!idsValidos || !usuario) {
      setMostrarSomenteSustentadas({});
      setFiltroSustentadasHydrated(false);
      return;
    }

    const filtroSalvo = carregarFiltroSustentadasLobby(
      usuario.id,
      campanhaId,
      sessaoId,
    );
    setMostrarSomenteSustentadas(filtroSalvo);
    setFiltroSustentadasHydrated(true);
  }, [campanhaId, idsValidos, sessaoId, usuario]);

  useEffect(() => {
    if (!idsValidos || !usuario || !filtroSustentadasHydrated) return;

    salvarFiltroSustentadasLobby(
      usuario.id,
      campanhaId,
      sessaoId,
      mostrarSomenteSustentadas,
    );
  }, [
    campanhaId,
    filtroSustentadasHydrated,
    idsValidos,
    mostrarSomenteSustentadas,
    sessaoId,
    usuario,
  ]);

  const sincronizarEstadosDerivados = useCallback(
    (proximoDetalhe: SessaoCampanhaDetalhe) => {
      setCenaTipo(proximoDetalhe.cenaAtual.tipo as TipoCenaSessaoCampanha);
      setCenaNome(proximoDetalhe.cenaAtual.nome ?? '');

      setAjustesRecursosPorCard((estadoAtual) => {
        const proximoEstado = { ...estadoAtual };
        for (const card of proximoDetalhe.cards) {
          if (!card.podeEditar) continue;
          proximoEstado[card.personagemCampanhaId] =
            proximoEstado[card.personagemCampanhaId] ?? {
              ...AJUSTE_RECURSO_PADRAO,
            };
        }
        return proximoEstado;
      });

      setEdicaoNpcs((estadoAtual) => {
        const proximoEstado = { ...estadoAtual };
        for (const npc of proximoDetalhe.npcs) {
          proximoEstado[npc.npcSessaoId] = montarEdicaoNpcBase(npc);
        }
        return proximoEstado;
      });
    },
    [setAjustesRecursosPorCard, setCenaNome, setCenaTipo, setEdicaoNpcs],
  );

  const anexarMensagensNoChat = useCallback((mensagensNovas: MensagemChatSessao[]) => {
    if (mensagensNovas.length === 0) return;

    setChat((anterior) => {
      const ids = new Set(anterior.map((item) => item.id));
      const unicas = mensagensNovas.filter((item) => !ids.has(item.id));
      return unicas.length > 0 ? [...anterior, ...unicas] : anterior;
    });
  }, []);

  const sincronizarTempoReal = useCallback(async () => {
    if (!idsValidos || !usuario || sincronizandoTempoRealRef.current) return;

    sincronizandoTempoRealRef.current = true;
    try {
      const afterId = chatRef.current.length
        ? chatRef.current[chatRef.current.length - 1].id
        : undefined;
      const [detalheAtual, mensagensNovas, eventos] = await Promise.all([
        apiGetSessaoCampanha(campanhaId, sessaoId),
        apiListarChatSessaoCampanha(campanhaId, sessaoId, afterId),
        apiListarEventosSessaoCampanha(campanhaId, sessaoId, {
          limit: 80,
          incluirChat: false,
        }),
      ]);

      setDetalhe(detalheAtual);
      sincronizarEstadosDerivados(detalheAtual);
      anexarMensagensNoChat(mensagensNovas);
      setEventosSessao(eventos);
    } catch {
      // sincronizacao silenciosa de fallback/realtime
    } finally {
      sincronizandoTempoRealRef.current = false;
    }
  }, [anexarMensagensNoChat, campanhaId, idsValidos, sessaoId, sincronizarEstadosDerivados, usuario]);

  const carregarInicial = useCallback(async () => {
    if (!idsValidos || !usuario) return;

    setLoading(true);
    setErro(null);
    try {
      const [detalheSessao, chatInicial, eventos] = await Promise.all([
        apiGetSessaoCampanha(campanhaId, sessaoId),
        apiListarChatSessaoCampanha(campanhaId, sessaoId),
        apiListarEventosSessaoCampanha(campanhaId, sessaoId, {
          limit: 80,
          incluirChat: false,
        }),
      ]);
      setDetalhe(detalheSessao);
      sincronizarEstadosDerivados(detalheSessao);
      setChat(chatInicial);
      setEventosSessao(eventos);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId, idsValidos, sessaoId, sincronizarEstadosDerivados, usuario]);

  const podeControlarSessao = Boolean(detalhe?.permissoes.ehMestre);
  const sessaoEncerrada = detalhe?.status === 'ENCERRADA';

  const {
    colunaEsquerdaRecolhida,
    setColunaEsquerdaRecolhida,
    colunaDireitaRecolhida,
    setColunaDireitaRecolhida,
    abaPainelDireitoAtiva,
    setAbaPainelDireitoAtiva,
  } = useSessaoLayout({
    idsValidos,
    usuarioId: usuario?.id,
    campanhaId,
    sessaoId,
  });

  const { socketConectado, onlineUsuarioIds } = useSessaoRealtime({
    idsValidos,
    usuarioId: usuario?.id,
    campanhaId,
    sessaoId,
    sincronizarTempoReal,
  });

  const { atualizandoCena, handleAtualizarCena } = useSessaoCena({
    campanhaId,
    sessaoId,
    detalhe,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro,
    showToast,
  });

  const { acaoTurnoPendente, handleControleTurno } = useSessaoTurnos({
    campanhaId,
    sessaoId,
    detalhe,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro,
    showToast,
  });

  const {
    reordenandoIniciativa,
    indiceIniciativaArrastado,
    indiceIniciativaHover,
    setIndiceIniciativaArrastado,
    setIndiceIniciativaHover,
    handleMoverIniciativa,
    handleDropIniciativa,
  } = useSessaoIniciativa({
    campanhaId,
    sessaoId,
    detalhe,
    podeControlarSessao,
    sessaoEncerrada,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro,
  });

  const {
    formCondicaoPadrao,
    obterFormCondicaoAlvo,
    atualizarCampoFormCondicao,
    acaoCondicaoPendente,
    handleAplicarCondicao,
    handleRemoverCondicao,
    chaveAcaoAplicarCondicao,
    chaveAcaoRemoverCondicao,
  } = useSessaoCondicoes({
    campanhaId,
    sessaoId,
    sessaoEncerrada,
    podeControlarSessao,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro,
    showToast,
  });

  const { acaoHabilidadePendente, handleUsarHabilidade, handleEncerrarSustentacao } =
    useSessaoHabilidades({
      campanhaId,
      sessaoId,
      sessaoEncerrada,
      setDetalhe: (atualizado) => setDetalhe(atualizado),
      sincronizarEstadosDerivados,
      setErro,
      cooldownMs: COOLDOWN_USO_HABILIDADE_MS,
    });

  const { salvandoCardId, campoRecursoPendente, handleAplicarDeltaRecursoCard, handleAplicarAjustePersonalizadoRecursoCard } =
    useSessaoRecursos({
      campanhaId,
      sessaoId,
      sessaoEncerrada,
      setDetalhe: (atualizado) => setDetalhe(atualizado),
      sincronizarEstadosDerivados,
      setErro,
      obterAjustesRecursosCard,
    });

  const { adicionandoNpc, salvandoNpcId, removendoNpcId, handleAdicionarNpcNaCena, handleSalvarNpc, handleRemoverNpc } =
    useSessaoNpc({
      campanhaId,
      sessaoId,
      edicaoNpcs,
      setDetalhe: (atualizado) => setDetalhe(atualizado),
      sincronizarEstadosDerivados,
      setErro,
      showToast,
      onNpcAdicionado: () => {
        setNomeNpcCustomizado('');
        setModalAdicionarNpcAberto(false);
      },
      onRemocaoConfirmada: () => setNpcRemocaoConfirmacao(null),
      textoSeguro,
    });

  const { enviandoMensagem, handleEnviarMensagem } = useSessaoChat({
    campanhaId,
    sessaoId,
    mensagem,
    setMensagem,
    setChat: (atualizar) => setChat(atualizar),
    setErro,
  });

  const { encerrandoSessao, handleEncerrarSessao } = useSessaoEncerramento({
    campanhaId,
    sessaoId,
    detalhe,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro,
    showToast,
    onEncerramentoConfirmado: () => setConfirmarEncerrarSessaoAberto(false),
  });

  const { desfazendoEventoId, handleDesfazerEvento } = useSessaoEventos({
    idsValidos,
    usuarioId: usuario?.id,
    campanhaId,
    sessaoId,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setEventosSessao,
    setErro,
    onEventoDesfeito: () => {
      setMotivoDesfazerEventoModal('');
      setEventoDetalheModal(null);
    },
  });

  const solicitarDesfazerEvento = useCallback(
    (evento: EventoSessaoTimeline, motivo?: string) => {
      confirm({
        title: 'Desfazer evento?',
        description: `Voce esta prestes a desfazer: ${textoSeguro(evento.descricao)}.`,
        confirmLabel: 'Desfazer evento',
        cancelLabel: 'Manter',
        variant: 'warning',
        onConfirm: () => handleDesfazerEvento(evento.id, motivo),
      });
    },
    [confirm, handleDesfazerEvento],
  );

  const solicitarRemocaoCondicao = useCallback(
    (
      alvoTipo: 'PERSONAGEM' | 'NPC',
      alvoId: number,
      condicao: CondicaoAtivaSessaoCampanha,
    ) => {
      confirm({
        title: 'Remover condicao?',
        description: `Remover "${textoSeguro(condicao.nome)}". ${descreverDuracaoCondicao(
          condicao.duracaoModo,
          condicao.duracaoValor,
          condicao.restanteDuracao,
        )}`,
        confirmLabel: 'Remover condicao',
        cancelLabel: 'Manter',
        variant: 'warning',
        onConfirm: () => handleRemoverCondicao(alvoTipo, alvoId, condicao.id),
      });
    },
    [confirm, handleRemoverCondicao],
  );

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario && !idsValidos) {
      setErro('IDs de campanha/sessao invalidos.');
      setLoading(false);
      return;
    }

    if (!authLoading && usuario && idsValidos) {
      void carregarInicial();
    }
  }, [authLoading, usuario, idsValidos, carregarInicial, router]);

  useEffect(() => {
    if (!idsValidos || !usuario || !detalhe?.permissoes.ehMestre) return;

    let ativo = true;
    void (async () => {
      try {
        const resposta = await apiGetMeusNpcsAmeacas({ page: 1, limit: 100 });
        if (!ativo) return;
        setNpcsDisponiveis(resposta.items);

        if (!npcSelecionadoId && resposta.items.length > 0) {
          setNpcSelecionadoId(String(resposta.items[0].id));
        }
      } catch {
        if (!ativo) return;
        setNpcsDisponiveis([]);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [detalhe?.permissoes.ehMestre, idsValidos, npcSelecionadoId, usuario]);

  useEffect(() => {
    if (!idsValidos || !usuario || !detalhe?.permissoes.ehMestre) {
      setCatalogoCondicoes([]);
      return;
    }

    let ativo = true;
    void (async () => {
      try {
        const condicoes = await apiAdminGetCondicoes();
        if (!ativo) return;
        setCatalogoCondicoes(condicoes);
      } catch {
        if (!ativo) return;
        setCatalogoCondicoes([]);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [detalhe?.permissoes.ehMestre, idsValidos, usuario]);

  const participantes = useMemo(
    () => detalhe?.participantes ?? [],
    [detalhe?.participantes],
  );
  const cards = detalhe?.cards ?? [];
  const npcs = detalhe?.npcs ?? [];
  const iniciativaOrdem = useMemo(
    () => detalhe?.iniciativa.ordem ?? [],
    [detalhe?.iniciativa.ordem],
  );
  const iniciativaIndiceAtual = detalhe?.iniciativa.indiceAtual ?? null;
  const turnoAtualLabel = detalhe?.turnoAtual
    ? `${labelParticipanteIniciativa(detalhe.turnoAtual)}${
        typeof detalhe.turnoAtual.valorIniciativa === 'number'
          ? ` | INI ${detalhe.turnoAtual.valorIniciativa}`
          : ''
      }`
    : null;
  const proximoTurnoLabel = useMemo(() => {
    if (!detalhe?.controleTurnosAtivo || iniciativaOrdem.length === 0) return null;
    const indiceProximo = calcularIndiceProximoTurno(
      detalhe.iniciativa.indiceAtual,
      iniciativaOrdem.length,
    );
    if (indiceProximo === null) return null;
    const proximo = iniciativaOrdem[indiceProximo];
    if (!proximo) return null;
    return `${labelParticipanteIniciativa(proximo)} | INI ${proximo.valorIniciativa}`;
  }, [detalhe?.controleTurnosAtivo, detalhe?.iniciativa.indiceAtual, iniciativaOrdem]);
  const onlineSet = useMemo(() => new Set(onlineUsuarioIds), [onlineUsuarioIds]);

  const tituloSessao = useMemo(() => {
    if (!detalhe) return 'Sessao da campanha';
    return detalhe.titulo;
  }, [detalhe]);
  const totalParticipantesOnline = useMemo(
    () => participantes.filter((participante) => onlineSet.has(participante.usuarioId)).length,
    [onlineSet, participantes],
  );
  const iniciativaPorPersonagemSessao = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const participante of iniciativaOrdem) {
      if (participante.tipoParticipante !== 'PERSONAGEM') continue;
      if (typeof participante.personagemSessaoId !== 'number') continue;
      mapa.set(participante.personagemSessaoId, participante.valorIniciativa);
    }
    return mapa;
  }, [iniciativaOrdem]);
  const gridSessaoClassName = useMemo(() => {
    if (colunaEsquerdaRecolhida && colunaDireitaRecolhida) {
      return 'grid gap-4 xl:grid-cols-1';
    }
    if (colunaEsquerdaRecolhida) {
      return 'grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]';
    }
    if (colunaDireitaRecolhida) {
      return 'grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,1.05fr)]';
    }
    return 'grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,1.05fr)_minmax(350px,0.83fr)]';
  }, [colunaDireitaRecolhida, colunaEsquerdaRecolhida]);
  const condicoesFiltradasModal = useMemo(() => {
    if (!buscaCondicoesModal.trim()) return catalogoCondicoes;
    const busca = textoSeguro(buscaCondicoesModal).toLowerCase().trim();
    return catalogoCondicoes.filter((condicao) => {
      const nome = textoSeguro(condicao.nome).toLowerCase();
      const descricao = textoSeguro(condicao.descricao).toLowerCase();
      return nome.includes(busca) || descricao.includes(busca);
    });
  }, [buscaCondicoesModal, catalogoCondicoes]);
  const formCondicaoModal = modalCondicoesAberto
    ? obterFormCondicaoAlvo(
        modalCondicoesAberto.alvoTipo,
        modalCondicoesAberto.alvoId,
      )
    : formCondicaoPadrao;
  const campoDuracaoCondicaoModalDesabilitado =
    formCondicaoModal.duracaoModo === 'ATE_REMOVER';
  const condicoesAtivasModal = useMemo(() => {
    if (!modalCondicoesAberto) return [];

    if (modalCondicoesAberto.alvoTipo === 'PERSONAGEM') {
      return (
        detalhe?.cards.find(
          (card) => card.personagemSessaoId === modalCondicoesAberto.alvoId,
        )?.condicoesAtivas ?? modalCondicoesAberto.condicoesAtivas
      );
    }

    return (
      detalhe?.npcs.find((npc) => npc.npcSessaoId === modalCondicoesAberto.alvoId)
        ?.condicoesAtivas ?? modalCondicoesAberto.condicoesAtivas
    );
  }, [detalhe, modalCondicoesAberto]);
  const dadosEventoDetalheModal = useMemo(
    () => formatarDadosEventoParaExibicao(eventoDetalheModal?.dados),
    [eventoDetalheModal],
  );

  useEffect(() => {
    if (!idsValidos || !usuario || !podeControlarSessao) return;
    if (sessaoEncerrada || !detalhe?.controleTurnosAtivo) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (isTypingElement(event.target)) return;
      if (modalAdicionarNpcAberto || modalCondicoesAberto || eventoDetalheModal) {
        return;
      }
      if (Boolean(acaoTurnoPendente)) return;

      if (event.key === '.') {
        event.preventDefault();
        void handleControleTurno('AVANCAR');
      }

      if (event.key === ',' && event.shiftKey) {
        event.preventDefault();
        void handleControleTurno('VOLTAR');
      }

      if (event.key === '/' && event.shiftKey) {
        event.preventDefault();
        void handleControleTurno('PULAR');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    acaoTurnoPendente,
    detalhe?.controleTurnosAtivo,
    eventoDetalheModal,
    idsValidos,
    modalAdicionarNpcAberto,
    modalCondicoesAberto,
    podeControlarSessao,
    sessaoEncerrada,
    usuario,
  ]);

  function montarChaveUsoHabilidade(
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
  ): string {
    return `usar:${personagemSessaoId}:${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
  }

  function montarChaveAcumuloHabilidade(
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
  ): string {
    return `acumulo:${personagemSessaoId}:${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
  }

  function parseAcumulos(valor: string | undefined, maximo: number): number {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return 0;
    return Math.max(0, Math.min(maximo, Math.trunc(numero)));
  }

  function obterAbaDetalheCard(personagemSessaoId: number): AbaDetalheCard {
    return abasDetalheCard[personagemSessaoId] ?? 'RESUMO';
  }

  function atualizarAbaDetalheCard(
    personagemSessaoId: number,
    aba: AbaDetalheCard,
  ) {
    setAbasDetalheCard((estadoAtual) => ({
      ...estadoAtual,
      [personagemSessaoId]: aba,
    }));
  }

  const renderPainelCondicoes = (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: SessaoCampanhaDetalhe['cards'][number]['condicoesAtivas'],
    modo: 'inline' | 'accordion' = 'accordion',
  ) => {
    const form = obterFormCondicaoAlvo(alvoTipo, alvoId);
    const chaveAplicar = chaveAcaoAplicarCondicao(alvoTipo, alvoId);
    const Conteudo = (
      <div className="mt-2 space-y-2">
        {condicoesAtivas.length === 0 ? (
          <p className="text-[11px] text-app-muted">
            Nenhuma condicao ativa neste alvo.
          </p>
        ) : (
          condicoesAtivas.map((condicao) => {
            const chaveRemover = chaveAcaoRemoverCondicao(condicao.id);
            return (
              <div
                key={`condicao-ativa-${condicao.id}`}
                className="rounded border border-app-border bg-app-surface px-2 py-1.5 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-app-fg">{condicao.nome}</p>
                  <span className="text-[10px] text-app-muted">
                    {condicao.automatica ? 'Automatica' : 'Manual'}
                  </span>
                </div>
                <p className="text-[11px] text-app-muted">
                  {descreverDuracaoCondicao(
                    condicao.duracaoModo,
                    condicao.duracaoValor,
                    condicao.restanteDuracao,
                  )}
                </p>
                {condicao.origemDescricao ? (
                  <p className="text-[11px] text-app-muted">
                    Origem: {condicao.origemDescricao}
                  </p>
                ) : null}
                {condicao.observacao ? (
                  <p className="text-[11px] text-app-muted">{condicao.observacao}</p>
                ) : null}
                {podeControlarSessao ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => solicitarRemocaoCondicao(alvoTipo, alvoId, condicao)}
                    disabled={sessaoEncerrada || acaoCondicaoPendente === chaveRemover}
                  >
                    {acaoCondicaoPendente === chaveRemover
                      ? 'Removendo...'
                      : 'Remover condicao'}
                  </Button>
                ) : null}
              </div>
            );
          })
        )}

        {podeControlarSessao ? (
          <div className="rounded border border-app-border bg-app-bg p-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setModalCondicoesAberto({
                    alvoTipo,
                    alvoId,
                    nomeAlvo,
                    condicoesAtivas,
                  })
                }
                disabled={sessaoEncerrada}
              >
                Gerenciar condicoes
              </Button>
              {form.condicaoId ? (
                <span className="text-[11px] text-app-muted">
                  Selecionada:{' '}
                  {textoSeguro(
                    catalogoCondicoes.find((item) => String(item.id) === form.condicaoId)
                      ?.nome ?? 'Condicao',
                  )}
                </span>
              ) : (
                <span className="text-[11px] text-app-muted">
                  Abra o modal para aplicar/remover com busca rapida.
                </span>
              )}
              {acaoCondicaoPendente === chaveAplicar ? (
                <span className="text-[11px] text-app-muted">Aplicando...</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );

    if (modo === 'inline') {
      return (
        <div className="rounded border border-app-border p-2">
          <p className="text-xs font-semibold text-app-fg">
            Condicoes da sessao ({condicoesAtivas.length})
          </p>
          {Conteudo}
        </div>
      );
    }

    return (
      <details className="rounded border border-app-border p-2">
        <summary className="cursor-pointer text-xs font-semibold text-app-fg">
          Condicoes da sessao ({condicoesAtivas.length})
        </summary>
        {Conteudo}
      </details>
    );
  };

  const renderCardsSessao = () => (
    <>
      <SessionPanel
        title="Personagens da sessao"
        subtitle="Jogadores editam apenas sua ficha. O mestre pode editar todas."
      />

      {cards.length === 0 ? (
        <EmptyState
          variant="card"
          icon="characters"
          title="Sem personagens na sessao"
          description="Associe personagens na campanha para aparecerem no lobby."
        />
      ) : (
        cards.map((card) => {
          const ajustesRecursos = obterAjustesRecursosCard(card.personagemCampanhaId);
          const cardRecursosExpandido = Boolean(
            cardsRecursosExpandidos[card.personagemSessaoId],
          );
          const campoRecursoPendenteCard =
            campoRecursoPendente?.startsWith(`${card.personagemCampanhaId}:`)
              ? (campoRecursoPendente.split(':')[1] as CampoAjusteRecurso)
              : null;
          const iniciativaValor = iniciativaPorPersonagemSessao.get(
            card.personagemSessaoId,
          );
          const abaDetalheCard = obterAbaDetalheCard(card.personagemSessaoId);
          const totalTecnicasCard =
            (card.tecnicaInata ? 1 : 0) + card.tecnicasNaoInatas.length;
          const totalCondicoesAtivasCard = card.condicoesAtivas.length;
          const totalSustentacoesAtivasCard = card.sustentacoesAtivas.length;
          const sustentacoesAtivasPorHabilidade = new Map<string, number>();
          for (const sustentacao of card.sustentacoesAtivas) {
            const chave = montarChaveSustentacaoAtiva(
              sustentacao.habilidadeTecnicaId,
              sustentacao.variacaoHabilidadeId,
            );
            sustentacoesAtivasPorHabilidade.set(
              chave,
              (sustentacoesAtivasPorHabilidade.get(chave) ?? 0) + 1,
            );
          }
          const obterQtdSustentacaoAtiva = (
            habilidadeTecnicaId: number,
            variacaoHabilidadeId?: number | null,
          ) =>
            sustentacoesAtivasPorHabilidade.get(
              montarChaveSustentacaoAtiva(
                habilidadeTecnicaId,
                variacaoHabilidadeId,
              ),
            ) ?? 0;

          const renderTecnica = (
            tecnica: NonNullable<SessaoCampanhaDetalhe['cards'][number]['tecnicaInata']>,
          ) => {
            const filtroSomenteSustentadasAtivas = Boolean(
              mostrarSomenteSustentadas[card.personagemSessaoId],
            );
            const habilidadesVisiveis = filtroSomenteSustentadasAtivas
              ? tecnica.habilidades.filter((habilidade) => {
                  const baseAtiva = obterQtdSustentacaoAtiva(habilidade.id) > 0;
                  const variacaoAtiva = habilidade.variacoes.some(
                    (variacao) =>
                      obterQtdSustentacaoAtiva(habilidade.id, variacao.id) > 0,
                  );
                  return baseAtiva || variacaoAtiva;
                })
              : tecnica.habilidades;

            return (
              <div key={tecnica.id} className="space-y-2 rounded border border-app-border p-2">
                <div>
                  <p className="text-xs font-semibold text-app-fg">{textoSeguro(tecnica.nome)}</p>
                  <p className="text-[11px] text-app-muted">
                    {textoSeguro(tecnica.codigo)} | {textoSeguro(tecnica.tipo)}
                  </p>
                  {tecnica.descricao ? (
                    <p className="text-[11px] text-app-muted">{textoSeguro(tecnica.descricao)}</p>
                  ) : null}
                </div>
                {habilidadesVisiveis.length === 0 ? (
                  <p className="text-[11px] text-app-muted">
                    {filtroSomenteSustentadasAtivas
                      ? 'Nenhuma habilidade com sustentacao ativa nesta tecnica.'
                      : 'Nenhuma habilidade liberada com os graus atuais.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {habilidadesVisiveis.map((habilidade) => {
                    const custoBase = resolverCustoExibicao(habilidade);
                    const chaveAcumuloBase = montarChaveAcumuloHabilidade(
                      card.personagemSessaoId,
                      habilidade.id,
                    );
                    const acumulosBase = custoBase.escalonavel
                      ? parseAcumulos(
                          acumulosHabilidade[chaveAcumuloBase],
                          custoBase.acumulosMaximos,
                        )
                      : 0;
                    const custoBaseTotalEA =
                      custoBase.custoEA +
                      custoBase.escalonamentoCustoEA * acumulosBase;
                    const custoBaseTotalPE =
                      custoBase.custoPE +
                      custoBase.escalonamentoCustoPE * acumulosBase;
                    const chaveBase = montarChaveUsoHabilidade(
                      card.personagemSessaoId,
                      habilidade.id,
                    );
                    const qtdSustentacaoBaseAtiva = obterQtdSustentacaoAtiva(
                      habilidade.id,
                    );

                    return (
                      <div
                        key={`habilidade-${habilidade.id}`}
                        className="rounded border border-app-border bg-app-surface px-2 py-1.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-app-fg">{textoSeguro(habilidade.nome)}</p>
                          {qtdSustentacaoBaseAtiva > 0 ? (
                            <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                              Sustentada ativa x{qtdSustentacaoBaseAtiva}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-app-muted">
                          {textoSeguro(habilidade.execucao)}
                          {habilidade.alcance ? ` | Alcance: ${textoSeguro(habilidade.alcance)}` : ''}
                          {habilidade.alvo ? ` | Alvo: ${textoSeguro(habilidade.alvo)}` : ''}
                          {custoBase.duracao ? ` | Duracao: ${textoSeguro(custoBase.duracao)}` : ''}
                        </p>
                        <p className="text-[11px] text-app-muted">
                          Custo base: {formatarCustos(custoBase.custoEA, custoBase.custoPE)}
                          {custoBase.sustentada
                            ? ` | Sustentacao: ${formatarCustos(custoBase.custoSustentacaoEA ?? 0, custoBase.custoSustentacaoPE ?? 0)}/rodada`
                            : ''}
                        </p>
                        {custoBase.escalonavel ? (
                          <div className="flex items-center gap-2 text-[11px] text-app-muted">
                            <span>Acumulos</span>
                            <input
                              type="number"
                              min={0}
                              max={custoBase.acumulosMaximos}
                              value={acumulosHabilidade[chaveAcumuloBase] ?? '0'}
                              onChange={(event) => {
                                const normalizado = parseAcumulos(
                                  event.target.value,
                                  custoBase.acumulosMaximos,
                                );
                                setAcumulosHabilidade((estadoAtual) => ({
                                  ...estadoAtual,
                                  [chaveAcumuloBase]: String(normalizado),
                                }));
                              }}
                              disabled={!card.podeEditar || sessaoEncerrada}
                              className="w-16 rounded border border-app-border bg-app-surface px-2 py-1 text-[11px] text-app-fg"
                            />
                            <span>
                              {`max ${custoBase.acumulosMaximos} | +EA ${custoBase.escalonamentoCustoEA}/acumulo${custoBase.escalonamentoCustoPE > 0 ? ` | +PE ${custoBase.escalonamentoCustoPE}/acumulo` : ''}`}
                            </span>
                          </div>
                        ) : null}
                        <p className="text-[11px] text-app-muted whitespace-pre-wrap">
                          {textoSeguro(habilidade.efeito)}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {card.podeEditar ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                void handleUsarHabilidade(
                                  card.personagemSessaoId,
                                  habilidade.id,
                                  undefined,
                                  acumulosBase,
                                )
                              }
                              disabled={sessaoEncerrada || acaoHabilidadePendente === chaveBase}
                              title={`Custo: ${formatarCustos(custoBaseTotalEA, custoBaseTotalPE)}`}
                            >
                              {acaoHabilidadePendente === chaveBase
                                ? 'Aplicando...'
                                : 'Usar base'}
                            </Button>
                          ) : null}

                          {(filtroSomenteSustentadasAtivas
                            ? habilidade.variacoes.filter(
                                (variacao) =>
                                  obterQtdSustentacaoAtiva(
                                    habilidade.id,
                                    variacao.id,
                                  ) > 0,
                              )
                            : habilidade.variacoes
                          ).map((variacao) => {
                            const custoVariacao = resolverCustoExibicao(habilidade, variacao);
                            const execucaoVariacao = variacao.execucao ?? habilidade.execucao;
                            const alcanceVariacao = variacao.alcance ?? habilidade.alcance;
                            const alvoVariacao = variacao.alvo ?? habilidade.alvo;
                            const duracaoVariacao = variacao.duracao ?? custoVariacao.duracao;
                            const chaveAcumuloVariacao = montarChaveAcumuloHabilidade(
                              card.personagemSessaoId,
                              habilidade.id,
                              variacao.id,
                            );
                            const acumulosVariacao = custoVariacao.escalonavel
                              ? parseAcumulos(
                                  acumulosHabilidade[chaveAcumuloVariacao],
                                  custoVariacao.acumulosMaximos,
                                )
                              : 0;
                            const custoVariacaoTotalEA =
                              custoVariacao.custoEA +
                              custoVariacao.escalonamentoCustoEA * acumulosVariacao;
                            const custoVariacaoTotalPE =
                              custoVariacao.custoPE +
                              custoVariacao.escalonamentoCustoPE * acumulosVariacao;
                            const chaveVariacao = montarChaveUsoHabilidade(
                              card.personagemSessaoId,
                              habilidade.id,
                              variacao.id,
                            );
                            const qtdSustentacaoVariacaoAtiva =
                              obterQtdSustentacaoAtiva(habilidade.id, variacao.id);

                            return (
                              <div
                                key={`variacao-${variacao.id}`}
                                className="w-full rounded border border-app-border bg-app-bg px-2 py-1.5 space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[11px] font-semibold text-app-fg">
                                    {textoSeguro(variacao.nome)}
                                  </p>
                                  {qtdSustentacaoVariacaoAtiva > 0 ? (
                                    <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                                      Ativa x{qtdSustentacaoVariacaoAtiva}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[11px] text-app-muted">{textoSeguro(variacao.descricao)}</p>
                                <p className="text-[11px] text-app-muted">
                                  {textoSeguro(execucaoVariacao)}
                                  {alcanceVariacao ? ` | Alcance: ${textoSeguro(alcanceVariacao)}` : ''}
                                  {alvoVariacao ? ` | Alvo: ${textoSeguro(alvoVariacao)}` : ''}
                                  {duracaoVariacao ? ` | Duracao: ${textoSeguro(duracaoVariacao)}` : ''}
                                </p>
                                <p className="text-[11px] text-app-muted">
                                  Custo: {formatarCustos(custoVariacao.custoEA, custoVariacao.custoPE)}
                                  {custoVariacao.sustentada
                                    ? ` | Sustentacao: ${formatarCustos(
                                        custoVariacao.custoSustentacaoEA ?? 0,
                                        custoVariacao.custoSustentacaoPE ?? 0,
                                      )}/rodada`
                                    : ''}
                                </p>
                                {variacao.efeitoAdicional ? (
                                  <p className="text-[11px] text-app-muted whitespace-pre-wrap">
                                    {textoSeguro(variacao.efeitoAdicional)}
                                  </p>
                                ) : null}

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {custoVariacao.escalonavel ? (
                                    <>
                                      <input
                                        type="number"
                                        min={0}
                                        max={custoVariacao.acumulosMaximos}
                                        value={acumulosHabilidade[chaveAcumuloVariacao] ?? '0'}
                                        onChange={(event) => {
                                          const normalizado = parseAcumulos(
                                            event.target.value,
                                            custoVariacao.acumulosMaximos,
                                          );
                                          setAcumulosHabilidade((estadoAtual) => ({
                                            ...estadoAtual,
                                            [chaveAcumuloVariacao]: String(normalizado),
                                          }));
                                        }}
                                        disabled={!card.podeEditar || sessaoEncerrada}
                                        className="w-14 rounded border border-app-border bg-app-surface px-1.5 py-1 text-[11px] text-app-fg"
                                        title={`Acumulos (max ${custoVariacao.acumulosMaximos})`}
                                      />
                                      <span className="text-[11px] text-app-muted">
                                        {`max ${custoVariacao.acumulosMaximos} | +EA ${custoVariacao.escalonamentoCustoEA}/acumulo${custoVariacao.escalonamentoCustoPE > 0 ? ` | +PE ${custoVariacao.escalonamentoCustoPE}/acumulo` : ''}`}
                                      </span>
                                    </>
                                  ) : null}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      void handleUsarHabilidade(
                                        card.personagemSessaoId,
                                        habilidade.id,
                                        variacao.id,
                                        acumulosVariacao,
                                      )
                                    }
                                    disabled={
                                      !card.podeEditar ||
                                      sessaoEncerrada ||
                                      acaoHabilidadePendente === chaveVariacao
                                    }
                                    title={`Custo total: ${formatarCustos(custoVariacaoTotalEA, custoVariacaoTotalPE)}`}
                                  >
                                    {acaoHabilidadePendente === chaveVariacao
                                      ? 'Aplicando...'
                                      : 'Usar variacao'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            );
          };

          return (
            <CharacterSessionCard
              key={card.personagemSessaoId}
              card={card}
              iniciativaValor={iniciativaValor ?? null}
              cardRecursosExpandido={cardRecursosExpandido}
              abaDetalheCard={abaDetalheCard}
              totalCondicoesAtivasCard={totalCondicoesAtivasCard}
              totalTecnicasCard={totalTecnicasCard}
              totalSustentacoesAtivasCard={totalSustentacoesAtivasCard}
              mostrarSomenteSustentadasAtivas={Boolean(
                mostrarSomenteSustentadas[card.personagemSessaoId],
              )}
              onToggleMostrarSomenteSustentadas={(checked) =>
                setMostrarSomenteSustentadas((estadoAtual) => ({
                  ...estadoAtual,
                  [card.personagemSessaoId]: checked,
                }))
              }
              onAtualizarAbaDetalheCard={(aba) =>
                atualizarAbaDetalheCard(card.personagemSessaoId, aba)
              }
              ajustesRecursos={ajustesRecursos}
              campoRecursoPendenteCard={campoRecursoPendenteCard}
              sessaoEncerrada={sessaoEncerrada}
              salvandoCardId={salvandoCardId}
              acaoHabilidadePendente={acaoHabilidadePendente}
              onAlternarExpandido={() =>
                setCardsRecursosExpandidos((estadoAtual) => ({
                  ...estadoAtual,
                  [card.personagemSessaoId]:
                    !estadoAtual[card.personagemSessaoId],
                }))
              }
              onAtualizarAjusteRecursoPersonalizado={(campo, valor) =>
                atualizarAjusteRecursoCard(card.personagemCampanhaId, campo, valor)
              }
              onAplicarDeltaRecurso={(campo, delta) =>
                void handleAplicarDeltaRecursoCard(card, campo, delta)
              }
              onAplicarAjustePersonalizado={(campo) =>
                void handleAplicarAjustePersonalizadoRecursoCard(card, campo)
              }
              onAbrirEdicaoPersonagem={() => handleAbrirEdicaoPersonagem(card)}
              onAbrirFichaCompleta={() =>
                window.open(
                  `/personagens-base/${card.personagemBaseId}`,
                  '_blank',
                  'noopener,noreferrer',
                )
              }
              renderPainelCondicoes={renderPainelCondicoes}
              renderTecnica={renderTecnica}
              onEncerrarSustentacao={(personagemSessaoId, sustentacaoId) =>
                void handleEncerrarSustentacao(personagemSessaoId, sustentacaoId)
              }
              formatarCustos={formatarCustos}
            />
          );
        })
      )}
    </>
  );
  function handleAbrirEdicaoPersonagem(card: SessaoCampanhaDetalhe['cards'][number]) {
    if (!card.recursos) return;

    setPersonagemEmEdicao({
      id: card.personagemCampanhaId,
      nome: card.nomePersonagem,
      recursos: card.recursos,
    });
  }

  function handlePersonagemAtualizadoNoModal(personagem: PersonagemCampanhaResumo) {
    setDetalhe((anterior) => {
      if (!anterior) return anterior;

      return {
        ...anterior,
        cards: anterior.cards.map((card) => {
          if (card.personagemCampanhaId !== personagem.id || !card.recursos) {
            return card;
          }

          return {
            ...card,
            recursos: {
              pvAtual: personagem.recursos.pvAtual,
              pvMax: personagem.recursos.pvMax,
              peAtual: personagem.recursos.peAtual,
              peMax: personagem.recursos.peMax,
              eaAtual: personagem.recursos.eaAtual,
              eaMax: personagem.recursos.eaMax,
              sanAtual: personagem.recursos.sanAtual,
              sanMax: personagem.recursos.sanMax,
            },
          };
        }),
      };
    });

    setAjustesRecursosPorCard((anterior) => ({
      ...anterior,
      [personagem.id]: {
        ...AJUSTE_RECURSO_PADRAO,
      },
    }));

    void sincronizarTempoReal();
  }

  if (authLoading || loading) {
    return (
      <Loading
        message="Carregando sessao da campanha..."
        className="p-6 text-app-fg"
      />
    );
  }

  if (!detalhe) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {erro ? <ErrorAlert message={erro} /> : null}
          {!erro ? (
            <EmptyState
              variant="card"
              icon="campaign"
              title="Sessao nao encontrada"
              description="Verifique o link da sessao ou volte para a campanha."
            />
          ) : null}
          <Button variant="ghost" onClick={() => router.push(`/campanhas/${campanhaId}`)}>
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar para campanha
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="session-page-shell min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <header className="session-hero flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-2xl font-bold text-app-fg">{tituloSessao}</h1>
            <p className="text-sm text-app-muted">
              Sessao iniciada em {formatarDataHora(detalhe.iniciadoEm)}
            </p>
            {sessaoEncerrada ? (
              <p className="text-xs text-app-muted">
                Sessao encerrada em{' '}
                {detalhe.encerradoEm ? formatarDataHora(detalhe.encerradoEm) : '-'}
              </p>
            ) : null}
            <p className="text-xs text-app-muted">
              Participantes online: {totalParticipantesOnline}/{participantes.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={sessaoEncerrada ? 'gray' : 'green'} size="md">
              {sessaoEncerrada ? 'Sessao encerrada' : 'Sessao ativa'}
            </Badge>
            <Button variant="ghost" onClick={() => router.push(`/campanhas/${campanhaId}`)}>
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar para campanha
            </Button>
          </div>
        </header>

        <SessionOperationalBar
          cenaLabel={labelCena(detalhe.cenaAtual.tipo)}
          cenaNome={detalhe.cenaAtual.nome}
          rodadaAtual={detalhe.rodadaAtual}
          turnoAtualLabel={turnoAtualLabel}
          proximoTurnoLabel={proximoTurnoLabel}
          sessaoEncerrada={sessaoEncerrada}
          realtimeAtivo={socketConectado}
          controleTurnosAtivo={detalhe.controleTurnosAtivo}
          podeControlarSessao={podeControlarSessao}
          acaoTurnoPendente={acaoTurnoPendente}
          onAvancarTurno={() => void handleControleTurno('AVANCAR')}
          onPularTurno={() => void handleControleTurno('PULAR')}
          onVoltarTurno={() => void handleControleTurno('VOLTAR')}
        />

        {erro ? <ErrorAlert message={erro} /> : null}

        <div className={gridSessaoClassName}>
          {!colunaEsquerdaRecolhida ? (
            <section className="session-column space-y-3">
              <button
                type="button"
                className="session-column-toggle session-column-toggle--left"
                onClick={() => setColunaEsquerdaRecolhida(true)}
                title="Ocultar painel esquerdo"
              >
                <Icon name="chevron-left" className="h-3.5 w-3.5" />
              </button>
            {podeControlarSessao ? (
              <SessionPanel
                title="Escudo do Mestre"
                subtitle="Guias rapidos com regras operacionais da mesa."
                right={
                  <span className="inline-flex items-center justify-center rounded-full border border-app-border bg-app-surface p-2">
                    <Icon name="shield" className="h-4 w-4 text-app-fg" />
                  </span>
                }
              >
                <MestreShieldGuide />
              </SessionPanel>
            ) : (
              renderCardsSessao()
            )}

            <SessionNpcsPanel
              npcs={npcs}
              podeControlarSessao={podeControlarSessao}
              sessaoEncerrada={sessaoEncerrada}
              npcsDisponiveis={npcsDisponiveis}
              edicaoNpcs={edicaoNpcs}
              salvandoNpcId={salvandoNpcId}
              removendoNpcId={removendoNpcId}
              onAbrirAdicionar={() => setModalAdicionarNpcAberto(true)}
              onAtualizarCampo={atualizarCampoEdicaoNpc}
              onSalvarNpc={(npc) => void handleSalvarNpc(npc)}
              onSolicitarRemoverNpc={(npc) => setNpcRemocaoConfirmacao(npc)}
              renderPainelCondicoes={renderPainelCondicoes}
            />
            </section>
          ) : null}

          <section className="space-y-3">
            {(colunaEsquerdaRecolhida || colunaDireitaRecolhida) ? (
              <div className="flex items-center justify-between gap-2">
                {colunaEsquerdaRecolhida ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setColunaEsquerdaRecolhida(false)}
                    title="Mostrar painel esquerdo"
                  >
                    <Icon name="chevron-right" className="h-3.5 w-3.5" />
                    <span className="ml-1 hidden md:inline">Mostrar painel esquerdo</span>
                  </Button>
                ) : (
                  <span />
                )}
                {colunaDireitaRecolhida ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setColunaDireitaRecolhida(false)}
                    title="Mostrar painel direito"
                  >
                    <Icon name="chevron-left" className="h-3.5 w-3.5" />
                    <span className="ml-1 hidden md:inline">Mostrar painel lateral</span>
                  </Button>
                ) : null}
              </div>
            ) : null}
            {podeControlarSessao ? renderCardsSessao() : null}

            <SessionInitiativePanel
              sessaoEncerrada={sessaoEncerrada}
              controleTurnosAtivo={detalhe.controleTurnosAtivo}
              iniciativaOrdem={iniciativaOrdem}
              iniciativaIndiceAtual={iniciativaIndiceAtual}
              podeControlarSessao={podeControlarSessao}
              reordenandoIniciativa={reordenandoIniciativa}
              indiceIniciativaArrastado={indiceIniciativaArrastado}
              indiceIniciativaHover={indiceIniciativaHover}
              onSetIndiceIniciativaArrastado={setIndiceIniciativaArrastado}
              onSetIndiceIniciativaHover={setIndiceIniciativaHover}
              onDropIniciativa={(indiceDestino) =>
                void handleDropIniciativa(indiceDestino)
              }
              onMoverIniciativa={(indice, direcao) =>
                void handleMoverIniciativa(indice, direcao)
              }
              labelParticipanteIniciativa={labelParticipanteIniciativa}
            />

            <SessionMasterControls
              podeControlarSessao={podeControlarSessao}
              sessaoEncerrada={sessaoEncerrada}
              controleTurnosAtivo={detalhe.controleTurnosAtivo}
              cenaTipo={cenaTipo}
              cenaNome={cenaNome}
              opcoesCena={OPCOES_CENA}
              atualizandoCena={atualizandoCena}
              acaoTurnoPendente={acaoTurnoPendente}
              encerrandoSessao={encerrandoSessao}
              onCenaTipoChange={setCenaTipo}
              onCenaNomeChange={setCenaNome}
              onAtualizarCena={() => void handleAtualizarCena(cenaTipo, cenaNome)}
              onControleTurno={(acao) => void handleControleTurno(acao)}
              onSolicitarEncerrarSessao={() =>
                setConfirmarEncerrarSessaoAberto(true)
              }
            />
          </section>

          {!colunaDireitaRecolhida ? (
            <section className="session-column space-y-3 xl:sticky xl:top-4 xl:self-start">
              <button
                type="button"
                className="session-column-toggle session-column-toggle--right"
                onClick={() => setColunaDireitaRecolhida(true)}
                title="Ocultar painel direito"
              >
                <Icon name="chevron-left" className="h-3.5 w-3.5" />
              </button>
            <SessionPanel
              title="Painel lateral"
              subtitle="Chat, eventos e participantes da sessao."
              right={
                <Badge color={socketConectado ? 'cyan' : 'yellow'} size="sm">
                  {socketConectado ? 'Tempo real' : 'Atualizacao periodica'}
                </Badge>
              }
            >
              <SessionSidebarTabs
                activeTab={abaPainelDireitoAtiva}
                onChange={setAbaPainelDireitoAtiva}
                totalChat={chat.length}
                totalEventos={eventosSessao.length}
                totalParticipantes={participantes.length}
              >
                {abaPainelDireitoAtiva === 'participantes' ? (
                  <ParticipantsPanel
                    participantes={participantes}
                    onlineSet={onlineSet}
                  />
                ) : null}

                {abaPainelDireitoAtiva === 'eventos' ? (
                  <TimelinePanel
                    eventosSessao={eventosSessao}
                    sessaoEncerrada={sessaoEncerrada}
                    podeControlarSessao={podeControlarSessao}
                    desfazendoEventoId={desfazendoEventoId}
                    onAbrirDetalhes={(evento) => {
                      setEventoDetalheModal(evento);
                      setMotivoDesfazerEventoModal('');
                    }}
                    onDesfazerEvento={(evento) => solicitarDesfazerEvento(evento)}
                  />
                ) : null}

                {abaPainelDireitoAtiva === 'chat' ? (
                  <ChatPanel
                    chat={chat}
                    mensagem={mensagem}
                    enviandoMensagem={enviandoMensagem}
                    sessaoEncerrada={sessaoEncerrada}
                    onMensagemChange={setMensagem}
                    onEnviarMensagem={() => void handleEnviarMensagem()}
                    fimChatRef={fimChatRef}
                  />
                ) : null}
              </SessionSidebarTabs>
            </SessionPanel>
            </section>
          ) : null}
        </div>

        <AddNpcModal
          isOpen={modalAdicionarNpcAberto}
          onClose={() => setModalAdicionarNpcAberto(false)}
          onConfirm={() =>
            void handleAdicionarNpcNaCena(Number(npcSelecionadoId), nomeNpcCustomizado)
          }
          adicionando={adicionandoNpc}
          sessaoEncerrada={sessaoEncerrada}
          npcsDisponiveis={npcsDisponiveis}
          npcSelecionadoId={npcSelecionadoId}
          onNpcSelecionadoChange={setNpcSelecionadoId}
          nomeNpcCustomizado={nomeNpcCustomizado}
          onNomeNpcCustomizadoChange={setNomeNpcCustomizado}
        />

        <ConfirmEndSessionModal
          isOpen={confirmarEncerrarSessaoAberto}
          onClose={() => setConfirmarEncerrarSessaoAberto(false)}
          onConfirm={() => void handleEncerrarSessao()}
          encerrandoSessao={encerrandoSessao}
          sessaoEncerrada={sessaoEncerrada}
        />

        <ConfirmNpcRemovalModal
          npc={npcRemocaoConfirmacao}
          onClose={() => setNpcRemocaoConfirmacao(null)}
          onConfirm={(npcSessaoId) => void handleRemoverNpc(npcSessaoId)}
          removendoNpcId={removendoNpcId}
          sessaoEncerrada={sessaoEncerrada}
          textoSeguro={textoSeguro}
        />

        <CondicoesModal
          modalCondicoes={modalCondicoesAberto}
          busca={buscaCondicoesModal}
          onBuscaChange={setBuscaCondicoesModal}
          condicoesFiltradas={condicoesFiltradasModal}
          formCondicao={formCondicaoModal}
          campoDuracaoDesabilitado={campoDuracaoCondicaoModalDesabilitado}
          condicoesAtivas={condicoesAtivasModal}
          sessaoEncerrada={sessaoEncerrada}
          acaoCondicaoPendente={acaoCondicaoPendente}
          onClose={() => {
            setModalCondicoesAberto(null);
            setBuscaCondicoesModal('');
          }}
          onSelecionarCondicao={(condicaoId) => {
            if (!modalCondicoesAberto) return;
            atualizarCampoFormCondicao(
              modalCondicoesAberto.alvoTipo,
              modalCondicoesAberto.alvoId,
              'condicaoId',
              condicaoId,
            );
          }}
          onAtualizarCampo={(campo, valor) => {
            if (!modalCondicoesAberto) return;
            atualizarCampoFormCondicao(
              modalCondicoesAberto.alvoTipo,
              modalCondicoesAberto.alvoId,
              campo,
              valor,
            );
          }}
          onAplicarCondicao={() => {
            if (!modalCondicoesAberto) return;
            void handleAplicarCondicao(
              modalCondicoesAberto.alvoTipo,
              modalCondicoesAberto.alvoId,
            );
          }}
          onRemoverCondicao={(condicao) => {
            if (!modalCondicoesAberto) return;
            solicitarRemocaoCondicao(
              modalCondicoesAberto.alvoTipo,
              modalCondicoesAberto.alvoId,
              condicao,
            );
          }}
          opcoesDuracao={OPCOES_DURACAO_CONDICAO}
          chaveAcaoAplicar={
            modalCondicoesAberto
              ? chaveAcaoAplicarCondicao(
                  modalCondicoesAberto.alvoTipo,
                  modalCondicoesAberto.alvoId,
                )
              : null
          }
          chaveAcaoRemover={chaveAcaoRemoverCondicao}
        />

        <EventoDetalheModal
          evento={eventoDetalheModal}
          onClose={() => {
            setEventoDetalheModal(null);
            setMotivoDesfazerEventoModal('');
          }}
          onDesfazerEvento={(evento, motivo) =>
            solicitarDesfazerEvento(evento, motivo)
          }
          sessaoEncerrada={sessaoEncerrada}
          podeControlarSessao={podeControlarSessao}
          desfazendoEventoId={desfazendoEventoId}
          motivoDesfazer={motivoDesfazerEventoModal}
          onMotivoDesfazerChange={setMotivoDesfazerEventoModal}
          dadosEventoDetalhe={dadosEventoDetalheModal}
        />

        <CampaignCharacterEditorModal
          isOpen={Boolean(personagemEmEdicao)}
          campanhaId={campanhaId}
          personagem={personagemEmEdicao}
          contextoSessao={{
            sessaoId,
            cenaId: detalhe.cenaAtual.id ?? undefined,
          }}
          onClose={() => setPersonagemEmEdicao(null)}
          onPersonagemAtualizado={handlePersonagemAtualizadoNoModal}
        />

        <ConfirmDialog
          isOpen={confirmacaoAberta}
          onClose={fecharConfirmacao}
          onConfirm={confirmarAcao}
          title={confirmacaoOptions?.title ?? ''}
          description={confirmacaoOptions?.description ?? ''}
          confirmLabel={confirmacaoOptions?.confirmLabel}
          cancelLabel={confirmacaoOptions?.cancelLabel}
          variant={confirmacaoOptions?.variant}
        />
      </div>
    </main>
  );
}

