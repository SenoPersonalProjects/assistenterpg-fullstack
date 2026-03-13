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
import { SessionCharactersPanel } from '@/components/campanha/sessao/SessionCharactersPanel';
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
import { formatarDataHora } from '@/lib/utils/formatters';
import {
  carregarFiltroSustentadasLobby,
  salvarFiltroSustentadasLobby,
} from '@/lib/campanha/sessao-filtro-sustentadas';
import {
  carregarPreferenciasSessao,
  salvarPreferenciasSessao,
  type AbaDetalheCard,
} from '@/lib/campanha/sessao-preferencias';
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
import { useSessionConditionsPanel } from '@/hooks/useSessionConditionsPanel';

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
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);
  const [erroCena, setErroCena] = useState<string | null>(null);
  const [erroTurnos, setErroTurnos] = useState<string | null>(null);
  const [erroIniciativa, setErroIniciativa] = useState<string | null>(null);
  const [erroEncerramento, setErroEncerramento] = useState<string | null>(null);
  const [erroChat, setErroChat] = useState<string | null>(null);
  const [erroNpcs, setErroNpcs] = useState<string | null>(null);
  const [erroCondicoes, setErroCondicoes] = useState<string | null>(null);
  const [erroEventos, setErroEventos] = useState<string | null>(null);
  const [erroCards, setErroCards] = useState<string | null>(null);
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
  const [tecnicasInatasAbertas, setTecnicasInatasAbertas] = useState<
    Record<number, boolean>
  >({});
  const [tecnicasNaoInatasAbertas, setTecnicasNaoInatasAbertas] = useState<
    Record<number, boolean>
  >({});
  const [preferenciasHydrated, setPreferenciasHydrated] = useState(false);
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

  useEffect(() => {
    if (!idsValidos || !usuario) {
      setAbasDetalheCard({});
      setTecnicasInatasAbertas({});
      setTecnicasNaoInatasAbertas({});
      setPreferenciasHydrated(false);
      return;
    }

    const prefs = carregarPreferenciasSessao(usuario.id, campanhaId, sessaoId);
    setAbasDetalheCard(prefs.abasDetalheCard);
    setTecnicasInatasAbertas(prefs.tecnicasInatasAbertas);
    setTecnicasNaoInatasAbertas(prefs.tecnicasNaoInatasAbertas);
    setPreferenciasHydrated(true);
  }, [campanhaId, idsValidos, sessaoId, usuario]);

  useEffect(() => {
    if (!idsValidos || !usuario || !preferenciasHydrated) return;

    salvarPreferenciasSessao(usuario.id, campanhaId, sessaoId, {
      abasDetalheCard,
      tecnicasInatasAbertas,
      tecnicasNaoInatasAbertas,
    });
  }, [
    abasDetalheCard,
    campanhaId,
    idsValidos,
    preferenciasHydrated,
    sessaoId,
    tecnicasInatasAbertas,
    tecnicasNaoInatasAbertas,
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
    setErroGlobal(null);
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
      setErroGlobal(extrairMensagemErro(error));
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
    setErro: setErroCena,
    showToast,
  });

  const { acaoTurnoPendente, handleControleTurno } = useSessaoTurnos({
    campanhaId,
    sessaoId,
    detalhe,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro: setErroTurnos,
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
    setErro: setErroIniciativa,
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
    setErro: setErroCondicoes,
    showToast,
  });

  const { acaoHabilidadePendente, handleUsarHabilidade, handleEncerrarSustentacao } =
    useSessaoHabilidades({
      campanhaId,
      sessaoId,
      sessaoEncerrada,
      setDetalhe: (atualizado) => setDetalhe(atualizado),
      sincronizarEstadosDerivados,
      setErro: setErroCards,
      cooldownMs: COOLDOWN_USO_HABILIDADE_MS,
    });

  const { salvandoCardId, campoRecursoPendente, handleAplicarDeltaRecursoCard, handleAplicarAjustePersonalizadoRecursoCard } =
    useSessaoRecursos({
      campanhaId,
      sessaoId,
      sessaoEncerrada,
      setDetalhe: (atualizado) => setDetalhe(atualizado),
      sincronizarEstadosDerivados,
      setErro: setErroCards,
      obterAjustesRecursosCard,
    });

  const { adicionandoNpc, salvandoNpcId, removendoNpcId, handleAdicionarNpcNaCena, handleSalvarNpc, handleRemoverNpc } =
    useSessaoNpc({
      campanhaId,
      sessaoId,
      edicaoNpcs,
      setDetalhe: (atualizado) => setDetalhe(atualizado),
      sincronizarEstadosDerivados,
      setErro: setErroNpcs,
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
    setErro: setErroChat,
  });

  const { encerrandoSessao, handleEncerrarSessao } = useSessaoEncerramento({
    campanhaId,
    sessaoId,
    detalhe,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro: setErroEncerramento,
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
    setErro: setErroEventos,
    onEventoDesfeito: () => {
      setMotivoDesfazerEventoModal('');
      setEventoDetalheModal(null);
    },
  });

  const solicitarDesfazerEvento = useCallback(
    (
      evento: EventoSessaoTimeline,
      motivo?: string,
      origem: 'lista' | 'detalhe' = 'lista',
    ) => {
      if (origem === 'detalhe') {
        void handleDesfazerEvento(evento.id, motivo);
        return;
      }

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
      origem: 'inline' | 'accordion' | 'modal' = 'inline',
    ) => {
      const requerConfirmacao =
        origem !== 'modal' &&
        (condicao.automatica || condicao.duracaoModo === 'ATE_REMOVER');

      if (!requerConfirmacao) {
        void handleRemoverCondicao(alvoTipo, alvoId, condicao.id);
        return;
      }

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
      setErroGlobal('IDs de campanha/sessao invalidos.');
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

  const atualizarAbaDetalheCard = useCallback(
    (personagemSessaoId: number, aba: AbaDetalheCard) => {
      setAbasDetalheCard((estadoAtual) => ({
        ...estadoAtual,
        [personagemSessaoId]: aba,
      }));
    },
    [],
  );

  const atualizarTecnicasInatasAbertas = useCallback(
    (personagemSessaoId: number, aberto: boolean) => {
      setTecnicasInatasAbertas((estadoAtual) => ({
        ...estadoAtual,
        [personagemSessaoId]: aberto,
      }));
    },
    [],
  );

  const atualizarTecnicasNaoInatasAbertas = useCallback(
    (personagemSessaoId: number, aberto: boolean) => {
      setTecnicasNaoInatasAbertas((estadoAtual) => ({
        ...estadoAtual,
        [personagemSessaoId]: aberto,
      }));
    },
    [],
  );

  const atualizarAcumuloHabilidade = useCallback((chave: string, valor: string) => {
    setAcumulosHabilidade((estadoAtual) => ({
      ...estadoAtual,
      [chave]: valor,
    }));
  }, []);

  const alternarCardExpandido = useCallback((personagemSessaoId: number) => {
    setCardsRecursosExpandidos((estadoAtual) => ({
      ...estadoAtual,
      [personagemSessaoId]: !estadoAtual[personagemSessaoId],
    }));
  }, []);

  const atualizarFiltroSustentadas = useCallback(
    (personagemSessaoId: number, checked: boolean) => {
      setMostrarSomenteSustentadas((estadoAtual) => ({
        ...estadoAtual,
        [personagemSessaoId]: checked,
      }));
    },
    [],
  );

  const renderPainelCondicoes = useSessionConditionsPanel({
    catalogoCondicoes,
    obterFormCondicaoAlvo,
    chaveAcaoAplicarCondicao,
    chaveAcaoRemoverCondicao,
    podeControlarSessao,
    sessaoEncerrada,
    acaoCondicaoPendente,
    erro: erroCondicoes,
    onAbrirModal: (modal) => setModalCondicoesAberto(modal),
    onRemoverCondicao: (alvoTipo, alvoId, condicao, modo) =>
      solicitarRemocaoCondicao(alvoTipo, alvoId, condicao, modo),
  });

  const renderCardsSessao = () => (
    <SessionCharactersPanel
      cards={cards}
      iniciativaPorPersonagemSessao={iniciativaPorPersonagemSessao}
      cardsRecursosExpandidos={cardsRecursosExpandidos}
      onAlternarExpandido={alternarCardExpandido}
      obterAjustesRecursosCard={obterAjustesRecursosCard}
      onAtualizarAjusteRecursoCard={atualizarAjusteRecursoCard}
      campoRecursoPendente={campoRecursoPendente}
      salvandoCardId={salvandoCardId}
      sessaoEncerrada={sessaoEncerrada}
      acaoHabilidadePendente={acaoHabilidadePendente}
      mostrarSomenteSustentadas={mostrarSomenteSustentadas}
      onToggleMostrarSomenteSustentadas={atualizarFiltroSustentadas}
      abasDetalheCard={abasDetalheCard}
      onAtualizarAbaDetalheCard={atualizarAbaDetalheCard}
      tecnicasInatasAbertas={tecnicasInatasAbertas}
      onToggleTecnicaInata={atualizarTecnicasInatasAbertas}
      tecnicasNaoInatasAbertas={tecnicasNaoInatasAbertas}
      onToggleTecnicasNaoInatas={atualizarTecnicasNaoInatasAbertas}
      acumulosHabilidade={acumulosHabilidade}
      onAtualizarAcumulosHabilidade={atualizarAcumuloHabilidade}
      onUsarHabilidade={(personagemSessaoId, habilidadeTecnicaId, variacaoId, acumulos) =>
        void handleUsarHabilidade(
          personagemSessaoId,
          habilidadeTecnicaId,
          variacaoId,
          acumulos,
        )
      }
      onEncerrarSustentacao={(personagemSessaoId, sustentacaoId) =>
        void handleEncerrarSustentacao(personagemSessaoId, sustentacaoId)
      }
      onAplicarDeltaRecursoCard={(card, campo, delta) =>
        void handleAplicarDeltaRecursoCard(card, campo, delta)
      }
      onAplicarAjustePersonalizadoRecursoCard={(card, campo) =>
        void handleAplicarAjustePersonalizadoRecursoCard(card, campo)
      }
      onAbrirEdicaoPersonagem={handleAbrirEdicaoPersonagem}
      onAbrirFichaCompleta={handleAbrirFichaCompleta}
      renderPainelCondicoes={renderPainelCondicoes}
      erro={erroCards}
    />
  );

  function handleAbrirFichaCompleta(card: SessaoCampanhaDetalhe['cards'][number]) {
    window.open(
      `/personagens-base/${card.personagemBaseId}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

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
          {erroGlobal ? <ErrorAlert message={erroGlobal} /> : null}
          {!erroGlobal ? (
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
          </div>
          <div className="flex items-center gap-2">
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
          totalParticipantesOnline={totalParticipantesOnline}
          totalParticipantes={participantes.length}
          erro={erroTurnos}
          acaoTurnoPendente={acaoTurnoPendente}
          onAvancarTurno={() => void handleControleTurno('AVANCAR')}
          onPularTurno={() => void handleControleTurno('PULAR')}
          onVoltarTurno={() => void handleControleTurno('VOLTAR')}
        />

        {erroGlobal ? <ErrorAlert message={erroGlobal} /> : null}

        {colunaEsquerdaRecolhida ? (
          <button
            type="button"
            className="session-column-handle session-column-handle--left"
            onClick={() => setColunaEsquerdaRecolhida(false)}
            aria-label="Mostrar painel esquerdo"
          >
            <Icon name="chevron-right" className="h-3.5 w-3.5" />
            <span className="session-column-handle__text">
              Mostrar painel esquerdo
            </span>
          </button>
        ) : null}
        {colunaDireitaRecolhida ? (
          <button
            type="button"
            className="session-column-handle session-column-handle--right"
            onClick={() => setColunaDireitaRecolhida(false)}
            aria-label="Mostrar painel lateral"
          >
            <Icon name="chevron-left" className="h-3.5 w-3.5" />
            <span className="session-column-handle__text">
              Mostrar painel lateral
            </span>
          </button>
        ) : null}

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
              erro={erroNpcs}
              onAbrirAdicionar={() => setModalAdicionarNpcAberto(true)}
              onAtualizarCampo={atualizarCampoEdicaoNpc}
              onSalvarNpc={(npc) => void handleSalvarNpc(npc)}
              onSolicitarRemoverNpc={(npc) => setNpcRemocaoConfirmacao(npc)}
              renderPainelCondicoes={renderPainelCondicoes}
            />
            </section>
          ) : null}

          <section className="space-y-3">
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
              erro={erroIniciativa}
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
              erroCena={erroCena}
              erroTurnos={erroTurnos}
              erroEncerramento={erroEncerramento}
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
                    erro={erroEventos}
                    onAbrirDetalhes={(evento) => {
                      setEventoDetalheModal(evento);
                      setMotivoDesfazerEventoModal('');
                    }}
                    onDesfazerEvento={(evento) => solicitarDesfazerEvento(evento, undefined, 'lista')}
                  />
                ) : null}

                {abaPainelDireitoAtiva === 'chat' ? (
                  <ChatPanel
                    chat={chat}
                    mensagem={mensagem}
                    enviandoMensagem={enviandoMensagem}
                    sessaoEncerrada={sessaoEncerrada}
                    usuarioId={usuario?.id ?? null}
                    erro={erroChat}
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
          erro={erroCondicoes}
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
              'modal',
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
            solicitarDesfazerEvento(evento, motivo, 'detalhe')
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

