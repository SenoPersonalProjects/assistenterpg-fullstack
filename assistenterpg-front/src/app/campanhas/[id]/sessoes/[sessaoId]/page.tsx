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
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';
import {
  apiAdminGetCondicoes,
  apiGetRelatorioSessaoCampanha,
  apiGetSessaoCampanha,
  apiGetMeusNpcsAmeacas,
  apiListarPersonagensCampanha,
  apiAdicionarPersonagemSessaoCampanha,
  apiAtualizarNucleoPersonagemCampanha,
  apiEnviarMensagemChatSessaoCampanha,
  apiRemoverPersonagemSessaoCampanha,
  apiSacrificarNucleoPersonagemCampanha,
  apiAtualizarValorIniciativaSessaoCampanha,
  apiListarChatSessaoCampanha,
  apiListarEventosSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  CondicaoAtivaSessaoCampanha,
  CondicaoCatalogo,
  EventoSessaoTimeline,
  MensagemChatSessao,
  NucleoAmaldicoadoCodigo,
  NpcAmeacaResumo,
  NpcSessaoCampanha,
  ParticipanteIniciativaSessaoCampanha,
  PersonagemCampanhaResumo,
  SessaoCampanhaDetalhe,
  SessaoCampanhaRelatorio,
  TipoCenaSessaoCampanha,
} from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
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
import { SessionSidebarPanel } from '@/components/campanha/sessao/SessionSidebarPanel';
import { SessionNpcsPanel } from '@/components/campanha/sessao/SessionNpcsPanel';
import { SessionPlayerSummaryPanel } from '@/components/campanha/sessao/SessionPlayerSummaryPanel';
import { SessionSceneRosterPanel } from '@/components/campanha/sessao/SessionSceneRosterPanel';
import { AddNpcModal } from '@/components/campanha/sessao/modals/AddNpcModal';
import { AddSimpleNpcModal } from '@/components/campanha/sessao/modals/AddSimpleNpcModal';
import { AddPersonagemModal } from '@/components/campanha/sessao/modals/AddPersonagemModal';
import { ConfirmEndSessionModal } from '@/components/campanha/sessao/modals/ConfirmEndSessionModal';
import { ConfirmNpcRemovalModal } from '@/components/campanha/sessao/modals/ConfirmNpcRemovalModal';
import { CondicoesModal } from '@/components/campanha/sessao/modals/CondicoesModal';
import { EventoDetalheModal } from '@/components/campanha/sessao/modals/EventoDetalheModal';
import { InitiativeValueModal } from '@/components/campanha/sessao/modals/InitiativeValueModal';
import { SessionPericiaRollModal } from '@/components/campanha/sessao/modals/SessionPericiaRollModal';
import {
  type AlvoCondicoesModal,
  type AjustesRecursosNpc,
  type CampoAjusteRecursoNpc,
  type HabilidadeRollContext,
  type NpcEditavel,
  type RolagemDanoHabilidadeSessaoPayload,
  type RolagemExpressaoSessaoPayload,
  type RolagemPericiaSessaoPayload,
  type RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';
import {
  descreverDuracaoCondicao,
  labelCena,
  textoSeguro,
} from '@/lib/campanha/sessao-formatters';
import { formatarDataHora } from '@/lib/utils/formatters';
import {
  calcularIndiceProximoTurno,
  COOLDOWN_USO_HABILIDADE_MS,
  OPCOES_DURACAO_CONDICAO,
  parseInteiroComSinal,
} from '@/lib/campanha/sessao-utils';
import { formatarCustos } from '@/lib/campanha/sessao-habilidades';
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
import { useSessaoRolagem } from '@/hooks/useSessaoRolagem';
import { useSessaoEncerramento } from '@/hooks/useSessaoEncerramento';
import { useSessaoEventos } from '@/hooks/useSessaoEventos';
import { useSessaoPreferencias } from '@/hooks/useSessaoPreferencias';
import { useSessaoFiltroSustentadas } from '@/hooks/useSessaoFiltroSustentadas';
import { useSessionConditionsPanel } from '@/hooks/useSessionConditionsPanel';
import { STORAGE_ANIMACAO_ROLAGEM_CHAT_KEY } from '@/lib/constants/rolagem';
import {
  construirMensagemDiceMultipla,
  construirMensagemDice,
  ehMensagemDice,
  formatarExpressaoDice,
  parseDiceExpression,
  rolarDados,
  type DiceRollPayload,
  validarComprimentoMensagemDice,
} from '@/lib/campanha/sessao-dice';

const OPCOES_CENA: Array<{ value: TipoCenaSessaoCampanha; label: string }> = [
  { value: 'LIVRE', label: 'Cena livre' },
  { value: 'INVESTIGACAO', label: 'Investigacao' },
  { value: 'FURTIVIDADE', label: 'Furtividade' },
  { value: 'COMBATE', label: 'Combate' },
  { value: 'PERSEGUICAO', label: 'Perseguicao' },
  { value: 'BASE', label: 'Base' },
  { value: 'OUTRA', label: 'Outra' },
];

const AJUSTE_RECURSO_NPC_PADRAO: AjustesRecursosNpc = {
  pv: '0',
  san: '0',
  ea: '0',
};

type PericiaRollModalState = {
  aberto: boolean;
  titulo: string;
  subtitulo?: string;
  alvoTipo?: 'PERSONAGEM' | 'NPC';
  alvoNome?: string;
  habilidadeContext?: HabilidadeRollContext | null;
  payload: DiceRollPayload | null;
  payloads?: DiceRollPayload[];
  expression?: string;
  expressions?: string[];
  enviando: boolean;
  enviado: boolean;
  erro: string | null;
};

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
    fichaTipo: npc.fichaTipo,
    tipo: npc.tipo,
    tamanho: npc.tamanho ?? 'MEDIO',
    defesa: String(npc.defesa),
    pontosVidaMax: String(npc.pontosVidaMax),
    sanMax: npc.sanMax === null ? '' : String(npc.sanMax),
    eaMax: npc.eaMax === null ? '' : String(npc.eaMax),
    machucado: npc.machucado === null ? '' : String(npc.machucado),
    agilidade:
      npc.atributos?.agilidade === undefined || npc.atributos === null
        ? ''
        : String(npc.atributos.agilidade),
    forca:
      npc.atributos?.forca === undefined || npc.atributos === null
        ? ''
        : String(npc.atributos.forca),
    intelecto:
      npc.atributos?.intelecto === undefined || npc.atributos === null
        ? ''
        : String(npc.atributos.intelecto),
    presenca:
      npc.atributos?.presenca === undefined || npc.atributos === null
        ? ''
        : String(npc.atributos.presenca),
    vigor:
      npc.atributos?.vigor === undefined || npc.atributos === null
        ? ''
        : String(npc.atributos.vigor),
    percepcao: String(
      npc.pericias.find((pericia) => pericia.codigo === 'PERCEPCAO')?.bonus ?? '',
    ),
    iniciativa: String(
      npc.pericias.find((pericia) => pericia.codigo === 'INICIATIVA')?.bonus ?? '',
    ),
    fortitude: String(
      npc.pericias.find((pericia) => pericia.codigo === 'FORTITUDE')?.bonus ?? '',
    ),
    reflexos: String(
      npc.pericias.find((pericia) => pericia.codigo === 'REFLEXOS')?.bonus ?? '',
    ),
    vontade: String(
      npc.pericias.find((pericia) => pericia.codigo === 'VONTADE')?.bonus ?? '',
    ),
    luta: String(
      npc.pericias.find((pericia) => pericia.codigo === 'LUTA')?.bonus ?? '',
    ),
    jujutsu: String(
      npc.pericias.find((pericia) => pericia.codigo === 'JUJUTSU')?.bonus ?? '',
    ),
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
  const [relatorioSessao, setRelatorioSessao] = useState<SessaoCampanhaRelatorio | null>(null);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [erroRelatorio, setErroRelatorio] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagemRolagem, setMensagemRolagem] = useState('');
  const [cenaTipo, setCenaTipo] = useState<TipoCenaSessaoCampanha>('LIVRE');
  const [cenaNome, setCenaNome] = useState('');
  const [limitesCategoriaAtivo, setLimitesCategoriaAtivo] = useState(false);
  const [ajustesRecursosPorCard, setAjustesRecursosPorCard] = useState<
    Record<number, AjustesRecursos>
  >({});
  const [cardsRecursosExpandidos, setCardsRecursosExpandidos] = useState<
    Record<number, boolean>
  >({});
  const [edicaoNpcs, setEdicaoNpcs] = useState<Record<number, NpcEditavel>>({});
  const [ajustesRecursosNpc, setAjustesRecursosNpc] = useState<
    Record<number, AjustesRecursosNpc>
  >({});
  const [catalogoCondicoes, setCatalogoCondicoes] = useState<CondicaoCatalogo[]>([]);
  const [npcsDisponiveis, setNpcsDisponiveis] = useState<NpcAmeacaResumo[]>([]);
  const [npcSelecionadoId, setNpcSelecionadoId] = useState('');
  const [nomeNpcCustomizado, setNomeNpcCustomizado] = useState('');
  const [npcSanAtual, setNpcSanAtual] = useState('');
  const [npcSanMax, setNpcSanMax] = useState('');
  const [npcEaAtual, setNpcEaAtual] = useState('');
  const [npcEaMax, setNpcEaMax] = useState('');
  const [npcIniciativaValor, setNpcIniciativaValor] = useState('');
  const [modalAdicionarNpcAberto, setModalAdicionarNpcAberto] = useState(false);
  const [modalAdicionarNpcSimplesAberto, setModalAdicionarNpcSimplesAberto] =
    useState(false);
  const [npcSimplesNome, setNpcSimplesNome] = useState('');
  const [npcSimplesDefesa, setNpcSimplesDefesa] = useState('');
  const [npcSimplesPvMax, setNpcSimplesPvMax] = useState('');
  const [npcSimplesIniciativaValor, setNpcSimplesIniciativaValor] = useState('');
  const [npcSimplesSanAtual, setNpcSimplesSanAtual] = useState('');
  const [npcSimplesSanMax, setNpcSimplesSanMax] = useState('');
  const [npcSimplesEaAtual, setNpcSimplesEaAtual] = useState('');
  const [npcSimplesEaMax, setNpcSimplesEaMax] = useState('');
  const [npcSimplesFichaTipo, setNpcSimplesFichaTipo] = useState<'NPC' | 'AMEACA'>(
    'NPC',
  );
  const [npcSimplesTipo, setNpcSimplesTipo] = useState<
    'OUTRO' | 'HUMANO' | 'FEITICEIRO' | 'MALDICAO' | 'ANIMAL' | 'HIBRIDO'
  >('OUTRO');
  const [npcSimplesTamanho, setNpcSimplesTamanho] = useState('MEDIO');
  const [npcSimplesAtributos, setNpcSimplesAtributos] = useState({
    agilidade: '',
    forca: '',
    intelecto: '',
    presenca: '',
    vigor: '',
  });
  const [npcSimplesPericias, setNpcSimplesPericias] = useState({
    percepcao: '',
    iniciativa: '',
    fortitude: '',
    reflexos: '',
    vontade: '',
    luta: '',
    jujutsu: '',
  });
  const [modalAdicionarPersonagemAberto, setModalAdicionarPersonagemAberto] =
    useState(false);
  const [personagensDisponiveis, setPersonagensDisponiveis] = useState<
    PersonagemCampanhaResumo[]
  >([]);
  const [carregandoPersonagensDisponiveis, setCarregandoPersonagensDisponiveis] =
    useState(false);
  const [adicionandoPersonagem, setAdicionandoPersonagem] = useState(false);
  const [personagemSelecionadoId, setPersonagemSelecionadoId] = useState('');
  const [personagemIniciativaValor, setPersonagemIniciativaValor] = useState('');
  const [removendoPersonagemSessaoId, setRemovendoPersonagemSessaoId] =
    useState<number | null>(null);
  const [modalIniciativaAberto, setModalIniciativaAberto] =
    useState<ParticipanteIniciativaSessaoCampanha | null>(null);
  const [valorIniciativaEdicao, setValorIniciativaEdicao] = useState('');
  const [salvandoIniciativa, setSalvandoIniciativa] = useState(false);
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
  const [erroRolagens, setErroRolagens] = useState<string | null>(null);
  const [erroNpcs, setErroNpcs] = useState<string | null>(null);
  const [erroCondicoes, setErroCondicoes] = useState<string | null>(null);
  const [erroEventos, setErroEventos] = useState<string | null>(null);
  const [erroCards, setErroCards] = useState<string | null>(null);
  const [animacaoRolagemChatAtiva, setAnimacaoRolagemChatAtiva] = useState(() => {
    if (typeof window === 'undefined') return false;
    const armazenado = window.localStorage.getItem(STORAGE_ANIMACAO_ROLAGEM_CHAT_KEY);
    return armazenado === 'on';
  });
  const [acumulosHabilidade, setAcumulosHabilidade] = useState<Record<string, string>>(
    {},
  );
  const [confirmarEncerrarSessaoAberto, setConfirmarEncerrarSessaoAberto] =
    useState(false);
  const [npcRemocaoConfirmacao, setNpcRemocaoConfirmacao] =
    useState<NpcSessaoCampanha | null>(null);
  const [escudoAberto, setEscudoAberto] = useState(true);
  const [personagemEmEdicao, setPersonagemEmEdicao] = useState<
    Pick<PersonagemCampanhaResumo, 'id' | 'nome' | 'recursos'> | null
  >(null);
  const [periciaRollModal, setPericiaRollModal] = useState<PericiaRollModalState>(
    {
      aberto: false,
      titulo: '',
      subtitulo: undefined,
      alvoTipo: undefined,
      alvoNome: undefined,
      habilidadeContext: null,
      payload: null,
      expression: undefined,
      enviando: false,
      enviado: false,
      erro: null,
    },
  );

  const shellRef = useRef<HTMLElement | null>(null);
  const operationalBarRef = useRef<HTMLElement | null>(null);
  const chatRef = useRef<MensagemChatSessao[]>([]);
  const fimChatRef = useRef<HTMLDivElement | null>(null);
  const sincronizandoTempoRealRef = useRef(false);

  const obterAjustesRecursosCard = useCallback(
    (personagemCampanhaId: number): AjustesRecursos =>
      ajustesRecursosPorCard[personagemCampanhaId] ?? AJUSTE_RECURSO_PADRAO,
    [ajustesRecursosPorCard],
  );

  const obterAjustesRecursosNpc = useCallback(
    (npcSessaoId: number): AjustesRecursosNpc =>
      ajustesRecursosNpc[npcSessaoId] ?? AJUSTE_RECURSO_NPC_PADRAO,
    [ajustesRecursosNpc],
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

  const atualizarAjusteRecursoNpc = useCallback(
    (npcSessaoId: number, campo: CampoAjusteRecursoNpc, valor: string) => {
      setAjustesRecursosNpc((estadoAtual) => ({
        ...estadoAtual,
        [npcSessaoId]: {
          ...(estadoAtual[npcSessaoId] ?? AJUSTE_RECURSO_NPC_PADRAO),
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
    const shell = shellRef.current;
    const bar = operationalBarRef.current;
    if (!shell || !bar) return;

    const atualizarOffset = () => {
      const rect = bar.getBoundingClientRect();
      const gap = 12;
      const altura = Math.max(0, Math.ceil(rect.height + gap));
      shell.style.setProperty('--session-panel-sticky-offset', `${altura}px`);
    };

    atualizarOffset();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(atualizarOffset);
      resizeObserver.observe(bar);
    }
    window.addEventListener('resize', atualizarOffset);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', atualizarOffset);
    };
  }, []);

  const { mostrarSomenteSustentadas, setMostrarSomenteSustentadas } =
    useSessaoFiltroSustentadas({
      idsValidos,
      usuarioId: usuario?.id,
      campanhaId,
      sessaoId,
    });

  const {
    abasDetalheCard,
    setAbasDetalheCard,
    tecnicasInatasAbertas,
    setTecnicasInatasAbertas,
    tecnicasNaoInatasAbertas,
    setTecnicasNaoInatasAbertas,
  } = useSessaoPreferencias({
    idsValidos,
    usuarioId: usuario?.id,
    campanhaId,
    sessaoId,
  });

  const sincronizarEstadosDerivados = useCallback(
    (proximoDetalhe: SessaoCampanhaDetalhe) => {
      setCenaTipo(proximoDetalhe.cenaAtual.tipo as TipoCenaSessaoCampanha);
      setCenaNome(proximoDetalhe.cenaAtual.nome ?? '');
      setLimitesCategoriaAtivo(Boolean(proximoDetalhe.cenaAtual.limitesCategoriaAtivo));

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
    [
      setAjustesRecursosPorCard,
      setCenaNome,
      setCenaTipo,
      setEdicaoNpcs,
      setLimitesCategoriaAtivo,
    ],
  );

  const carregarPersonagensDisponiveis = useCallback(async () => {
    if (!idsValidos || !usuario) return;

    setCarregandoPersonagensDisponiveis(true);
    setErroCards(null);
    try {
      const personagens = await apiListarPersonagensCampanha(campanhaId);
      const idsEmCena = new Set(
        (detalhe?.cards ?? []).map((card) => card.personagemCampanhaId),
      );
      const filtrados = personagens.filter(
        (personagem) => !idsEmCena.has(personagem.id),
      );
      const podeVerTodos = Boolean(detalhe?.permissoes.ehMestre);
      setPersonagensDisponiveis(
        podeVerTodos
          ? filtrados
          : filtrados.filter((personagem) => personagem.donoId === usuario.id),
      );
    } catch (error) {
      setErroCards(extrairMensagemErro(error));
    } finally {
      setCarregandoPersonagensDisponiveis(false);
    }
  }, [
    campanhaId,
    detalhe?.cards,
    detalhe?.permissoes.ehMestre,
    idsValidos,
    setErroCards,
    usuario,
  ]);

  useEffect(() => {
    if (!modalAdicionarPersonagemAberto) return;
    void carregarPersonagensDisponiveis();
  }, [carregarPersonagensDisponiveis, modalAdicionarPersonagemAberto]);

  useEffect(() => {
    if (!modalAdicionarPersonagemAberto) return;
    if (personagemSelecionadoId) return;
    if (personagensDisponiveis.length === 0) return;
    setPersonagemSelecionadoId(String(personagensDisponiveis[0].id));
  }, [
    modalAdicionarPersonagemAberto,
    personagemSelecionadoId,
    personagensDisponiveis,
  ]);

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
      const [detalheAtual, mensagensNovas] = await Promise.all([
        apiGetSessaoCampanha(campanhaId, sessaoId),
        apiListarChatSessaoCampanha(campanhaId, sessaoId, afterId),
      ]);
      const eventos = detalheAtual.permissoes.ehMestre
        ? await apiListarEventosSessaoCampanha(campanhaId, sessaoId, {
            limit: 80,
            incluirChat: false,
          })
        : [];

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
      const [detalheSessao, chatInicial] = await Promise.all([
        apiGetSessaoCampanha(campanhaId, sessaoId),
        apiListarChatSessaoCampanha(campanhaId, sessaoId),
      ]);
      const eventos = detalheSessao.permissoes.ehMestre
        ? await apiListarEventosSessaoCampanha(campanhaId, sessaoId, {
            limit: 80,
            incluirChat: false,
          })
        : [];
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

  const handleAdicionarPersonagemNaCena = useCallback(async () => {
    if (!idsValidos || !usuario) return;
    const personagemId = Number(personagemSelecionadoId);
    if (!Number.isInteger(personagemId) || personagemId <= 0) {
      setErroCards('Selecione um personagem valido.');
      return;
    }
    const iniciativaTexto = personagemIniciativaValor.trim();
    if (!iniciativaTexto) {
      setErroCards('Informe a iniciativa do personagem.');
      return;
    }
    const iniciativaValor = parseInteiroComSinal(iniciativaTexto);
    if (iniciativaValor === null) {
      setErroCards('Informe um valor inteiro valido para iniciativa.');
      return;
    }

    setAdicionandoPersonagem(true);
    setErroCards(null);
    try {
      const atualizado = await apiAdicionarPersonagemSessaoCampanha(
        campanhaId,
        sessaoId,
        {
          personagemCampanhaId: personagemId,
          iniciativaValor,
        },
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
      setModalAdicionarPersonagemAberto(false);
      setPersonagemSelecionadoId('');
      setPersonagemIniciativaValor('');
      showToast('Personagem adicionado na cena.', 'success');
    } catch (error) {
      setErroCards(extrairMensagemErro(error));
    } finally {
      setAdicionandoPersonagem(false);
    }
  }, [
    campanhaId,
    idsValidos,
    personagemIniciativaValor,
    personagemSelecionadoId,
    sessaoId,
    setErroCards,
    showToast,
    sincronizarEstadosDerivados,
    usuario,
  ]);

  const handleRemoverPersonagemDaCena = useCallback(
    async (card: SessaoCampanhaDetalhe['cards'][number]) => {
      if (!idsValidos || !usuario) return;
      setRemovendoPersonagemSessaoId(card.personagemSessaoId);
      setErroCards(null);
      try {
        const atualizado = await apiRemoverPersonagemSessaoCampanha(
          campanhaId,
          sessaoId,
          card.personagemSessaoId,
        );
        setDetalhe(atualizado);
        sincronizarEstadosDerivados(atualizado);
        showToast('Personagem removido da cena.', 'warning');
      } catch (error) {
        setErroCards(extrairMensagemErro(error));
      } finally {
        setRemovendoPersonagemSessaoId(null);
      }
    },
    [
      campanhaId,
      idsValidos,
      sessaoId,
      setErroCards,
      showToast,
      sincronizarEstadosDerivados,
      usuario,
    ],
  );

  const solicitarRemoverPersonagem = useCallback(
    (card: SessaoCampanhaDetalhe['cards'][number]) => {
      confirm({
        title: 'Remover personagem da cena?',
        description: `Remover ${textoSeguro(card.nomePersonagem)} da cena atual?`,
        confirmLabel: 'Remover',
        cancelLabel: 'Manter',
        variant: 'warning',
        onConfirm: () => handleRemoverPersonagemDaCena(card),
      });
    },
    [confirm, handleRemoverPersonagemDaCena],
  );

  const abrirEdicaoIniciativa = useCallback(
    (participante: ParticipanteIniciativaSessaoCampanha) => {
      setModalIniciativaAberto(participante);
      setValorIniciativaEdicao(String(participante.valorIniciativa ?? ''));
    },
    [],
  );

  const handleSalvarValorIniciativa = useCallback(async () => {
    if (!modalIniciativaAberto) return;
    const valorTexto = valorIniciativaEdicao.trim();
    if (!valorTexto) {
      setErroIniciativa('Informe um valor inteiro de iniciativa.');
      return;
    }
    const valor = parseInteiroComSinal(valorTexto);
    if (valor === null) {
      setErroIniciativa('Informe um valor inteiro valido para iniciativa.');
      return;
    }

    const idParticipante =
      modalIniciativaAberto.tipoParticipante === 'NPC'
        ? modalIniciativaAberto.npcSessaoId
        : modalIniciativaAberto.personagemSessaoId;

    if (!idParticipante) {
      setErroIniciativa('Participante invalido.');
      return;
    }

    setSalvandoIniciativa(true);
    setErroIniciativa(null);
    try {
      const atualizado = await apiAtualizarValorIniciativaSessaoCampanha(
        campanhaId,
        sessaoId,
        {
          tipoParticipante: modalIniciativaAberto.tipoParticipante,
          id: idParticipante,
          valorIniciativa: valor,
        },
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
      setModalIniciativaAberto(null);
    } catch (error) {
      setErroIniciativa(extrairMensagemErro(error));
    } finally {
      setSalvandoIniciativa(false);
    }
  }, [
    campanhaId,
    modalIniciativaAberto,
    sessaoId,
    setDetalhe,
    setErroIniciativa,
    sincronizarEstadosDerivados,
    valorIniciativaEdicao,
  ]);

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

  useEffect(() => {
    if (!podeControlarSessao && abaPainelDireitoAtiva === 'eventos') {
      setAbaPainelDireitoAtiva('chat');
    }
  }, [abaPainelDireitoAtiva, podeControlarSessao, setAbaPainelDireitoAtiva]);

  useEffect(() => {
    if (!idsValidos || !sessaoEncerrada) {
      setRelatorioSessao(null);
      setErroRelatorio(null);
      setLoadingRelatorio(false);
      if (abaPainelDireitoAtiva === 'relatorio') {
        setAbaPainelDireitoAtiva('chat');
      }
      return;
    }

    let cancelado = false;
    setLoadingRelatorio(true);
    setErroRelatorio(null);

    void apiGetRelatorioSessaoCampanha(campanhaId, sessaoId)
      .then((relatorio) => {
        if (cancelado) return;
        setRelatorioSessao(relatorio);
      })
      .catch((error) => {
        if (cancelado) return;
        setErroRelatorio(extrairMensagemErro(error));
      })
      .finally(() => {
        if (!cancelado) {
          setLoadingRelatorio(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [
    abaPainelDireitoAtiva,
    campanhaId,
    idsValidos,
    sessaoEncerrada,
    sessaoId,
    setAbaPainelDireitoAtiva,
  ]);

  const { socketConectado, realtimeStatus, onlineUsuarioIds } = useSessaoRealtime({
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

  const handleCenaTipoChange = useCallback(
    (tipo: TipoCenaSessaoCampanha) => {
      setCenaTipo(tipo);
      if (tipo === 'BASE') {
        setLimitesCategoriaAtivo(true);
      }
    },
    [setCenaTipo, setLimitesCategoriaAtivo],
  );

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
    sucessoReordenacao,
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

  const resetarFormularioNpcSimples = useCallback(() => {
    setNpcSimplesNome('');
    setNpcSimplesDefesa('');
    setNpcSimplesPvMax('');
    setNpcSimplesIniciativaValor('');
    setNpcSimplesSanAtual('');
    setNpcSimplesSanMax('');
    setNpcSimplesEaAtual('');
    setNpcSimplesEaMax('');
    setNpcSimplesFichaTipo('NPC');
    setNpcSimplesTipo('OUTRO');
    setNpcSimplesTamanho('MEDIO');
    setNpcSimplesAtributos({
      agilidade: '',
      forca: '',
      intelecto: '',
      presenca: '',
      vigor: '',
    });
    setNpcSimplesPericias({
      percepcao: '',
      iniciativa: '',
      fortitude: '',
      reflexos: '',
      vontade: '',
      luta: '',
      jujutsu: '',
    });
  }, []);

  const {
    adicionandoNpc,
    salvandoNpcId,
    campoRecursoPendente: campoRecursoNpcPendente,
    removendoNpcId,
    handleAdicionarNpcSimplesNaCena,
    handleAdicionarNpcNaCena,
    handleSalvarNpc,
    handleAplicarDeltaRecursoNpc,
    handleAplicarAjustePersonalizadoRecursoNpc,
    handleRemoverNpc,
  } = useSessaoNpc({
    campanhaId,
    sessaoId,
    sessaoEncerrada,
    edicaoNpcs,
    obterAjustesRecursosNpc,
    setDetalhe: (atualizado) => setDetalhe(atualizado),
    sincronizarEstadosDerivados,
    setErro: setErroNpcs,
    showToast,
    onNpcAdicionado: () => {
      setNomeNpcCustomizado('');
      setNpcSanAtual('');
      setNpcSanMax('');
      setNpcEaAtual('');
      setNpcEaMax('');
      setNpcIniciativaValor('');
      setModalAdicionarNpcAberto(false);
      setModalAdicionarNpcSimplesAberto(false);
      resetarFormularioNpcSimples();
    },
    onRemocaoConfirmada: () => setNpcRemocaoConfirmacao(null),
    textoSeguro,
  });

  const handleConfirmarAdicionarNpc = useCallback(() => {
    const npcId = Number(npcSelecionadoId);
    if (!Number.isInteger(npcId) || npcId <= 0) {
      setErroNpcs('Selecione um NPC valido.');
      return;
    }
    const iniciativaTexto = npcIniciativaValor.trim();
    if (!iniciativaTexto) {
      setErroNpcs('Informe a iniciativa do NPC.');
      return;
    }
    const iniciativaValor = parseInteiroComSinal(iniciativaTexto);
    if (iniciativaValor === null) {
      setErroNpcs('Informe um valor inteiro valido para iniciativa.');
      return;
    }

    void handleAdicionarNpcNaCena(npcId, nomeNpcCustomizado, {
      sanAtual: npcSanAtual,
      sanMax: npcSanMax,
      eaAtual: npcEaAtual,
      eaMax: npcEaMax,
      iniciativaValor,
    });
  }, [
    handleAdicionarNpcNaCena,
    npcEaAtual,
    npcEaMax,
    npcIniciativaValor,
    npcSanAtual,
    npcSanMax,
    npcSelecionadoId,
    nomeNpcCustomizado,
    setErroNpcs,
  ]);

  const handleConfirmarAdicionarNpcSimples = useCallback(() => {
    const defesa = parseInteiroComSinal(npcSimplesDefesa.trim());
    if (!npcSimplesNome.trim()) {
      setErroNpcs('Informe o nome do NPC simples.');
      return;
    }
    if (defesa === null) {
      setErroNpcs('Informe uma defesa valida para o NPC simples.');
      return;
    }
    const pontosVidaMax = parseInteiroComSinal(npcSimplesPvMax.trim());
    if (pontosVidaMax === null || pontosVidaMax <= 0) {
      setErroNpcs('Informe um PV maximo valido para o NPC simples.');
      return;
    }

    const iniciativaValorTexto = npcSimplesIniciativaValor.trim();
    const iniciativaValor = iniciativaValorTexto
      ? parseInteiroComSinal(iniciativaValorTexto)
      : null;
    if (iniciativaValorTexto && iniciativaValor === null) {
      setErroNpcs('Informe um valor inteiro valido para iniciativa.');
      return;
    }

    void handleAdicionarNpcSimplesNaCena({
      nome: npcSimplesNome,
      defesa,
      pontosVidaMax,
      fichaTipo: npcSimplesFichaTipo,
      tipo: npcSimplesTipo,
      tamanho: npcSimplesTamanho,
      iniciativaValor,
      sanAtual: npcSimplesSanAtual,
      sanMax: npcSimplesSanMax,
      eaAtual: npcSimplesEaAtual,
      eaMax: npcSimplesEaMax,
      ...npcSimplesAtributos,
      ...npcSimplesPericias,
    });
  }, [
    handleAdicionarNpcSimplesNaCena,
    npcSimplesAtributos,
    npcSimplesDefesa,
    npcSimplesEaAtual,
    npcSimplesEaMax,
    npcSimplesFichaTipo,
    npcSimplesIniciativaValor,
    npcSimplesNome,
    npcSimplesPericias,
    npcSimplesPvMax,
    npcSimplesSanAtual,
    npcSimplesSanMax,
    npcSimplesTamanho,
    npcSimplesTipo,
    setErroNpcs,
  ]);

  const { enviandoMensagem, handleEnviarMensagem } = useSessaoChat({
    campanhaId,
    sessaoId,
    mensagem,
    setMensagem,
    setChat: (atualizar) => setChat(atualizar),
    setErro: setErroChat,
  });

  const handleToggleAnimacaoRolagemChat = useCallback((ativo: boolean) => {
    setAnimacaoRolagemChatAtiva(ativo);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_ANIMACAO_ROLAGEM_CHAT_KEY,
      ativo ? 'on' : 'off',
    );
  }, []);

  const abrirModalRolagemChat = useCallback(
    (payloads: DiceRollPayload[], expressions: string[]) => {
      const primeiroPayload = payloads[0] ?? null;
      setPericiaRollModal({
        aberto: true,
        titulo: primeiroPayload?.label ?? 'Rolagem livre',
        subtitulo: 'Chat de rolagens',
        alvoTipo: undefined,
        alvoNome: undefined,
        habilidadeContext: null,
        payload: primeiroPayload,
        payloads,
        expression: expressions[0],
        expressions,
        enviando: false,
        enviado: false,
        erro: null,
      });
    },
    [],
  );

  const atualizarModalRolagemChat = useCallback(
    (patch: { enviando?: boolean; enviado?: boolean; erro?: string | null }) => {
      setPericiaRollModal((estado) =>
        estado.aberto ? { ...estado, ...patch } : estado,
      );
    },
    [],
  );

  const { enviandoRolagem, handleEnviarRolagem } = useSessaoRolagem({
    campanhaId,
    sessaoId,
    mensagem: mensagemRolagem,
    setMensagem: setMensagemRolagem,
    setChat: (atualizar) => setChat(atualizar),
    setErro: setErroRolagens,
    animacaoModalAtiva: animacaoRolagemChatAtiva,
    onAbrirModalAnimado: abrirModalRolagemChat,
    onAtualizarModalAnimado: atualizarModalRolagemChat,
  });

  const handleRolarPericia = useCallback(
    async (payload: RolagemPericiaSessaoPayload) => {
      if (sessaoEncerrada) {
        showToast('Sessao encerrada. Rolagens bloqueadas.', 'warning');
        return;
      }
      const labelBase = `${payload.alvoNome} · ${payload.periciaNome}`.trim();
      const label = labelBase.length > 24 ? labelBase.slice(0, 24) : labelBase;
      const dicePayload = rolarDados({
        quantidade: payload.dados,
        faces: 20,
        modificador: payload.bonus,
        aplicarModificadorPorDado: false,
        label,
        keepMode: payload.keepMode,
      });
      const { mensagem: mensagemEnvio, expression } = construirMensagemDice(dicePayload);
      setPericiaRollModal({
        aberto: true,
        titulo: payload.periciaNome,
        subtitulo: payload.atributoBase
          ? `${payload.alvoNome} · ${payload.atributoBase}`
          : payload.alvoNome,
        alvoTipo: payload.alvoTipo,
        alvoNome: payload.alvoNome,
        habilidadeContext: null,
        payload: dicePayload,
        expression,
        enviando: false,
        enviado: false,
        erro: null,
      });
      const erroTamanho = validarComprimentoMensagemDice(mensagemEnvio);
      if (erroTamanho) {
        setErroRolagens(erroTamanho);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: erroTamanho,
        }));
        return;
      }
      try {
        setPericiaRollModal((estado) => ({ ...estado, enviando: true }));
        const enviada = await apiEnviarMensagemChatSessaoCampanha(campanhaId, sessaoId, {
          mensagem: mensagemEnvio,
        });
        setChat((anterior) => [...anterior, enviada]);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: true,
        }));
      } catch (error) {
        const mensagemErro = extrairMensagemErro(error);
        setErroRolagens(mensagemErro);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: mensagemErro,
        }));
      }
    },
    [campanhaId, sessaoEncerrada, sessaoId, setErroRolagens, showToast],
  );

  const handleRolarExpressao = useCallback(
    async (payload: RolagemExpressaoSessaoPayload) => {
      if (sessaoEncerrada) {
        showToast('Sessao encerrada. Rolagens bloqueadas.', 'warning');
        return;
      }
      const resultado = parseDiceExpression(payload.expressao);
      if (resultado.erro || !resultado.expression) {
        showToast(
          resultado.erro ?? 'Expressao de rolagem invalida.',
          'warning',
        );
        return;
      }
      const labelBase = `${payload.alvoNome} · ${payload.titulo}`.trim();
      const label = labelBase.length > 24 ? labelBase.slice(0, 24) : labelBase;
      const dicePayload = rolarDados({
        ...resultado.expression,
        label,
      });
      const { mensagem: mensagemEnvio, expression } = construirMensagemDice(dicePayload);
      setPericiaRollModal({
        aberto: true,
        titulo: payload.titulo,
        subtitulo: payload.subtitulo ?? payload.alvoNome,
        alvoTipo: payload.alvoTipo,
        alvoNome: payload.alvoNome,
        habilidadeContext: null,
        payload: dicePayload,
        expression,
        enviando: false,
        enviado: false,
        erro: null,
      });
      const erroTamanho = validarComprimentoMensagemDice(mensagemEnvio);
      if (erroTamanho) {
        setErroRolagens(erroTamanho);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: erroTamanho,
        }));
        return;
      }
      try {
        setPericiaRollModal((estado) => ({ ...estado, enviando: true }));
        const enviada = await apiEnviarMensagemChatSessaoCampanha(campanhaId, sessaoId, {
          mensagem: mensagemEnvio,
        });
        setChat((anterior) => [...anterior, enviada]);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: true,
        }));
      } catch (error) {
        const mensagemErro = extrairMensagemErro(error);
        setErroRolagens(mensagemErro);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: mensagemErro,
        }));
      }
    },
    [campanhaId, sessaoEncerrada, sessaoId, setErroRolagens, showToast],
  );

  const handleRolarTesteHabilidade = useCallback(
    async (payload: RolagemTesteHabilidadeSessaoPayload) => {
      if (sessaoEncerrada) {
        showToast('Sessao encerrada. Rolagens bloqueadas.', 'warning');
        return;
      }
      const labelBase = `${payload.alvoNome} · ${payload.periciaNome}`.trim();
      const label = labelBase.length > 24 ? labelBase.slice(0, 24) : labelBase;
      const dicePayload = rolarDados({
        quantidade: payload.dados,
        faces: 20,
        modificador: payload.bonus,
        aplicarModificadorPorDado: false,
        label,
        keepMode: payload.keepMode,
      });
      const habilidadeLabel = payload.habilidade.variacaoNome
        ? `${payload.habilidade.habilidadeNome} · ${payload.habilidade.variacaoNome}`
        : payload.habilidade.habilidadeNome;
      const subtitulo = payload.atributoBase
        ? `${payload.alvoNome} · ${habilidadeLabel} · ${payload.atributoBase}`
        : `${payload.alvoNome} · ${habilidadeLabel}`;
      const { mensagem: mensagemEnvio, expression } = construirMensagemDice(dicePayload);
      setPericiaRollModal({
        aberto: true,
        titulo: payload.periciaNome,
        subtitulo,
        alvoTipo: payload.alvoTipo,
        alvoNome: payload.alvoNome,
        habilidadeContext: payload.habilidade,
        payload: dicePayload,
        expression,
        enviando: false,
        enviado: false,
        erro: null,
      });
      const erroTamanho = validarComprimentoMensagemDice(mensagemEnvio);
      if (erroTamanho) {
        setErroRolagens(erroTamanho);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: erroTamanho,
        }));
        return;
      }
      try {
        setPericiaRollModal((estado) => ({ ...estado, enviando: true }));
        const enviada = await apiEnviarMensagemChatSessaoCampanha(campanhaId, sessaoId, {
          mensagem: mensagemEnvio,
        });
        setChat((anterior) => [...anterior, enviada]);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: true,
        }));
      } catch (error) {
        const mensagemErro = extrairMensagemErro(error);
        setErroRolagens(mensagemErro);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: mensagemErro,
        }));
      }
    },
    [campanhaId, sessaoEncerrada, sessaoId, setErroRolagens, showToast],
  );

  const handleRolarDanoHabilidade = useCallback(
    async (payload: RolagemDanoHabilidadeSessaoPayload) => {
      if (sessaoEncerrada) {
        showToast('Sessao encerrada. Rolagens bloqueadas.', 'warning');
        return;
      }

      const dano = payload.habilidade.dano;
      if (!dano) {
        showToast('Habilidade sem dano configurado.', 'warning');
        return;
      }

      const acumulos = Math.max(1, Math.trunc(dano.acumulos ?? 1));
      const aplicarCritico = Boolean(payload.aplicarCritico);
      const criticoMultiplicador = Number.isFinite(payload.habilidade.criticoMultiplicador)
        ? Math.max(2, Math.trunc(payload.habilidade.criticoMultiplicador as number))
        : 2;

      const parseFaces = (dado: string): number | null => {
        const match = dado.match(/(\d+)/);
        if (!match?.[1]) return null;
        const faces = Number(match[1]);
        if (!Number.isFinite(faces) || faces <= 0) return null;
        return Math.trunc(faces);
      };

      const mapaDados = new Map<
        string,
        { quantidade: number; faces: number; tipo: string }
      >();
      const adicionarDado = (quantidade: number, dado: string, tipo: string) => {
        if (!Number.isFinite(quantidade) || quantidade <= 0) return;
        const faces = parseFaces(dado);
        if (!faces) return;
        const key = `${tipo ?? ''}::${faces}`;
        const atual = mapaDados.get(key);
        if (atual) {
          atual.quantidade += quantidade;
        } else {
          mapaDados.set(key, { quantidade, faces, tipo });
        }
      };

      const dadosBase = Array.isArray(dano.dadosDano) ? dano.dadosDano : [];
      for (const entrada of dadosBase) {
        const quantidade = Number(entrada?.quantidade ?? 0);
        const dado = String(entrada?.dado ?? '');
        const tipo = String(entrada?.tipo ?? '');
        adicionarDado(quantidade, dado, tipo);
      }

      if (dano.escalonamentoDano && acumulos > 1) {
        const quantidade = Number(dano.escalonamentoDano.quantidade ?? 0);
        const dado = String(dano.escalonamentoDano.dado ?? '');
        const tipo = String(dano.escalonamentoDano.tipo ?? '');
        const total = quantidade * (acumulos - 1);
        adicionarDado(total, dado, tipo);
      }

      const listaDados = Array.from(mapaDados.values()).map((item) => ({
        ...item,
        quantidade:
          aplicarCritico && criticoMultiplicador > 1
            ? item.quantidade * criticoMultiplicador
            : item.quantidade,
      }));

      const payloads: DiceRollPayload[] = [];
      for (const item of listaDados) {
        const tipoBase =
          item.tipo?.trim() || String(dano.danoFlatTipo ?? '').trim() || 'Dano';
        const labelBase = aplicarCritico
          ? `${tipoBase} (Critico x${criticoMultiplicador})`
          : tipoBase;
        const label = labelBase.length > 24 ? labelBase.slice(0, 24) : labelBase;
        payloads.push(
          rolarDados({
            quantidade: item.quantidade,
            faces: item.faces,
            modificador: 0,
            aplicarModificadorPorDado: false,
            label,
          }),
        );
      }

      const danoFlat =
        Number.isFinite(dano.danoFlat) && dano.danoFlat !== null
          ? Math.trunc(dano.danoFlat as number)
          : 0;
      if (danoFlat !== 0) {
        if (payloads.length > 0) {
          const primeiro = payloads[0];
          payloads[0] = {
            ...primeiro,
            modificador: (primeiro.modificador ?? 0) + danoFlat,
          };
        } else {
          const tipoBase = String(dano.danoFlatTipo ?? '').trim() || 'Dano';
          const labelBase = aplicarCritico
            ? `${tipoBase} (Critico x${criticoMultiplicador})`
            : tipoBase;
          const label = labelBase.length > 24 ? labelBase.slice(0, 24) : labelBase;
          payloads.push(
            rolarDados({
              quantidade: 1,
              faces: 1,
              modificador: danoFlat - 1,
              aplicarModificadorPorDado: false,
              label,
            }),
          );
        }
      }

      if (payloads.length === 0) {
        showToast('Nao foi possivel montar a rolagem de dano.', 'warning');
        return;
      }

      const { mensagem: mensagemEnvio } = construirMensagemDiceMultipla(payloads);
      const habilidadeLabel = payload.habilidade.variacaoNome
        ? `${payload.habilidade.habilidadeNome} · ${payload.habilidade.variacaoNome}`
        : payload.habilidade.habilidadeNome;
      const expressions = payloads.map((item) =>
        item.label ? `${item.label}: ${formatarExpressaoDice(item)}` : formatarExpressaoDice(item),
      );
      setPericiaRollModal({
        aberto: true,
        titulo: 'Dano/efeito',
        subtitulo: `${payload.alvoNome} · ${habilidadeLabel}`,
        alvoTipo: payload.alvoTipo,
        alvoNome: payload.alvoNome,
        habilidadeContext: null,
        payload: payloads[0] ?? null,
        payloads,
        expression: expressions[0],
        expressions,
        enviando: false,
        enviado: false,
        erro: null,
      });
      const erroTamanho = validarComprimentoMensagemDice(mensagemEnvio);
      if (erroTamanho) {
        setErroRolagens(erroTamanho);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: erroTamanho,
        }));
        return;
      }

      try {
        setPericiaRollModal((estado) => ({ ...estado, enviando: true }));
        const enviada = await apiEnviarMensagemChatSessaoCampanha(campanhaId, sessaoId, {
          mensagem: mensagemEnvio,
        });
        setChat((anterior) => [...anterior, enviada]);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: true,
        }));
      } catch (error) {
        const mensagemErro = extrairMensagemErro(error);
        setErroRolagens(mensagemErro);
        setPericiaRollModal((estado) => ({
          ...estado,
          enviando: false,
          enviado: false,
          erro: mensagemErro,
        }));
      }
    },
    [campanhaId, sessaoEncerrada, sessaoId, setErroRolagens, showToast],
  );

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

  const handlePersonagemAtualizadoNoModal = useCallback(
    (personagem: PersonagemCampanhaResumo) => {
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
                pvBarrasTotal: personagem.recursos.pvBarrasTotal,
                pvBarrasRestantes: personagem.recursos.pvBarrasRestantes,
                pvBarraMaxAtual: personagem.recursos.pvBarraMaxAtual,
                nucleoAtivo: personagem.recursos.nucleoAtivo,
                nucleosDisponiveis: personagem.recursos.nucleosDisponiveis,
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
    },
    [setAjustesRecursosPorCard, setDetalhe, sincronizarTempoReal],
  );

  const handleSelecionarNucleo = useCallback(
    async (personagemCampanhaId: number, nucleo: NucleoAmaldicoadoCodigo) => {
      if (sessaoEncerrada) return;
      setErroCards(null);
      try {
        const atualizado = await apiAtualizarNucleoPersonagemCampanha(
          campanhaId,
          personagemCampanhaId,
          { nucleo },
        );
        handlePersonagemAtualizadoNoModal(atualizado);
      } catch (error) {
        setErroCards(
          extrairMensagemErro(error) || 'Nao foi possivel atualizar o nucleo.',
        );
      }
    },
    [
      campanhaId,
      sessaoEncerrada,
      handlePersonagemAtualizadoNoModal,
      setErroCards,
    ],
  );

  const handleSacrificarNucleo = useCallback(
    async (
      personagemCampanhaId: number,
      payload: { modo: 'ATUAL' | 'OUTRO'; nucleo?: NucleoAmaldicoadoCodigo },
    ) => {
      if (sessaoEncerrada) return;
      setErroCards(null);
      try {
        const atualizado = await apiSacrificarNucleoPersonagemCampanha(
          campanhaId,
          personagemCampanhaId,
          payload,
        );
        handlePersonagemAtualizadoNoModal(atualizado);
      } catch (error) {
        setErroCards(
          extrairMensagemErro(error) || 'Nao foi possivel sacrificar o nucleo.',
        );
      }
    },
    [
      campanhaId,
      sessaoEncerrada,
      handlePersonagemAtualizadoNoModal,
      setErroCards,
    ],
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
  const cards = useMemo(() => detalhe?.cards ?? [], [detalhe?.cards]);
  const npcs = useMemo(() => detalhe?.npcs ?? [], [detalhe?.npcs]);
  const rolagens = useMemo(
    () => chat.filter((mensagemChat) => ehMensagemDice(mensagemChat.mensagem)),
    [chat],
  );
  const chatSemRolagens = useMemo(
    () => chat.filter((mensagemChat) => !ehMensagemDice(mensagemChat.mensagem)),
    [chat],
  );
  const handleMensagemRolagemChange = useCallback(
    (valor: string) => {
      setMensagemRolagem(valor);
      if (erroRolagens) setErroRolagens(null);
    },
    [erroRolagens],
  );
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
  const iniciativaPorNpcSessao = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const participante of iniciativaOrdem) {
      if (participante.tipoParticipante !== 'NPC') continue;
      if (typeof participante.npcSessaoId !== 'number') continue;
      mapa.set(participante.npcSessaoId, participante.valorIniciativa);
    }
    return mapa;
  }, [iniciativaOrdem]);
  const meuCard = useMemo(
    () => cards.find((card) => card.donoId === usuario?.id) ?? null,
    [cards, usuario?.id],
  );
  const iniciativaMeuCard = meuCard
    ? iniciativaPorPersonagemSessao.get(meuCard.personagemSessaoId) ?? null
    : null;
  const ajustesMeuCard = meuCard
    ? obterAjustesRecursosCard(meuCard.personagemCampanhaId)
    : AJUSTE_RECURSO_PADRAO;
  const campoRecursoPendenteMeuCard =
    meuCard && campoRecursoPendente?.startsWith(`${meuCard.personagemCampanhaId}:`)
      ? (campoRecursoPendente.split(':')[1] as CampoAjusteRecurso)
      : null;
  const cardRecursosExpandidoMeuCard = meuCard
    ? Boolean(cardsRecursosExpandidos[meuCard.personagemSessaoId])
    : false;
  const abaDetalheMeuCard = meuCard
    ? abasDetalheCard[meuCard.personagemSessaoId] ?? 'RESUMO'
    : 'RESUMO';
  const totalTecnicasMeuCard = meuCard
    ? (meuCard.tecnicaInata ? 1 : 0) + meuCard.tecnicasNaoInatas.length
    : 0;
  const totalCondicoesMeuCard = meuCard ? meuCard.condicoesAtivas.length : 0;
  const totalSustentacoesMeuCard = meuCard ? meuCard.sustentacoesAtivas.length : 0;
  const mostrarSomenteSustentadasMeuCard = meuCard
    ? Boolean(mostrarSomenteSustentadas[meuCard.personagemSessaoId])
    : false;
  const tecnicaInataAbertaMeuCard = meuCard
    ? tecnicasInatasAbertas[meuCard.personagemSessaoId] ?? true
    : true;
  const tecnicasNaoInatasAbertasMeuCard = meuCard
    ? Boolean(tecnicasNaoInatasAbertas[meuCard.personagemSessaoId])
    : false;
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
      if (
        modalAdicionarNpcAberto ||
        modalAdicionarNpcSimplesAberto ||
        modalAdicionarPersonagemAberto ||
        modalIniciativaAberto ||
        modalCondicoesAberto ||
        eventoDetalheModal
      ) {
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
    modalAdicionarNpcSimplesAberto,
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
    [setAbasDetalheCard],
  );

  const atualizarTecnicasInatasAbertas = useCallback(
    (personagemSessaoId: number, aberto: boolean) => {
      setTecnicasInatasAbertas((estadoAtual) => ({
        ...estadoAtual,
        [personagemSessaoId]: aberto,
      }));
    },
    [setTecnicasInatasAbertas],
  );

  const atualizarTecnicasNaoInatasAbertas = useCallback(
    (personagemSessaoId: number, aberto: boolean) => {
      setTecnicasNaoInatasAbertas((estadoAtual) => ({
        ...estadoAtual,
        [personagemSessaoId]: aberto,
      }));
    },
    [setTecnicasNaoInatasAbertas],
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
    [setMostrarSomenteSustentadas],
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
      campanhaId={campanhaId}
      cards={cards}
      iniciativaPorPersonagemSessao={iniciativaPorPersonagemSessao}
      cardsRecursosExpandidos={cardsRecursosExpandidos}
      onAlternarExpandido={alternarCardExpandido}
      obterAjustesRecursosCard={obterAjustesRecursosCard}
      onAtualizarAjusteRecursoCard={atualizarAjusteRecursoCard}
      campoRecursoPendente={campoRecursoPendente}
      salvandoCardId={salvandoCardId}
      sessaoEncerrada={sessaoEncerrada}
      podeControlarSessao={podeControlarSessao}
      removendoPersonagemSessaoId={removendoPersonagemSessaoId}
      onSolicitarRemoverPersonagem={solicitarRemoverPersonagem}
      onAbrirAdicionarPersonagem={() => setModalAdicionarPersonagemAberto(true)}
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
      onSelecionarNucleo={handleSelecionarNucleo}
      onSacrificarNucleo={handleSacrificarNucleo}
      onAbrirEdicaoPersonagem={handleAbrirEdicaoPersonagem}
      onAbrirFichaCompleta={handleAbrirFichaCompleta}
      onRolarPericia={handleRolarPericia}
      onRolarTesteHabilidade={handleRolarTesteHabilidade}
      onRolarDanoHabilidade={handleRolarDanoHabilidade}
      renderPainelCondicoes={renderPainelCondicoes}
      limitesCategoriaAtivo={limitesCategoriaAtivo}
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
    <main ref={shellRef} className="session-page-shell min-h-screen p-4 md:p-6">
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
          ref={operationalBarRef}
          cenaLabel={labelCena(detalhe.cenaAtual.tipo)}
          cenaNome={detalhe.cenaAtual.nome}
          rodadaAtual={detalhe.rodadaAtual}
          turnoAtualLabel={turnoAtualLabel}
          proximoTurnoLabel={proximoTurnoLabel}
          sessaoEncerrada={sessaoEncerrada}
          realtimeAtivo={socketConectado}
          realtimeStatus={realtimeStatus}
          controleTurnosAtivo={detalhe.controleTurnosAtivo}
          combateAtivo={detalhe.cenaAtual.tipo === 'COMBATE'}
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
                <>
                  <SessionPanel
                    title="Escudo do Mestre"
                    subtitle="Guias rapidos com regras operacionais da mesa."
                    tone="control"
                    right={
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center rounded-full border border-app-border bg-app-surface p-2">
                          <Icon name="shield" className="h-4 w-4 text-app-fg" />
                        </span>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setEscudoAberto((aberto) => !aberto)}
                          title={escudoAberto ? 'Recolher escudo' : 'Expandir escudo'}
                        >
                          <Icon
                            name={escudoAberto ? 'chevron-up' : 'chevron-down'}
                            className="h-3.5 w-3.5"
                          />
                        </Button>
                      </div>
                    }
                  >
                    {escudoAberto ? <MestreShieldGuide /> : null}
                  </SessionPanel>

                  <SessionNpcsPanel
                    npcs={npcs}
                    podeControlarSessao={podeControlarSessao}
                    sessaoEncerrada={sessaoEncerrada}
                    npcsDisponiveis={npcsDisponiveis}
                    iniciativaPorNpcSessao={iniciativaPorNpcSessao}
                    edicaoNpcs={edicaoNpcs}
                    ajustesRecursosNpc={ajustesRecursosNpc}
                    salvandoNpcId={salvandoNpcId}
                    campoRecursoPendente={campoRecursoNpcPendente}
                    removendoNpcId={removendoNpcId}
                    erro={erroNpcs}
                    onAbrirAdicionar={() => setModalAdicionarNpcAberto(true)}
                    onAbrirAdicionarNpcSimples={() =>
                      setModalAdicionarNpcSimplesAberto(true)
                    }
                    onAtualizarCampo={atualizarCampoEdicaoNpc}
                    onAtualizarAjustePersonalizado={(npc, campo, valor) =>
                      atualizarAjusteRecursoNpc(npc.npcSessaoId, campo, valor)
                    }
                    onAplicarDeltaRecurso={(npc, campo, delta) =>
                      void handleAplicarDeltaRecursoNpc(npc, campo, delta)
                    }
                    onAplicarAjustePersonalizado={(npc, campo) =>
                      void handleAplicarAjustePersonalizadoRecursoNpc(npc, campo)
                    }
                    onSalvarNpc={(npc) => void handleSalvarNpc(npc)}
                    onSolicitarRemoverNpc={(npc) => setNpcRemocaoConfirmacao(npc)}
                    onRolarPericia={handleRolarPericia}
                    onRolarExpressao={handleRolarExpressao}
                    renderPainelCondicoes={renderPainelCondicoes}
                  />
                </>
              ) : (
                <SessionPlayerSummaryPanel
                  campanhaId={campanhaId}
                  card={meuCard}
                  iniciativaValor={iniciativaMeuCard}
                  cardRecursosExpandido={cardRecursosExpandidoMeuCard}
                  abaDetalheCard={abaDetalheMeuCard}
                  totalCondicoesAtivasCard={totalCondicoesMeuCard}
                  totalTecnicasCard={totalTecnicasMeuCard}
                  totalSustentacoesAtivasCard={totalSustentacoesMeuCard}
                  mostrarSomenteSustentadasAtivas={mostrarSomenteSustentadasMeuCard}
                  tecnicaInataAberta={tecnicaInataAbertaMeuCard}
                  tecnicasNaoInatasAbertas={tecnicasNaoInatasAbertasMeuCard}
                  sessaoEncerrada={sessaoEncerrada}
                  ajustesRecursos={ajustesMeuCard}
                  campoRecursoPendente={campoRecursoPendenteMeuCard}
                  salvandoCardId={salvandoCardId}
                  podeAdicionar={!sessaoEncerrada}
                  onAbrirAdicionar={() => setModalAdicionarPersonagemAberto(true)}
                  onAlternarExpandido={() => {
                    if (!meuCard) return;
                    alternarCardExpandido(meuCard.personagemSessaoId);
                  }}
                  onAtualizarAbaDetalheCard={(aba) => {
                    if (!meuCard) return;
                    atualizarAbaDetalheCard(meuCard.personagemSessaoId, aba);
                  }}
                  onToggleMostrarSomenteSustentadas={(checked) => {
                    if (!meuCard) return;
                    atualizarFiltroSustentadas(meuCard.personagemSessaoId, checked);
                  }}
                  onToggleTecnicaInata={(aberto) => {
                    if (!meuCard) return;
                    atualizarTecnicasInatasAbertas(meuCard.personagemSessaoId, aberto);
                  }}
                  onToggleTecnicasNaoInatas={(aberto) => {
                    if (!meuCard) return;
                    atualizarTecnicasNaoInatasAbertas(
                      meuCard.personagemSessaoId,
                      aberto,
                    );
                  }}
                  acaoHabilidadePendente={acaoHabilidadePendente}
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
                  formatarCustos={formatarCustos}
                  limitesCategoriaAtivo={limitesCategoriaAtivo}
                  renderPainelCondicoes={renderPainelCondicoes}
                  onAbrirFichaCompleta={() => {
                    if (!meuCard) return;
                    handleAbrirFichaCompleta(meuCard);
                  }}
                  onSolicitarRemover={() => {
                    if (!meuCard) return;
                    solicitarRemoverPersonagem(meuCard);
                  }}
                  onAtualizarAjusteRecurso={(campo, valor) => {
                    if (!meuCard) return;
                    atualizarAjusteRecursoCard(
                      meuCard.personagemCampanhaId,
                      campo,
                      valor,
                    );
                  }}
                  onAplicarDeltaRecurso={(campo, delta) => {
                    if (!meuCard) return;
                    void handleAplicarDeltaRecursoCard(meuCard, campo, delta);
                  }}
                  onAplicarAjustePersonalizado={(campo) => {
                    if (!meuCard) return;
                    void handleAplicarAjustePersonalizadoRecursoCard(meuCard, campo);
                  }}
                  onSelecionarNucleo={handleSelecionarNucleo}
                    onSacrificarNucleo={handleSacrificarNucleo}
                    onRolarPericia={handleRolarPericia}
                    onRolarTesteHabilidade={handleRolarTesteHabilidade}
                    onRolarDanoHabilidade={handleRolarDanoHabilidade}
                  />
              )}
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
              acaoTurnoPendente={acaoTurnoPendente}
              reordenandoIniciativa={reordenandoIniciativa}
              sucessoReordenacao={sucessoReordenacao}
              indiceIniciativaArrastado={indiceIniciativaArrastado}
              indiceIniciativaHover={indiceIniciativaHover}
              erro={erroIniciativa}
              onAvancarTurno={() => void handleControleTurno('AVANCAR')}
              onVoltarTurno={() => void handleControleTurno('VOLTAR')}
              onSetIndiceIniciativaArrastado={setIndiceIniciativaArrastado}
              onSetIndiceIniciativaHover={setIndiceIniciativaHover}
              onDropIniciativa={(indiceDestino) =>
                void handleDropIniciativa(indiceDestino)
              }
              onMoverIniciativa={(indice, direcao) =>
                void handleMoverIniciativa(indice, direcao)
              }
              onEditarIniciativa={abrirEdicaoIniciativa}
              labelParticipanteIniciativa={labelParticipanteIniciativa}
            />

            {podeControlarSessao ? (
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
                limitesCategoriaAtivo={limitesCategoriaAtivo}
                onCenaTipoChange={handleCenaTipoChange}
                onCenaNomeChange={setCenaNome}
                onAtualizarCena={() =>
                  void handleAtualizarCena(
                    cenaTipo,
                    cenaNome,
                    limitesCategoriaAtivo,
                  )
                }
                onControleTurno={(acao) => void handleControleTurno(acao)}
                onSolicitarEncerrarSessao={() =>
                  setConfirmarEncerrarSessaoAberto(true)
                }
                onToggleLimitesCategoria={setLimitesCategoriaAtivo}
              />
            ) : (
              <SessionSceneRosterPanel
                cards={cards}
                npcs={npcs}
                iniciativaOrdem={iniciativaOrdem}
              />
            )}
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
              <SessionSidebarPanel
                activeTab={abaPainelDireitoAtiva}
                onChangeTab={setAbaPainelDireitoAtiva}
                chat={chatSemRolagens}
                rolagens={rolagens}
                eventosSessao={eventosSessao}
                participantes={participantes}
                personagens={detalhe.cards}
                npcs={npcs}
                onlineSet={onlineSet}
                campanhaId={campanhaId}
                sessaoId={sessaoId}
                cenaId={detalhe.cenaAtual.id}
                sessaoEncerrada={sessaoEncerrada}
                relatorioSessao={relatorioSessao}
                loadingRelatorio={loadingRelatorio}
                erroRelatorio={erroRelatorio}
                podeControlarSessao={podeControlarSessao}
                desfazendoEventoId={desfazendoEventoId}
                erroEventos={erroEventos}
                erroChat={erroChat}
                erroRolagens={erroRolagens}
                enviandoMensagem={enviandoMensagem}
                enviandoRolagem={enviandoRolagem}
                mensagem={mensagem}
                mensagemRolagem={mensagemRolagem}
                usuarioId={usuario?.id ?? null}
                animacaoModalAtiva={animacaoRolagemChatAtiva}
                onToggleAnimacaoModal={handleToggleAnimacaoRolagemChat}
                fimChatRef={fimChatRef}
                onMensagemChange={setMensagem}
                onEnviarMensagem={() => void handleEnviarMensagem()}
                onMensagemRolagemChange={handleMensagemRolagemChange}
                onEnviarRolagem={() => void handleEnviarRolagem()}
                onAbrirDetalhes={(evento) => {
                  setEventoDetalheModal(evento);
                  setMotivoDesfazerEventoModal('');
                }}
                onDesfazerEvento={(evento) =>
                  solicitarDesfazerEvento(evento, undefined, 'lista')
                }
                realtimeStatus={realtimeStatus}
              />
            </section>
          ) : null}
        </div>

        <AddNpcModal
          isOpen={modalAdicionarNpcAberto}
          onClose={() => setModalAdicionarNpcAberto(false)}
          onConfirm={handleConfirmarAdicionarNpc}
          adicionando={adicionandoNpc}
          sessaoEncerrada={sessaoEncerrada}
          npcsDisponiveis={npcsDisponiveis}
          npcSelecionadoId={npcSelecionadoId}
          onNpcSelecionadoChange={setNpcSelecionadoId}
          nomeNpcCustomizado={nomeNpcCustomizado}
          onNomeNpcCustomizadoChange={setNomeNpcCustomizado}
          iniciativaValor={npcIniciativaValor}
          onIniciativaValorChange={setNpcIniciativaValor}
          sanAtual={npcSanAtual}
          sanMax={npcSanMax}
          eaAtual={npcEaAtual}
          eaMax={npcEaMax}
          onSanAtualChange={setNpcSanAtual}
          onSanMaxChange={setNpcSanMax}
          onEaAtualChange={setNpcEaAtual}
          onEaMaxChange={setNpcEaMax}
        />

        <AddSimpleNpcModal
          isOpen={modalAdicionarNpcSimplesAberto}
          onClose={() => setModalAdicionarNpcSimplesAberto(false)}
          onConfirm={handleConfirmarAdicionarNpcSimples}
          adicionando={adicionandoNpc}
          sessaoEncerrada={sessaoEncerrada}
          nome={npcSimplesNome}
          onNomeChange={setNpcSimplesNome}
          defesa={npcSimplesDefesa}
          onDefesaChange={setNpcSimplesDefesa}
          pontosVidaMax={npcSimplesPvMax}
          onPontosVidaMaxChange={setNpcSimplesPvMax}
          iniciativaValor={npcSimplesIniciativaValor}
          onIniciativaValorChange={setNpcSimplesIniciativaValor}
          sanAtual={npcSimplesSanAtual}
          sanMax={npcSimplesSanMax}
          eaAtual={npcSimplesEaAtual}
          eaMax={npcSimplesEaMax}
          onSanAtualChange={setNpcSimplesSanAtual}
          onSanMaxChange={setNpcSimplesSanMax}
          onEaAtualChange={setNpcSimplesEaAtual}
          onEaMaxChange={setNpcSimplesEaMax}
          fichaTipo={npcSimplesFichaTipo}
          onFichaTipoChange={setNpcSimplesFichaTipo}
          tipo={npcSimplesTipo}
          onTipoChange={setNpcSimplesTipo}
          tamanho={npcSimplesTamanho}
          onTamanhoChange={setNpcSimplesTamanho}
          atributos={npcSimplesAtributos}
          onAtributoChange={(campo, valor) =>
            setNpcSimplesAtributos((estadoAtual) => ({
              ...estadoAtual,
              [campo]: valor,
            }))
          }
          pericias={npcSimplesPericias}
          onPericiaChange={(campo, valor) =>
            setNpcSimplesPericias((estadoAtual) => ({
              ...estadoAtual,
              [campo]: valor,
            }))
          }
        />

        <AddPersonagemModal
          isOpen={modalAdicionarPersonagemAberto}
          onClose={() => setModalAdicionarPersonagemAberto(false)}
          onConfirm={() => void handleAdicionarPersonagemNaCena()}
          adicionando={adicionandoPersonagem}
          sessaoEncerrada={sessaoEncerrada}
          personagensDisponiveis={personagensDisponiveis}
          personagemSelecionadoId={personagemSelecionadoId}
          onPersonagemSelecionadoChange={setPersonagemSelecionadoId}
          iniciativaValor={personagemIniciativaValor}
          onIniciativaValorChange={setPersonagemIniciativaValor}
          carregando={carregandoPersonagensDisponiveis}
          erro={erroCards}
        />

        <InitiativeValueModal
          isOpen={Boolean(modalIniciativaAberto)}
          onClose={() => setModalIniciativaAberto(null)}
          onConfirm={() => void handleSalvarValorIniciativa()}
          salvando={salvandoIniciativa}
          nomeParticipante={
            modalIniciativaAberto
              ? labelParticipanteIniciativa(modalIniciativaAberto)
              : 'Participante'
          }
          valor={valorIniciativaEdicao}
          onValorChange={setValorIniciativaEdicao}
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

        <SessionPericiaRollModal
          isOpen={periciaRollModal.aberto}
          titulo={periciaRollModal.titulo}
          subtitulo={periciaRollModal.subtitulo}
          alvoNome={periciaRollModal.alvoNome}
          alvoTipo={periciaRollModal.alvoTipo}
          habilidadeContext={periciaRollModal.habilidadeContext}
          payload={periciaRollModal.payload}
          payloads={periciaRollModal.payloads}
          expression={periciaRollModal.expression}
          expressions={periciaRollModal.expressions}
          enviando={periciaRollModal.enviando}
          enviado={periciaRollModal.enviado}
          erro={periciaRollModal.erro}
          onRolarDano={handleRolarDanoHabilidade}
          onClose={() =>
            setPericiaRollModal((estado) => ({ ...estado, aberto: false }))
          }
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

