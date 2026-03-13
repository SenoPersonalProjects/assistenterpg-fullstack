'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  apiAdminGetCondicoes,
  apiAdicionarNpcSessaoCampanha,
  apiAplicarCondicaoSessaoCampanha,
  apiAtualizarOrdemIniciativaSessaoCampanha,
  apiAtualizarCenaSessaoCampanha,
  apiAtualizarNpcSessaoCampanha,
  apiAtualizarRecursosPersonagemCampanha,
  apiAvancarTurnoSessaoCampanha,
  apiEncerrarSustentacaoHabilidadeSessaoCampanha,
  apiDesfazerEventoSessaoCampanha,
  apiEncerrarSessaoCampanha,
  apiEnviarMensagemChatSessaoCampanha,
  apiGetSessaoCampanha,
  apiGetMeusNpcsAmeacas,
  apiListarChatSessaoCampanha,
  apiListarEventosSessaoCampanha,
  apiPularTurnoSessaoCampanha,
  apiRemoverCondicaoSessaoCampanha,
  apiRemoverNpcSessaoCampanha,
  apiUsarHabilidadeSessaoCampanha,
  apiVoltarTurnoSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  CondicaoAtivaSessaoCampanha,
  CondicaoCatalogo,
  DuracaoCondicaoSessaoModo,
  EventoSessaoTimeline,
  MensagemChatSessao,
  NpcAmeacaResumo,
  NpcSessaoCampanha,
  ParticipanteIniciativaSessaoCampanha,
  PersonagemCampanhaResumo,
  SessaoCampanhaDetalhe,
  TipoCenaSessaoCampanha,
} from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { CampaignCharacterEditorModal } from '@/components/campanha/CampaignCharacterEditorModal';
import { MestreShieldGuide } from '@/components/campanha/MestreShieldGuide';
import { SessionCharacterResourceCard } from '@/components/campanha/sessao/SessionCharacterResourceCard';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { corrigirMojibakeTexto } from '@/lib/utils/encoding';
import {
  formatarCustos,
  resolverCustoExibicaoSessao as resolverCustoExibicao,
} from '@/lib/campanha/sessao-habilidades';
import {
  carregarFiltroSustentadasLobby,
  salvarFiltroSustentadasLobby,
} from '@/lib/campanha/sessao-filtro-sustentadas';
import {
  conectarSocketSessao,
  type EventoSessaoPresenca,
  type EventoSessaoAtualizada,
} from '@/lib/realtime/sessao-socket';

const OPCOES_CENA: Array<{ value: TipoCenaSessaoCampanha; label: string }> = [
  { value: 'LIVRE', label: 'Cena livre' },
  { value: 'INVESTIGACAO', label: 'Investigacao' },
  { value: 'FURTIVIDADE', label: 'Furtividade' },
  { value: 'COMBATE', label: 'Combate' },
  { value: 'OUTRA', label: 'Outra' },
];
const COOLDOWN_USO_HABILIDADE_MS = 2500;

type NpcEditavel = {
  vd: string;
  defesa: string;
  pontosVidaAtual: string;
  pontosVidaMax: string;
  deslocamentoMetros: string;
  notasCena: string;
};

type AcaoControleTurno = 'AVANCAR' | 'VOLTAR' | 'PULAR';
type CampoAjusteRecurso = 'pv' | 'pe' | 'ea' | 'san';
type AjustesRecursos = Record<CampoAjusteRecurso, string>;

type FormCondicaoSessao = {
  condicaoId: string;
  duracaoModo: DuracaoCondicaoSessaoModo;
  duracaoValor: string;
  origemDescricao: string;
  observacao: string;
  motivoRemocao: string;
};

type AlvoCondicoesModal = {
  alvoTipo: 'PERSONAGEM' | 'NPC';
  alvoId: number;
  nomeAlvo: string;
  condicoesAtivas: CondicaoAtivaSessaoCampanha[];
};

const FORM_CONDICAO_PADRAO: FormCondicaoSessao = {
  condicaoId: '',
  duracaoModo: 'ATE_REMOVER',
  duracaoValor: '1',
  origemDescricao: '',
  observacao: '',
  motivoRemocao: '',
};

const OPCOES_DURACAO_CONDICAO: Array<{
  value: DuracaoCondicaoSessaoModo;
  label: string;
}> = [
  { value: 'ATE_REMOVER', label: 'Ate remover manualmente' },
  { value: 'RODADAS', label: 'Por rodadas da cena' },
  { value: 'TURNOS_ALVO', label: 'Por turnos do alvo' },
];
const AJUSTE_RECURSO_PADRAO: AjustesRecursos = {
  pv: '0',
  pe: '0',
  ea: '0',
  san: '0',
};

function formatarDataHora(valor: string): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR');
}

function parseRecurso(valor: string, fallback: number): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return fallback;
  return Math.trunc(numero);
}

function parseInteiroComSinal(valor: string): number | null {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;
  return Math.trunc(numero);
}

function clampEntre(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

function parseInteiroPositivo(
  valor: string,
  fallback: number | null = null,
): number | null {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return fallback;
  const inteiro = Math.trunc(numero);
  return inteiro > 0 ? inteiro : fallback;
}

function labelCena(tipo: string): string {
  const cena = OPCOES_CENA.find((item) => item.value === tipo);
  return cena?.label ?? 'Outra cena';
}

function labelTipoNpc(tipo: string): string {
  const labels: Record<string, string> = {
    HUMANO: 'Humano',
    FEITICEIRO: 'Feiticeiro',
    MALDICAO: 'Maldicao',
    ANIMAL: 'Animal',
    HIBRIDO: 'Hibrido',
    OUTRO: 'Outro',
  };

  return labels[tipo] ?? tipo;
}

function labelPapelParticipante(papel: string): string {
  const labels: Record<string, string> = {
    MESTRE: 'Mestre',
    JOGADOR: 'Jogador',
    OBSERVADOR: 'Observador',
  };

  return labels[papel] ?? papel;
}

function textoSeguro(value: string | null | undefined): string {
  if (!value) return '';
  return corrigirMojibakeTexto(value);
}

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

function descreverDuracaoCondicao(
  duracaoModo: string,
  duracaoValor: number | null,
  restanteDuracao: number | null,
): string {
  if (duracaoModo === 'ATE_REMOVER') {
    return 'Duracao: ate remover';
  }

  const sufixo = duracaoModo === 'RODADAS' ? 'rodada(s)' : 'turno(s) do alvo';
  const total = typeof duracaoValor === 'number' ? `${duracaoValor} ${sufixo}` : `? ${sufixo}`;
  if (typeof restanteDuracao === 'number') {
    return `Duracao: ${total} | Restante: ${restanteDuracao}`;
  }
  return `Duracao: ${total}`;
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

export default function SessaoCampanhaPage() {
  const params = useParams<{ id: string; sessaoId: string }>();
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();

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
  const [formCondicaoPorAlvo, setFormCondicaoPorAlvo] = useState<
    Record<string, FormCondicaoSessao>
  >({});
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
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [atualizandoCena, setAtualizandoCena] = useState(false);
  const [acaoTurnoPendente, setAcaoTurnoPendente] =
    useState<AcaoControleTurno | null>(null);
  const [reordenandoIniciativa, setReordenandoIniciativa] = useState(false);
  const [encerrandoSessao, setEncerrandoSessao] = useState(false);
  const [salvandoCardId, setSalvandoCardId] = useState<number | null>(null);
  const [campoRecursoPendente, setCampoRecursoPendente] = useState<
    `${number}:${CampoAjusteRecurso}` | null
  >(null);
  const [adicionandoNpc, setAdicionandoNpc] = useState(false);
  const [salvandoNpcId, setSalvandoNpcId] = useState<number | null>(null);
  const [removendoNpcId, setRemovendoNpcId] = useState<number | null>(null);
  const [desfazendoEventoId, setDesfazendoEventoId] = useState<number | null>(null);
  const [acaoCondicaoPendente, setAcaoCondicaoPendente] = useState<string | null>(
    null,
  );
  const [acaoHabilidadePendente, setAcaoHabilidadePendente] = useState<
    string | null
  >(null);
  const [ultimoUsoHabilidadeMs, setUltimoUsoHabilidadeMs] = useState<
    Record<string, number>
  >({});
  const [acumulosHabilidade, setAcumulosHabilidade] = useState<Record<string, string>>(
    {},
  );
  const [mostrarSomenteSustentadas, setMostrarSomenteSustentadas] = useState<
    Record<number, boolean>
  >({});
  const [filtroSustentadasHydrated, setFiltroSustentadasHydrated] = useState(false);
  const [socketConectado, setSocketConectado] = useState(false);
  const [onlineUsuarioIds, setOnlineUsuarioIds] = useState<number[]>([]);
  const [indiceIniciativaArrastado, setIndiceIniciativaArrastado] = useState<
    number | null
  >(null);
  const [indiceIniciativaHover, setIndiceIniciativaHover] = useState<number | null>(
    null,
  );
  const [colunaEsquerdaRecolhida, setColunaEsquerdaRecolhida] = useState(false);
  const [colunaDireitaRecolhida, setColunaDireitaRecolhida] = useState(false);
  const [personagemEmEdicao, setPersonagemEmEdicao] = useState<
    Pick<PersonagemCampanhaResumo, 'id' | 'nome' | 'recursos'> | null
  >(null);

  const chatRef = useRef<MensagemChatSessao[]>([]);
  const fimChatRef = useRef<HTMLDivElement | null>(null);
  const sincronizandoTempoRealRef = useRef(false);

  const chaveAlvoCondicao = useCallback(
    (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) => `${alvoTipo}:${alvoId}`,
    [],
  );

  const chaveAcaoAplicarCondicao = useCallback(
    (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number) =>
      `aplicar:${alvoTipo}:${alvoId}`,
    [],
  );

  const chaveAcaoRemoverCondicao = useCallback(
    (condicaoSessaoId: number) => `remover:${condicaoSessaoId}`,
    [],
  );

  const obterFormCondicaoAlvo = useCallback(
    (alvoTipo: 'PERSONAGEM' | 'NPC', alvoId: number): FormCondicaoSessao =>
      formCondicaoPorAlvo[chaveAlvoCondicao(alvoTipo, alvoId)] ??
      FORM_CONDICAO_PADRAO,
    [chaveAlvoCondicao, formCondicaoPorAlvo],
  );

  const atualizarCampoFormCondicao = useCallback(
    (
      alvoTipo: 'PERSONAGEM' | 'NPC',
      alvoId: number,
      campo: keyof FormCondicaoSessao,
      valor: string,
    ) => {
      const chave = chaveAlvoCondicao(alvoTipo, alvoId);
      setFormCondicaoPorAlvo((estadoAtual) => ({
        ...estadoAtual,
        [chave]: {
          ...(estadoAtual[chave] ?? FORM_CONDICAO_PADRAO),
          [campo]: valor,
        },
      }));
    },
    [chaveAlvoCondicao],
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
          proximoEstado[npc.npcSessaoId] = {
            vd: String(npc.vd),
            defesa: String(npc.defesa),
            pontosVidaAtual: String(npc.pontosVidaAtual),
            pontosVidaMax: String(npc.pontosVidaMax),
            deslocamentoMetros: String(npc.deslocamentoMetros),
            notasCena: npc.notasCena ?? '',
          };
        }
        return proximoEstado;
      });
    },
    [],
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

  useEffect(() => {
    if (!idsValidos || !usuario) return;

    const intervaloMs = socketConectado ? 15000 : 3000;
    const intervalo = window.setInterval(() => {
      void sincronizarTempoReal();
    }, intervaloMs);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [idsValidos, socketConectado, sincronizarTempoReal, usuario]);

  useEffect(() => {
    if (!idsValidos || !usuario) return;

    const socket = conectarSocketSessao();

    const entrarNaSala = () => {
      socket.emit('sessao:join', { campanhaId, sessaoId });
    };

    const handleConnect = () => {
      setSocketConectado(true);
      setOnlineUsuarioIds((anterior) =>
        anterior.includes(usuario.id) ? anterior : [...anterior, usuario.id],
      );
      entrarNaSala();
    };

    const handleDisconnect = () => {
      setSocketConectado(false);
      setOnlineUsuarioIds([]);
    };

    const handleConnectError = () => {
      setSocketConectado(false);
      setOnlineUsuarioIds([]);
    };

    const handleSessaoErro = () => {
      setSocketConectado(false);
      setOnlineUsuarioIds([]);
    };

    const handleSessaoPresenca = (evento: EventoSessaoPresenca) => {
      if (!evento) return;
      if (evento.campanhaId !== campanhaId || evento.sessaoId !== sessaoId) return;
      setOnlineUsuarioIds(
        Array.isArray(evento.onlineUsuarioIds) ? evento.onlineUsuarioIds : [],
      );
    };

    const handleSessaoAtualizada = (evento: EventoSessaoAtualizada) => {
      if (!evento) return;
      if (evento.campanhaId !== campanhaId || evento.sessaoId !== sessaoId) return;
      void sincronizarTempoReal();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('sessao:joined', () => setSocketConectado(true));
    socket.on('sessao:erro', handleSessaoErro);
    socket.on('sessao:presenca', handleSessaoPresenca);
    socket.on('sessao:atualizada', handleSessaoAtualizada);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('sessao:joined');
      socket.off('sessao:erro', handleSessaoErro);
      socket.off('sessao:presenca', handleSessaoPresenca);
      socket.off('sessao:atualizada', handleSessaoAtualizada);
      socket.disconnect();
      setSocketConectado(false);
      setOnlineUsuarioIds([]);
    };
  }, [campanhaId, idsValidos, sessaoId, sincronizarTempoReal, usuario]);

  const podeControlarSessao = Boolean(detalhe?.permissoes.ehMestre);
  const sessaoEncerrada = detalhe?.status === 'ENCERRADA';
  const participantes = detalhe?.participantes ?? [];
  const cards = detalhe?.cards ?? [];
  const npcs = detalhe?.npcs ?? [];
  const iniciativaOrdem = detalhe?.iniciativa.ordem ?? [];
  const iniciativaIndiceAtual = detalhe?.iniciativa.indiceAtual ?? null;
  const turnoAtualLabel = detalhe?.turnoAtual
    ? `${labelParticipanteIniciativa(detalhe.turnoAtual)}${
        typeof detalhe.turnoAtual.valorIniciativa === 'number'
          ? ` | INI ${detalhe.turnoAtual.valorIniciativa}`
          : ''
      }`
    : null;
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
    : FORM_CONDICAO_PADRAO;
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

  function montarChaveEncerrarSustentacao(
    personagemSessaoId: number,
    sustentacaoId: number,
  ): string {
    return `encerrar:${personagemSessaoId}:${sustentacaoId}`;
  }

  const renderPainelCondicoes = (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: SessaoCampanhaDetalhe['cards'][number]['condicoesAtivas'],
  ) => {
    const form = obterFormCondicaoAlvo(alvoTipo, alvoId);
    const chaveAplicar = chaveAcaoAplicarCondicao(alvoTipo, alvoId);

    return (
      <details className="rounded border border-app-border p-2">
        <summary className="cursor-pointer text-xs font-semibold text-app-fg">
          Condicoes da sessao ({condicoesAtivas.length})
        </summary>
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
                      onClick={() =>
                        void handleRemoverCondicao(alvoTipo, alvoId, condicao.id)
                      }
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
                    Selecionada: {textoSeguro(
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
          const recursos = card.recursos;
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
            <Card key={card.personagemSessaoId} className="session-panel space-y-3">
              {recursos ? (
                <SessionCharacterResourceCard
                  nomePersonagem={card.nomePersonagem}
                  nomeJogador={card.nomeJogador}
                  iniciativaValor={iniciativaValor ?? null}
                  expandido={cardRecursosExpandido}
                  onAlternarExpandido={() =>
                    setCardsRecursosExpandidos((estadoAtual) => ({
                      ...estadoAtual,
                      [card.personagemSessaoId]:
                        !estadoAtual[card.personagemSessaoId],
                    }))
                  }
                  podeAjustar={card.podeEditar}
                  ajustePersonalizado={ajustesRecursos}
                  onAtualizarAjustePersonalizado={(campo, valor) =>
                    atualizarAjusteRecursoCard(
                      card.personagemCampanhaId,
                      campo,
                      valor,
                    )
                  }
                  onAplicarAjusteRapido={(campo, delta) =>
                    void handleAplicarDeltaRecursoCard(card, campo, delta)
                  }
                  onAplicarAjustePersonalizado={(campo) =>
                    void handleAplicarAjustePersonalizadoRecursoCard(card, campo)
                  }
                  acaoPendenteCampo={campoRecursoPendenteCard}
                  desabilitado={
                    sessaoEncerrada || salvandoCardId === card.personagemCampanhaId
                  }
                  recursos={{
                    pvAtual: recursos.pvAtual,
                    pvMax: recursos.pvMax,
                    sanAtual: recursos.sanAtual,
                    sanMax: recursos.sanMax,
                    eaAtual: recursos.eaAtual,
                    eaMax: recursos.eaMax,
                    peAtual: recursos.peAtual,
                    peMax: recursos.peMax,
                  }}
                />
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-app-fg">{card.nomePersonagem}</h3>
                  <p className="text-xs text-app-muted">Jogador: {card.nomeJogador}</p>
                </div>
              )}

              {!recursos ? (
                <p className="text-xs text-app-muted">
                  Visao resumida: apenas nome do jogador e personagem.
                </p>
              ) : null}

              {recursos && cardRecursosExpandido ? (
                <div className="space-y-2">
                  {card.podeEditar ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAbrirEdicaoPersonagem(card)}
                        disabled={sessaoEncerrada || !card.recursos}
                      >
                        Ajustes narrativos
                      </Button>
                    </div>
                  ) : null}
                  <label className="inline-flex items-center gap-2 text-[11px] text-app-muted">
                    <input
                      type="checkbox"
                      checked={Boolean(mostrarSomenteSustentadas[card.personagemSessaoId])}
                      onChange={(event) =>
                        setMostrarSomenteSustentadas((estadoAtual) => ({
                          ...estadoAtual,
                          [card.personagemSessaoId]: event.target.checked,
                        }))
                      }
                      disabled={card.sustentacoesAtivas.length === 0}
                      className="h-3.5 w-3.5 rounded border border-app-border bg-app-surface"
                    />
                    Mostrar somente sustentadas ativas
                  </label>

                  {renderPainelCondicoes(
                    'PERSONAGEM',
                    card.personagemSessaoId,
                    card.nomePersonagem,
                    card.condicoesAtivas,
                  )}

                  <details className="rounded border border-app-border p-2">
                    <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                      Tecnica inata
                    </summary>
                    <div className="mt-2 space-y-2">
                      {card.tecnicaInata ? (
                        renderTecnica(card.tecnicaInata)
                      ) : (
                        <p className="text-[11px] text-app-muted">
                          Personagem sem tecnica inata cadastrada.
                        </p>
                      )}
                    </div>
                  </details>

                  <details className="rounded border border-app-border p-2">
                    <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                      Tecnicas nao inatas ({card.tecnicasNaoInatas.length})
                    </summary>
                    <div className="mt-2 space-y-2">
                      {card.tecnicasNaoInatas.length > 0 ? (
                        card.tecnicasNaoInatas.map((tecnica) => renderTecnica(tecnica))
                      ) : (
                        <p className="text-[11px] text-app-muted">
                          Nenhuma tecnica nao inata disponivel no momento.
                        </p>
                      )}
                    </div>
                  </details>

                  <details className="rounded border border-app-border p-2">
                    <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                      Sustentacoes ativas ({card.sustentacoesAtivas.length})
                    </summary>
                    <div className="mt-2 space-y-1.5">
                      {card.sustentacoesAtivas.length === 0 ? (
                        <p className="text-[11px] text-app-muted">
                          Nenhuma habilidade sustentada ativa.
                        </p>
                      ) : (
                        card.sustentacoesAtivas.map((sustentacao) => {
                          const chaveEncerrar = montarChaveEncerrarSustentacao(
                            card.personagemSessaoId,
                            sustentacao.id,
                          );
                          return (
                            <div
                              key={`sustentacao-${sustentacao.id}`}
                              className="rounded border border-app-border bg-app-surface px-2 py-1.5 flex items-center justify-between gap-2"
                            >
                              <div>
                                <p className="text-xs font-semibold text-app-fg">
                                  {sustentacao.nomeHabilidade}
                                  {sustentacao.nomeVariacao
                                    ? ` (${sustentacao.nomeVariacao})`
                                    : ''}
                                </p>
                                <p className="text-[11px] text-app-muted">
                                  {formatarCustos(
                                    sustentacao.custoSustentacaoEA,
                                    sustentacao.custoSustentacaoPE,
                                  )}
                                  /rodada | Ativa desde rodada{' '}
                                  {sustentacao.ativadaNaRodada}
                                </p>
                              </div>
                              {card.podeEditar ? (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    void handleEncerrarSustentacao(
                                      card.personagemSessaoId,
                                      sustentacao.id,
                                    )
                                  }
                                  disabled={
                                    sessaoEncerrada ||
                                    acaoHabilidadePendente === chaveEncerrar
                                  }
                                >
                                  {acaoHabilidadePendente === chaveEncerrar
                                    ? 'Encerrando...'
                                    : 'Encerrar'}
                                </Button>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </details>
                </div>
              ) : null}

              {recursos && !cardRecursosExpandido ? (
                <p className="text-[11px] text-app-muted">
                  Card resumido ativo. Abra para ver condicoes, tecnicas e sustentacoes.
                </p>
              ) : null}

              {card.podeEditar ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `/personagens-base/${card.personagemBaseId}`,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  Abrir ficha completa
                </Button>
              ) : null}
            </Card>
          );
        })
      )}
    </>
  );

  async function handleAtualizarCena() {
    if (!detalhe) return;

    setAtualizandoCena(true);
    setErro(null);
    try {
      const atualizado = await apiAtualizarCenaSessaoCampanha(campanhaId, sessaoId, {
        tipo: cenaTipo,
        nome: cenaNome.trim() || undefined,
      });
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAtualizandoCena(false);
    }
  }

  async function handleControleTurno(acao: AcaoControleTurno) {
    if (!detalhe || !detalhe.controleTurnosAtivo) return;

    setAcaoTurnoPendente(acao);
    setErro(null);
    try {
      const atualizado =
        acao === 'VOLTAR'
          ? await apiVoltarTurnoSessaoCampanha(campanhaId, sessaoId)
          : acao === 'PULAR'
            ? await apiPularTurnoSessaoCampanha(campanhaId, sessaoId)
            : await apiAvancarTurnoSessaoCampanha(campanhaId, sessaoId);
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAcaoTurnoPendente(null);
    }
  }

  async function handleMoverIniciativa(
    indiceAtual: number,
    direcao: 'SUBIR' | 'DESCER',
  ) {
    if (!detalhe?.controleTurnosAtivo || !podeControlarSessao) return;
    if (sessaoEncerrada || reordenandoIniciativa) return;

    const ordemAtual = detalhe.iniciativa.ordem;
    const deslocamento = direcao === 'SUBIR' ? -1 : 1;
    const indiceDestino = indiceAtual + deslocamento;
    if (indiceDestino < 0 || indiceDestino >= ordemAtual.length) {
      return;
    }

    const novaOrdem = [...ordemAtual];
    const [movido] = novaOrdem.splice(indiceAtual, 1);
    novaOrdem.splice(indiceDestino, 0, movido);
    const payload = montarPayloadOrdemIniciativa(
      novaOrdem,
      detalhe.iniciativa.indiceAtual,
    );
    if (!payload) return;

    setReordenandoIniciativa(true);
    setErro(null);
    try {
      const atualizado = await apiAtualizarOrdemIniciativaSessaoCampanha(
        campanhaId,
        sessaoId,
        payload,
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setReordenandoIniciativa(false);
    }
  }

  function montarPayloadOrdemIniciativa(
    ordem: SessaoCampanhaDetalhe['iniciativa']['ordem'],
    indiceTurnoAtual: number | null,
  ):
    | {
        ordem: Array<{ tipoParticipante: 'PERSONAGEM' | 'NPC'; id: number }>;
        indiceTurnoAtual?: number;
      }
    | null {
    const payload = {
      ordem: ordem.map((participante) => ({
        tipoParticipante: participante.tipoParticipante,
        id:
          participante.tipoParticipante === 'NPC'
            ? (participante.npcSessaoId ?? 0)
            : (participante.personagemSessaoId ?? 0),
      })),
      indiceTurnoAtual: indiceTurnoAtual ?? undefined,
    };

    if (payload.ordem.some((item) => item.id <= 0)) {
      setErro('Nao foi possivel reordenar iniciativa: participante invalido.');
      return null;
    }

    return payload;
  }

  async function handleDropIniciativa(indiceDestino: number) {
    if (!detalhe?.controleTurnosAtivo || !podeControlarSessao) return;
    if (sessaoEncerrada || reordenandoIniciativa) return;
    if (indiceIniciativaArrastado === null) return;

    const ordemAtual = detalhe.iniciativa.ordem;
    if (
      indiceIniciativaArrastado < 0 ||
      indiceIniciativaArrastado >= ordemAtual.length ||
      indiceDestino < 0 ||
      indiceDestino >= ordemAtual.length
    ) {
      return;
    }

    if (indiceIniciativaArrastado === indiceDestino) {
      return;
    }

    const novaOrdem = [...ordemAtual];
    const [movido] = novaOrdem.splice(indiceIniciativaArrastado, 1);
    novaOrdem.splice(indiceDestino, 0, movido);

    const payload = montarPayloadOrdemIniciativa(
      novaOrdem,
      detalhe.iniciativa.indiceAtual,
    );
    if (!payload) return;

    setReordenandoIniciativa(true);
    setErro(null);
    try {
      const atualizado = await apiAtualizarOrdemIniciativaSessaoCampanha(
        campanhaId,
        sessaoId,
        payload,
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setReordenandoIniciativa(false);
      setIndiceIniciativaArrastado(null);
      setIndiceIniciativaHover(null);
    }
  }

  async function handleEncerrarSessao() {
    if (!detalhe || detalhe.status === 'ENCERRADA') return;

    setEncerrandoSessao(true);
    setErro(null);
    try {
      const atualizado = await apiEncerrarSessaoCampanha(campanhaId, sessaoId);
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEncerrandoSessao(false);
    }
  }

  function obterAjustesRecursosCard(personagemCampanhaId: number): AjustesRecursos {
    return ajustesRecursosPorCard[personagemCampanhaId] ?? AJUSTE_RECURSO_PADRAO;
  }

  function atualizarAjusteRecursoCard(
    personagemCampanhaId: number,
    campo: CampoAjusteRecurso,
    valor: string,
  ) {
    setAjustesRecursosPorCard((estadoAtual) => ({
      ...estadoAtual,
      [personagemCampanhaId]: {
        ...(estadoAtual[personagemCampanhaId] ?? AJUSTE_RECURSO_PADRAO),
        [campo]: valor,
      },
    }));
  }

  function montarPayloadAjustadoRecursoCard(
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
    delta: number,
  ): {
    pvAtual: number;
    peAtual: number;
    eaAtual: number;
    sanAtual: number;
  } | null {
    if (!card.recursos) return null;

    const base = {
      pvAtual: card.recursos.pvAtual,
      peAtual: card.recursos.peAtual,
      eaAtual: card.recursos.eaAtual,
      sanAtual: card.recursos.sanAtual,
    };

    switch (campo) {
      case 'pv':
        base.pvAtual = clampEntre(base.pvAtual + delta, 0, card.recursos.pvMax);
        break;
      case 'pe':
        base.peAtual = clampEntre(base.peAtual + delta, 0, card.recursos.peMax);
        break;
      case 'ea':
        base.eaAtual = clampEntre(base.eaAtual + delta, 0, card.recursos.eaMax);
        break;
      case 'san':
        base.sanAtual = clampEntre(base.sanAtual + delta, 0, card.recursos.sanMax);
        break;
      default:
        return null;
    }

    return base;
  }

  async function handleAplicarDeltaRecursoCard(
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
    delta: number,
  ) {
    if (!card.podeEditar || !card.recursos || sessaoEncerrada) return;
    if (!Number.isFinite(delta) || Math.trunc(delta) === 0) return;

    const deltaInteiro = Math.trunc(delta);
    const payload = montarPayloadAjustadoRecursoCard(card, campo, deltaInteiro);
    if (!payload) return;
    const chaveCampo = `${card.personagemCampanhaId}:${campo}` as const;

    setSalvandoCardId(card.personagemCampanhaId);
    setCampoRecursoPendente(chaveCampo);
    setErro(null);
    try {
      await apiAtualizarRecursosPersonagemCampanha(
        campanhaId,
        card.personagemCampanhaId,
        payload,
      );
      const atualizado = await apiGetSessaoCampanha(campanhaId, sessaoId);
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvandoCardId(null);
      setCampoRecursoPendente(null);
    }
  }

  async function handleAplicarAjustePersonalizadoRecursoCard(
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
  ) {
    const ajuste = obterAjustesRecursosCard(card.personagemCampanhaId)[campo];
    const delta = parseInteiroComSinal(ajuste);
    if (delta === null || delta === 0) {
      setErro('Informe um ajuste inteiro diferente de zero (ex.: -3, +2).');
      return;
    }

    await handleAplicarDeltaRecursoCard(card, campo, delta);
  }

  async function handleAplicarCondicao(
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
  ) {
    if (!podeControlarSessao || sessaoEncerrada) return;

    const form = obterFormCondicaoAlvo(alvoTipo, alvoId);
    const condicaoId = parseInteiroPositivo(form.condicaoId);
    if (!condicaoId) {
      setErro('Selecione uma condicao valida para aplicar.');
      return;
    }

    const requerDuracaoNumerica = form.duracaoModo !== 'ATE_REMOVER';
    const duracaoValor = requerDuracaoNumerica
      ? parseInteiroPositivo(form.duracaoValor)
      : null;
    if (requerDuracaoNumerica && !duracaoValor) {
      setErro('Informe uma duracao numerica maior que zero.');
      return;
    }

    const chaveAcao = chaveAcaoAplicarCondicao(alvoTipo, alvoId);
    setAcaoCondicaoPendente(chaveAcao);
    setErro(null);
    try {
      const atualizado = await apiAplicarCondicaoSessaoCampanha(campanhaId, sessaoId, {
        condicaoId,
        alvoTipo,
        personagemSessaoId: alvoTipo === 'PERSONAGEM' ? alvoId : undefined,
        npcSessaoId: alvoTipo === 'NPC' ? alvoId : undefined,
        duracaoModo: form.duracaoModo,
        duracaoValor: duracaoValor ?? undefined,
        origemDescricao: form.origemDescricao.trim() || undefined,
        observacao: form.observacao.trim() || undefined,
      });
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAcaoCondicaoPendente(null);
    }
  }

  async function handleRemoverCondicao(
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    condicaoSessaoId: number,
  ) {
    if (!podeControlarSessao || sessaoEncerrada) return;

    const form = obterFormCondicaoAlvo(alvoTipo, alvoId);
    const chaveAcao = chaveAcaoRemoverCondicao(condicaoSessaoId);
    setAcaoCondicaoPendente(chaveAcao);
    setErro(null);
    try {
      const atualizado = await apiRemoverCondicaoSessaoCampanha(
        campanhaId,
        sessaoId,
        condicaoSessaoId,
        {
          motivo: form.motivoRemocao.trim() || undefined,
        },
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAcaoCondicaoPendente(null);
    }
  }

  async function handleUsarHabilidade(
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) {
    if (sessaoEncerrada) return;

    const chave = montarChaveUsoHabilidade(
      personagemSessaoId,
      habilidadeTecnicaId,
      variacaoHabilidadeId,
    );
    const agora = Date.now();
    const ultimoUso = ultimoUsoHabilidadeMs[chave] ?? 0;
    const restanteCooldown = COOLDOWN_USO_HABILIDADE_MS - (agora - ultimoUso);
    if (restanteCooldown > 0) {
      setErro(
        `Aguarde ${Math.ceil(restanteCooldown / 1000)}s antes de usar novamente.`,
      );
      return;
    }

    setAcaoHabilidadePendente(chave);
    setUltimoUsoHabilidadeMs((estadoAtual) => ({
      ...estadoAtual,
      [chave]: agora,
    }));
    setErro(null);
    try {
      const atualizado = await apiUsarHabilidadeSessaoCampanha(
        campanhaId,
        sessaoId,
        personagemSessaoId,
        {
          habilidadeTecnicaId,
          variacaoHabilidadeId,
          acumulos:
            typeof acumulos === 'number' && Number.isFinite(acumulos)
              ? Math.max(0, Math.trunc(acumulos))
              : undefined,
        },
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAcaoHabilidadePendente(null);
    }
  }

  async function handleEncerrarSustentacao(
    personagemSessaoId: number,
    sustentacaoId: number,
  ) {
    if (sessaoEncerrada) return;

    const chave = montarChaveEncerrarSustentacao(
      personagemSessaoId,
      sustentacaoId,
    );
    setAcaoHabilidadePendente(chave);
    setErro(null);
    try {
      const atualizado = await apiEncerrarSustentacaoHabilidadeSessaoCampanha(
        campanhaId,
        sessaoId,
        personagemSessaoId,
        sustentacaoId,
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAcaoHabilidadePendente(null);
    }
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

  async function handleAdicionarNpcNaCena() {
    const npcAmeacaId = Number(npcSelecionadoId);
    if (!Number.isInteger(npcAmeacaId) || npcAmeacaId <= 0) return;

    setAdicionandoNpc(true);
    setErro(null);
    try {
      const atualizado = await apiAdicionarNpcSessaoCampanha(campanhaId, sessaoId, {
        npcAmeacaId,
        nomeExibicao: nomeNpcCustomizado.trim() || undefined,
      });
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
      setNomeNpcCustomizado('');
      setModalAdicionarNpcAberto(false);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAdicionandoNpc(false);
    }
  }

  async function handleSalvarNpc(npc: NpcSessaoCampanha) {
    const draft = edicaoNpcs[npc.npcSessaoId];
    if (!draft) return;

    setSalvandoNpcId(npc.npcSessaoId);
    setErro(null);
    try {
      const atualizado = await apiAtualizarNpcSessaoCampanha(
        campanhaId,
        sessaoId,
        npc.npcSessaoId,
        {
          vd: parseRecurso(draft.vd, npc.vd),
          defesa: parseRecurso(draft.defesa, npc.defesa),
          pontosVidaAtual: parseRecurso(draft.pontosVidaAtual, npc.pontosVidaAtual),
          pontosVidaMax: parseRecurso(draft.pontosVidaMax, npc.pontosVidaMax),
          deslocamentoMetros: parseRecurso(
            draft.deslocamentoMetros,
            npc.deslocamentoMetros,
          ),
          notasCena: draft.notasCena,
        },
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvandoNpcId(null);
    }
  }

  async function handleRemoverNpc(npcSessaoId: number) {
    setRemovendoNpcId(npcSessaoId);
    setErro(null);
    try {
      const atualizado = await apiRemoverNpcSessaoCampanha(
        campanhaId,
        sessaoId,
        npcSessaoId,
      );
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setRemovendoNpcId(null);
    }
  }

  async function handleDesfazerEvento(eventoId: number, motivo?: string) {
    if (!idsValidos || !usuario) return;

    setDesfazendoEventoId(eventoId);
    setErro(null);
    try {
      const [detalheAtualizada, eventosAtualizados] = await Promise.all([
        apiDesfazerEventoSessaoCampanha(campanhaId, sessaoId, eventoId, {
          motivo: motivo?.trim() || undefined,
        }),
        apiListarEventosSessaoCampanha(campanhaId, sessaoId, {
          limit: 80,
          incluirChat: false,
        }),
      ]);

      setDetalhe(detalheAtualizada);
      sincronizarEstadosDerivados(detalheAtualizada);
      setEventosSessao(eventosAtualizados);
      setMotivoDesfazerEventoModal('');
      setEventoDetalheModal(null);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setDesfazendoEventoId(null);
    }
  }

  async function handleEnviarMensagem() {
    const mensagemLimpa = mensagem.trim();
    if (!mensagemLimpa) return;

    setEnviandoMensagem(true);
    setErro(null);
    try {
      const enviada = await apiEnviarMensagemChatSessaoCampanha(campanhaId, sessaoId, {
        mensagem: mensagemLimpa,
      });
      setChat((anterior) => [...anterior, enviada]);
      setMensagem('');
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEnviandoMensagem(false);
    }
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
          <div className="min-w-0">
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
            <div className="session-chip-row mt-2.5">
              <span className="session-chip">
                Cena: {labelCena(detalhe.cenaAtual.tipo)}
              </span>
              <span className="session-chip">
                Participantes online: {totalParticipantesOnline}/{participantes.length}
              </span>
              <span className="session-chip">
                Aliados ou ameacas: {npcs.length}
              </span>
              {detalhe.controleTurnosAtivo ? (
                <span className="session-chip">
                  Rodada {detalhe.rodadaAtual ?? 1}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={sessaoEncerrada ? 'gray' : 'green'} size="md">
              {sessaoEncerrada ? 'Sessao encerrada' : 'Sessao ativa'}
            </Badge>
            <Badge color={socketConectado ? 'cyan' : 'yellow'} size="md">
              {socketConectado ? 'Tempo real' : 'Fallback polling'}
            </Badge>
            <Button variant="ghost" onClick={() => router.push(`/campanhas/${campanhaId}`)}>
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar para campanha
            </Button>
          </div>
        </header>

        {erro ? <ErrorAlert message={erro} /> : null}

        <div className={gridSessaoClassName}>
          {!colunaEsquerdaRecolhida ? (
            <section className="space-y-3">
            <div className="flex justify-end">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setColunaEsquerdaRecolhida(true)}
                title="Ocultar painel esquerdo"
              >
                <Icon name="chevron-left" className="h-3.5 w-3.5" />
              </Button>
            </div>
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

            <SessionPanel
              title="Aliados ou ameacas na cena"
              subtitle="Mestre adiciona e ajusta aliados ou ameacas por cena. Jogadores visualizam em modo leitura."
              right={
                podeControlarSessao ? (
                  <Button
                    size="sm"
                    onClick={() => setModalAdicionarNpcAberto(true)}
                    disabled={sessaoEncerrada || npcsDisponiveis.length === 0}
                  >
                    <Icon name="add" className="mr-1.5 h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                ) : undefined
              }
            />

            {npcs.length === 0 ? (
              <EmptyState
                variant="card"
                icon="curse"
                title="Sem aliados ou ameacas nesta cena"
                description="O mestre pode adicionar aliados ou ameacas para esta cena."
              />
            ) : (
              npcs.map((npc) => {
                const draft = edicaoNpcs[npc.npcSessaoId];
                const metadadosAcao = (acao: NpcSessaoCampanha['acoes'][number]) =>
                  [
                    acao.tipoExecucao,
                    acao.alcance,
                    acao.alvo,
                    acao.duracao,
                    acao.resistencia,
                    acao.dtResistencia ? `DT ${acao.dtResistencia}` : null,
                    typeof acao.custoPE === 'number' ? `PE ${acao.custoPE}` : null,
                    typeof acao.custoEA === 'number' ? `EA ${acao.custoEA}` : null,
                    acao.teste,
                    acao.dano,
                    acao.critico,
                  ]
                    .filter(Boolean)
                    .join(' | ');

                return (
                  <Card key={npc.npcSessaoId} className="session-panel space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-app-fg">{npc.nome}</h3>
                      <p className="text-xs text-app-muted">
                        {npc.fichaTipo === 'NPC' ? 'Aliado' : 'Ameaca'} | {labelTipoNpc(npc.tipo)}
                      </p>
                    </div>

                    {podeControlarSessao && npc.podeEditar ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            label="VD"
                            value={draft?.vd ?? String(npc.vd)}
                            onChange={(event) =>
                              setEdicaoNpcs((anterior) => ({
                                ...anterior,
                                [npc.npcSessaoId]: {
                                  ...(anterior[npc.npcSessaoId] ?? {
                                    vd: String(npc.vd),
                                    defesa: String(npc.defesa),
                                    pontosVidaAtual: String(npc.pontosVidaAtual),
                                    pontosVidaMax: String(npc.pontosVidaMax),
                                    deslocamentoMetros: String(npc.deslocamentoMetros),
                                    notasCena: npc.notasCena ?? '',
                                  }),
                                  vd: event.target.value,
                                },
                              }))
                            }
                          />
                          <Input
                            type="number"
                            label="Defesa"
                            value={draft?.defesa ?? String(npc.defesa)}
                            onChange={(event) =>
                              setEdicaoNpcs((anterior) => ({
                                ...anterior,
                                [npc.npcSessaoId]: {
                                  ...(anterior[npc.npcSessaoId] ?? {
                                    vd: String(npc.vd),
                                    defesa: String(npc.defesa),
                                    pontosVidaAtual: String(npc.pontosVidaAtual),
                                    pontosVidaMax: String(npc.pontosVidaMax),
                                    deslocamentoMetros: String(npc.deslocamentoMetros),
                                    notasCena: npc.notasCena ?? '',
                                  }),
                                  defesa: event.target.value,
                                },
                              }))
                            }
                          />
                          <Input
                            type="number"
                            label="PV atual"
                            value={draft?.pontosVidaAtual ?? String(npc.pontosVidaAtual)}
                            onChange={(event) =>
                              setEdicaoNpcs((anterior) => ({
                                ...anterior,
                                [npc.npcSessaoId]: {
                                  ...(anterior[npc.npcSessaoId] ?? {
                                    vd: String(npc.vd),
                                    defesa: String(npc.defesa),
                                    pontosVidaAtual: String(npc.pontosVidaAtual),
                                    pontosVidaMax: String(npc.pontosVidaMax),
                                    deslocamentoMetros: String(npc.deslocamentoMetros),
                                    notasCena: npc.notasCena ?? '',
                                  }),
                                  pontosVidaAtual: event.target.value,
                                },
                              }))
                            }
                          />
                          <Input
                            type="number"
                            label="PV max"
                            value={draft?.pontosVidaMax ?? String(npc.pontosVidaMax)}
                            onChange={(event) =>
                              setEdicaoNpcs((anterior) => ({
                                ...anterior,
                                [npc.npcSessaoId]: {
                                  ...(anterior[npc.npcSessaoId] ?? {
                                    vd: String(npc.vd),
                                    defesa: String(npc.defesa),
                                    pontosVidaAtual: String(npc.pontosVidaAtual),
                                    pontosVidaMax: String(npc.pontosVidaMax),
                                    deslocamentoMetros: String(npc.deslocamentoMetros),
                                    notasCena: npc.notasCena ?? '',
                                  }),
                                  pontosVidaMax: event.target.value,
                                },
                              }))
                            }
                          />
                          <Input
                            type="number"
                            label="Deslocamento (m)"
                            value={
                              draft?.deslocamentoMetros ??
                              String(npc.deslocamentoMetros)
                            }
                            onChange={(event) =>
                              setEdicaoNpcs((anterior) => ({
                                ...anterior,
                                [npc.npcSessaoId]: {
                                  ...(anterior[npc.npcSessaoId] ?? {
                                    vd: String(npc.vd),
                                    defesa: String(npc.defesa),
                                    pontosVidaAtual: String(npc.pontosVidaAtual),
                                    pontosVidaMax: String(npc.pontosVidaMax),
                                    deslocamentoMetros: String(npc.deslocamentoMetros),
                                    notasCena: npc.notasCena ?? '',
                                  }),
                                  deslocamentoMetros: event.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <Input
                          label="Notas da cena (opcional)"
                          value={draft?.notasCena ?? npc.notasCena ?? ''}
                          onChange={(event) =>
                            setEdicaoNpcs((anterior) => ({
                              ...anterior,
                              [npc.npcSessaoId]: {
                                ...(anterior[npc.npcSessaoId] ?? {
                                  vd: String(npc.vd),
                                  defesa: String(npc.defesa),
                                  pontosVidaAtual: String(npc.pontosVidaAtual),
                                  pontosVidaMax: String(npc.pontosVidaMax),
                                  deslocamentoMetros: String(npc.deslocamentoMetros),
                                  notasCena: npc.notasCena ?? '',
                                }),
                                notasCena: event.target.value,
                              },
                            }))
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => void handleSalvarNpc(npc)}
                            disabled={
                              sessaoEncerrada || salvandoNpcId === npc.npcSessaoId
                            }
                          >
                            {salvandoNpcId === npc.npcSessaoId
                              ? 'Salvando...'
                              : 'Salvar ficha'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void handleRemoverNpc(npc.npcSessaoId)}
                            disabled={
                              sessaoEncerrada || removendoNpcId === npc.npcSessaoId
                            }
                          >
                            {removendoNpcId === npc.npcSessaoId
                              ? 'Removendo...'
                              : 'Remover da cena'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-app-muted">
                        VD {npc.vd} | DEF {npc.defesa} | PV {npc.pontosVidaAtual}/
                        {npc.pontosVidaMax} | Desloc. {npc.deslocamentoMetros}m
                      </p>
                    )}

                    {renderPainelCondicoes(
                      'NPC',
                      npc.npcSessaoId,
                      npc.nome,
                      npc.condicoesAtivas,
                    )}

                    {npc.passivas.length > 0 ? (
                      <details className="rounded border border-app-border p-2">
                        <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                          Passivas guia ({npc.passivas.length})
                        </summary>
                        <div className="mt-2 space-y-2">
                          {npc.passivas.map((passiva, passivaIndex) => (
                            <div
                              key={`npc-passiva-${npc.npcSessaoId}-${passivaIndex}`}
                              className="rounded border border-app-border bg-app-surface px-2 py-1.5"
                            >
                              <p className="text-xs font-semibold text-app-fg">
                                {passiva.nome}
                              </p>
                              <p className="text-xs text-app-muted">{passiva.descricao}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}

                    {npc.acoes.length > 0 ? (
                      <details className="rounded border border-app-border p-2">
                        <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                          Acoes guia ({npc.acoes.length})
                        </summary>
                        <div className="mt-2 space-y-2">
                          {npc.acoes.map((acao, acaoIndex) => (
                            <div
                              key={`npc-acao-${npc.npcSessaoId}-${acaoIndex}`}
                              className="rounded border border-app-border bg-app-surface px-2 py-1.5"
                            >
                              <p className="text-xs font-semibold text-app-fg">{acao.nome}</p>
                              {metadadosAcao(acao) ? (
                                <p className="text-xs text-app-muted">{metadadosAcao(acao)}</p>
                              ) : null}
                              {acao.efeito ? (
                                <p className="text-xs text-app-muted">{acao.efeito}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </Card>
                );
              })
            )}
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
                  </Button>
                ) : null}
              </div>
            ) : null}
            {podeControlarSessao ? renderCardsSessao() : null}

            <SessionPanel
              title="Painel da sessao"
              subtitle="Cena, status de combate e ordem de iniciativa."
            >
              <p className="text-sm text-app-muted">Cena: {labelCena(detalhe.cenaAtual.tipo)}</p>
              {detalhe.cenaAtual.nome ? (
                <p className="text-xs text-app-muted">{detalhe.cenaAtual.nome}</p>
              ) : null}
              <p className="text-xs text-app-muted">
                Status: {sessaoEncerrada ? 'Encerrada' : 'Ativa'} | Participantes online:{' '}
                {totalParticipantesOnline}/{participantes.length}
              </p>
              <p className="text-xs text-app-muted">Aliados ou ameacas na cena: {npcs.length}</p>

              {detalhe.controleTurnosAtivo ? (
                <div className="session-box space-y-1">
                  <p className="text-sm text-app-fg">Rodada: {detalhe.rodadaAtual ?? 1}</p>
                  <p className="text-sm text-app-fg">
                    Turno atual:{' '}
                    {turnoAtualLabel ?? 'Sem turno definido'}
                  </p>
                  <p className="text-xs text-app-muted">
                    Ordem de iniciativa: {iniciativaOrdem.length} participante(s)
                  </p>
                  <p className="text-[11px] text-app-muted">
                    Regra: ao mover na ordem, a INI fica 1 ponto acima/abaixo do vizinho.
                  </p>
                  {iniciativaOrdem.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {iniciativaOrdem.map((participante, indice) => {
                        const emTurno = iniciativaIndiceAtual === indice;
                        const primeiro = indice === 0;
                        const ultimo = indice === iniciativaOrdem.length - 1;
                        const podeArrastar =
                          podeControlarSessao && !sessaoEncerrada && !reordenandoIniciativa;
                        const hoverAtivo =
                          indiceIniciativaHover === indice &&
                          indiceIniciativaArrastado !== null &&
                          indiceIniciativaArrastado !== indice;

                        return (
                          <div
                            key={`${participante.tipoParticipante}-${participante.personagemSessaoId ?? participante.npcSessaoId ?? indice}`}
                            draggable={podeArrastar}
                            onDragStart={(event: DragEvent<HTMLDivElement>) => {
                              if (!podeArrastar) return;
                              setIndiceIniciativaArrastado(indice);
                              setIndiceIniciativaHover(indice);
                              event.dataTransfer.effectAllowed = 'move';
                              event.dataTransfer.setData('text/plain', String(indice));
                            }}
                            onDragOver={(event: DragEvent<HTMLDivElement>) => {
                              if (!podeArrastar) return;
                              event.preventDefault();
                              if (indiceIniciativaHover !== indice) {
                                setIndiceIniciativaHover(indice);
                              }
                              event.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(event: DragEvent<HTMLDivElement>) => {
                              if (!podeArrastar) return;
                              event.preventDefault();
                              void handleDropIniciativa(indice);
                            }}
                            onDragEnd={() => {
                              setIndiceIniciativaArrastado(null);
                              setIndiceIniciativaHover(null);
                            }}
                            className={
                              emTurno
                                ? hoverAtivo
                                  ? 'flex items-center justify-between gap-2 rounded border border-cyan-400 bg-cyan-500/10 px-2 py-1.5'
                                  : 'flex items-center justify-between gap-2 rounded border border-emerald-500/50 bg-emerald-500/10 px-2 py-1.5'
                                : hoverAtivo
                                  ? 'flex items-center justify-between gap-2 rounded border border-cyan-400 bg-cyan-500/10 px-2 py-1.5'
                                  : 'flex items-center justify-between gap-2 rounded border border-app-border bg-app-surface px-2 py-1.5'
                            }
                          >
                            <p className="text-xs text-app-fg">
                              <span className="font-semibold mr-1">#{indice + 1}</span>
                              {labelParticipanteIniciativa(participante)}
                              <span className="ml-2 text-app-muted">
                                INI {participante.valorIniciativa}
                              </span>
                            </p>
                            {podeControlarSessao ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => void handleMoverIniciativa(indice, 'SUBIR')}
                                  disabled={sessaoEncerrada || reordenandoIniciativa || primeiro}
                                >
                                  <Icon name="chevron-up" className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => void handleMoverIniciativa(indice, 'DESCER')}
                                  disabled={sessaoEncerrada || reordenandoIniciativa || ultimo}
                                >
                                  <Icon name="chevron-down" className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-app-muted">
                  Cena livre: sem contagem de rodadas/turnos.
                </p>
              )}
            </SessionPanel>

            {podeControlarSessao ? (
              <SessionPanel
                title="Controle do mestre"
                subtitle="Ajustes de cena, turnos e encerramento da sessao."
              >
                <Select
                  label="Tipo de cena"
                  value={cenaTipo}
                  onChange={(event) =>
                    setCenaTipo(event.target.value as TipoCenaSessaoCampanha)
                  }
                  options={OPCOES_CENA}
                  disabled={sessaoEncerrada}
                />
                <Input
                  label="Nome da cena (opcional)"
                  value={cenaNome}
                  onChange={(event) => setCenaNome(event.target.value)}
                  maxLength={120}
                  disabled={sessaoEncerrada}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => void handleAtualizarCena()}
                    disabled={atualizandoCena || sessaoEncerrada}
                  >
                    {atualizandoCena ? 'Atualizando...' : 'Atualizar cena'}
                  </Button>
                  {detalhe.controleTurnosAtivo ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => void handleControleTurno('VOLTAR')}
                        disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                      >
                        {acaoTurnoPendente === 'VOLTAR'
                          ? 'Voltando...'
                          : 'Voltar turno'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void handleControleTurno('PULAR')}
                        disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                      >
                        {acaoTurnoPendente === 'PULAR'
                          ? 'Pulando...'
                          : 'Pular turno'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void handleControleTurno('AVANCAR')}
                        disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
                      >
                        {acaoTurnoPendente === 'AVANCAR'
                          ? 'Avancando...'
                          : 'Avancar turno'}
                      </Button>
                    </>
                  ) : null}
                  <Button
                    variant="secondary"
                    onClick={() => void handleEncerrarSessao()}
                    disabled={encerrandoSessao || sessaoEncerrada}
                  >
                    {encerrandoSessao
                      ? 'Encerrando...'
                      : sessaoEncerrada
                        ? 'Sessao encerrada'
                        : 'Encerrar sessao'}
                  </Button>
                </div>
                {detalhe.controleTurnosAtivo ? (
                  <p className="text-xs text-app-muted">
                    Atalhos: <span className="font-semibold">.</span> avancar |{' '}
                    <span className="font-semibold">Shift + ,</span> voltar |{' '}
                    <span className="font-semibold">Shift + /</span> pular.
                  </p>
                ) : null}
              </SessionPanel>
            ) : (
              <SessionPanel
                title="Controle da sessao"
                subtitle="Apenas o mestre pode trocar cena e controlar turnos."
              >
                <p className="text-sm text-app-muted">
                  Apenas o mestre pode trocar cena e controlar turnos.
                </p>
              </SessionPanel>
            )}
          </section>

          {!colunaDireitaRecolhida ? (
            <section className="space-y-3 xl:sticky xl:top-4 xl:self-start">
            <div className="flex justify-start">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setColunaDireitaRecolhida(true)}
                title="Ocultar painel direito"
              >
                <Icon name="chevron-right" className="h-3.5 w-3.5" />
              </Button>
            </div>
            <SessionPanel
              title="Participantes"
              subtitle="Quem esta na campanha e quem esta online agora."
              right={
                <Badge color={socketConectado ? 'cyan' : 'yellow'} size="sm">
                  {socketConectado ? 'Tempo real' : 'Fallback polling'}
                </Badge>
              }
            >
              {participantes.length === 0 ? (
                <p className="text-xs text-app-muted">
                  Nenhum participante carregado para esta campanha.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {participantes.map((participante) => {
                    const online = onlineSet.has(participante.usuarioId);

                    return (
                      <div
                        key={participante.usuarioId}
                        className="flex items-center justify-between rounded border border-app-border bg-app-surface px-2 py-1.5"
                      >
                        <div>
                          <p className="text-xs font-semibold text-app-fg">
                            {textoSeguro(participante.apelido)}
                            {participante.ehDono ? ' (Dono)' : ''}
                          </p>
                          <p className="text-[11px] text-app-muted">
                            {labelPapelParticipante(participante.papel)}
                          </p>
                        </div>
                        <span
                          className={
                            online
                              ? 'text-[11px] font-medium text-emerald-300'
                              : 'text-[11px] font-medium text-app-muted'
                          }
                        >
                          {online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </SessionPanel>

            <SessionPanel
              title="Timeline da sessao"
              subtitle={`${eventosSessao.length} evento(s) operacionais`}
            >

              <div className="max-h-[320px] overflow-y-auto rounded border border-app-border p-2 space-y-2">
                {eventosSessao.length === 0 ? (
                  <p className="text-xs text-app-muted">
                    Nenhum evento operacional registrado ainda.
                  </p>
                ) : (
                  eventosSessao.map((evento) => (
                    <div
                      key={evento.id}
                      className="rounded border border-app-border bg-app-surface px-2 py-2 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-app-fg">
                          {textoSeguro(evento.descricao)}
                        </p>
                        {evento.desfeito ? (
                          <span className="text-[10px] rounded border border-app-border px-1.5 py-0.5 text-app-muted">
                            Desfeito
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-app-muted">
                        {textoSeguro(evento.tipoEvento)}
                        {typeof evento.cenaId === 'number' ? ` | Cena #${evento.cenaId}` : ''}
                      </p>
                      <p className="text-[11px] text-app-muted">
                        {formatarDataHora(evento.criadoEm)}
                        {evento.autor?.apelido ? ` por ${textoSeguro(evento.autor.apelido)}` : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEventoDetalheModal(evento);
                            setMotivoDesfazerEventoModal('');
                          }}
                        >
                          Detalhes
                        </Button>
                        {podeControlarSessao && evento.podeDesfazer ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void handleDesfazerEvento(evento.id)}
                            disabled={Boolean(desfazendoEventoId) || sessaoEncerrada}
                          >
                            {desfazendoEventoId === evento.id
                              ? 'Desfazendo...'
                              : 'Desfazer evento'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SessionPanel>

            <SessionPanel
              title="Chat em tempo real"
              subtitle="Mensagens sincronizadas da sessao ativa."
            >
              <div className="h-[420px] overflow-y-auto rounded border border-app-border p-3 space-y-2 bg-app-bg">
                {chat.length === 0 ? (
                  <p className="text-xs text-app-muted">
                    Nenhuma mensagem ainda. Inicie a conversa da sessao.
                  </p>
                ) : (
                  chat.map((item) => (
                    <div key={item.id} className="rounded border border-app-border bg-app-surface px-2 py-1.5">
                      <p className="text-xs text-app-muted">
                        {textoSeguro(item.autor.apelido)}
                        {item.autor.personagemNome
                          ? ` (${textoSeguro(item.autor.personagemNome)})`
                          : ''}{' '}
                        | {formatarDataHora(item.criadoEm)}
                      </p>
                      <p className="text-sm text-app-fg whitespace-pre-wrap">{textoSeguro(item.mensagem)}</p>
                    </div>
                  ))
                )}
                <div ref={fimChatRef} />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Mensagem"
                    value={mensagem}
                    onChange={(event) => setMensagem(event.target.value)}
                    maxLength={1000}
                    disabled={sessaoEncerrada}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void handleEnviarMensagem();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => void handleEnviarMensagem()}
                  disabled={sessaoEncerrada || enviandoMensagem || !mensagem.trim()}
                >
                  {enviandoMensagem ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </SessionPanel>
            </section>
          ) : null}
        </div>

        <Modal
          isOpen={modalAdicionarNpcAberto}
          onClose={() => setModalAdicionarNpcAberto(false)}
          title="Adicionar aliado ou ameaca na cena"
          size="md"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setModalAdicionarNpcAberto(false)}
                disabled={adicionandoNpc}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => void handleAdicionarNpcNaCena()}
                disabled={
                  adicionandoNpc ||
                  sessaoEncerrada ||
                  npcsDisponiveis.length === 0 ||
                  !npcSelecionadoId
                }
              >
                {adicionandoNpc ? 'Adicionando...' : 'Adicionar na cena'}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <Select
              label="Ficha disponivel"
              value={npcSelecionadoId}
              onChange={(event) => setNpcSelecionadoId(event.target.value)}
            >
              {npcsDisponiveis.length === 0 ? (
                <option value="">Nenhuma ficha encontrada</option>
              ) : null}
              {npcsDisponiveis.map((npcDisponivel) => (
                <option key={npcDisponivel.id} value={String(npcDisponivel.id)}>
                  {textoSeguro(npcDisponivel.nome)} ({labelTipoNpc(npcDisponivel.tipo)})
                </option>
              ))}
            </Select>
            <Input
              label="Nome em cena (opcional)"
              value={nomeNpcCustomizado}
              onChange={(event) => setNomeNpcCustomizado(event.target.value)}
              placeholder="Ex.: Taro (ferido)"
            />
            <p className="text-xs text-app-muted">
              Dica: use o nome em cena para diferenciar aliados ou ameacas iguais na mesma rodada.
            </p>
          </div>
        </Modal>

        <Modal
          isOpen={Boolean(modalCondicoesAberto)}
          onClose={() => {
            setModalCondicoesAberto(null);
            setBuscaCondicoesModal('');
          }}
          title={
            modalCondicoesAberto
              ? `Gerenciar condicoes | ${textoSeguro(modalCondicoesAberto.nomeAlvo)}`
              : 'Gerenciar condicoes'
          }
          size="xl"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setModalCondicoesAberto(null);
                  setBuscaCondicoesModal('');
                }}
              >
                Fechar
              </Button>
              <Button
                onClick={() =>
                  modalCondicoesAberto
                    ? void handleAplicarCondicao(
                        modalCondicoesAberto.alvoTipo,
                        modalCondicoesAberto.alvoId,
                      )
                    : undefined
                }
                disabled={
                  !modalCondicoesAberto ||
                  sessaoEncerrada ||
                  !formCondicaoModal.condicaoId ||
                  acaoCondicaoPendente ===
                    (modalCondicoesAberto
                      ? chaveAcaoAplicarCondicao(
                          modalCondicoesAberto.alvoTipo,
                          modalCondicoesAberto.alvoId,
                        )
                      : null)
                }
              >
                {modalCondicoesAberto &&
                acaoCondicaoPendente ===
                  chaveAcaoAplicarCondicao(
                    modalCondicoesAberto.alvoTipo,
                    modalCondicoesAberto.alvoId,
                  )
                  ? 'Aplicando...'
                  : 'Aplicar condicao'}
              </Button>
            </>
          }
        >
          {modalCondicoesAberto ? (
            <div className="grid gap-3 md:grid-cols-[1.25fr_1fr]">
              <div className="space-y-3">
                <Input
                  label="Buscar condicao"
                  value={buscaCondicoesModal}
                  onChange={(event) => setBuscaCondicoesModal(event.target.value)}
                  placeholder="Ex.: Sangrando, Enredado..."
                  icon="search"
                />
                <div className="max-h-[340px] overflow-y-auto rounded border border-app-border bg-app-bg p-2 space-y-1.5">
                  {condicoesFiltradasModal.length === 0 ? (
                    <p className="text-xs text-app-muted">
                      Nenhuma condicao encontrada para essa busca.
                    </p>
                  ) : (
                    condicoesFiltradasModal.map((condicao) => {
                      const selecionada =
                        formCondicaoModal.condicaoId === String(condicao.id);
                      return (
                        <button
                          key={condicao.id}
                          type="button"
                          onClick={() =>
                            atualizarCampoFormCondicao(
                              modalCondicoesAberto.alvoTipo,
                              modalCondicoesAberto.alvoId,
                              'condicaoId',
                              String(condicao.id),
                            )
                          }
                          className={
                            selecionada
                              ? 'w-full rounded border border-cyan-400 bg-cyan-500/10 px-2 py-1.5 text-left'
                              : 'w-full rounded border border-app-border bg-app-surface px-2 py-1.5 text-left hover:border-cyan-400/50'
                          }
                        >
                          <p className="text-xs font-semibold text-app-fg">
                            {textoSeguro(condicao.nome)}
                          </p>
                          <p className="text-[11px] text-app-muted line-clamp-2">
                            {textoSeguro(condicao.descricao)}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded border border-app-border bg-app-bg p-2 space-y-2">
                  <p className="text-xs font-semibold text-app-fg">
                    Parametros de aplicacao
                  </p>
                  <Select
                    label="Modo de duracao"
                    value={formCondicaoModal.duracaoModo}
                    onChange={(event) =>
                      atualizarCampoFormCondicao(
                        modalCondicoesAberto.alvoTipo,
                        modalCondicoesAberto.alvoId,
                        'duracaoModo',
                        event.target.value,
                      )
                    }
                    options={OPCOES_DURACAO_CONDICAO}
                  />
                  <Input
                    label="Duracao (numero)"
                    type="number"
                    min={1}
                    value={formCondicaoModal.duracaoValor}
                    onChange={(event) =>
                      atualizarCampoFormCondicao(
                        modalCondicoesAberto.alvoTipo,
                        modalCondicoesAberto.alvoId,
                        'duracaoValor',
                        event.target.value,
                      )
                    }
                    disabled={campoDuracaoCondicaoModalDesabilitado}
                  />
                  <Input
                    label="Origem (opcional)"
                    value={formCondicaoModal.origemDescricao}
                    onChange={(event) =>
                      atualizarCampoFormCondicao(
                        modalCondicoesAberto.alvoTipo,
                        modalCondicoesAberto.alvoId,
                        'origemDescricao',
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Tecnica inata, armadilha..."
                  />
                  <Input
                    label="Observacao (opcional)"
                    value={formCondicaoModal.observacao}
                    onChange={(event) =>
                      atualizarCampoFormCondicao(
                        modalCondicoesAberto.alvoTipo,
                        modalCondicoesAberto.alvoId,
                        'observacao',
                        event.target.value,
                      )
                    }
                    placeholder="Detalhe livre para lembrar contexto"
                  />
                </div>

                <div className="rounded border border-app-border bg-app-bg p-2 space-y-2">
                  <Input
                    label="Motivo para remocao (opcional)"
                    value={formCondicaoModal.motivoRemocao}
                    onChange={(event) =>
                      atualizarCampoFormCondicao(
                        modalCondicoesAberto.alvoTipo,
                        modalCondicoesAberto.alvoId,
                        'motivoRemocao',
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Curado, efeito encerrado..."
                  />
                  <p className="text-[11px] text-app-muted">
                    Condicoes ativas neste alvo ({condicoesAtivasModal.length})
                  </p>
                  <div className="max-h-[220px] overflow-y-auto space-y-1.5">
                    {condicoesAtivasModal.length === 0 ? (
                      <p className="text-xs text-app-muted">
                        Nenhuma condicao ativa no momento.
                      </p>
                    ) : (
                      condicoesAtivasModal.map((condicao) => {
                        const chaveRemover = chaveAcaoRemoverCondicao(condicao.id);
                        return (
                          <div
                            key={`modal-condicao-ativa-${condicao.id}`}
                            className="rounded border border-app-border bg-app-surface px-2 py-1.5 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-app-fg">
                                {textoSeguro(condicao.nome)}
                              </p>
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() =>
                                  void handleRemoverCondicao(
                                    modalCondicoesAberto.alvoTipo,
                                    modalCondicoesAberto.alvoId,
                                    condicao.id,
                                  )
                                }
                                disabled={
                                  sessaoEncerrada ||
                                  acaoCondicaoPendente === chaveRemover
                                }
                              >
                                {acaoCondicaoPendente === chaveRemover
                                  ? 'Removendo...'
                                  : 'Remover'}
                              </Button>
                            </div>
                            <p className="text-[11px] text-app-muted">
                              {descreverDuracaoCondicao(
                                condicao.duracaoModo,
                                condicao.duracaoValor,
                                condicao.restanteDuracao,
                              )}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={Boolean(eventoDetalheModal)}
          onClose={() => {
            setEventoDetalheModal(null);
            setMotivoDesfazerEventoModal('');
          }}
          title="Detalhes do evento da sessao"
          size="lg"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setEventoDetalheModal(null);
                  setMotivoDesfazerEventoModal('');
                }}
              >
                Fechar
              </Button>
              {eventoDetalheModal && podeControlarSessao && eventoDetalheModal.podeDesfazer ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    void handleDesfazerEvento(
                      eventoDetalheModal.id,
                      motivoDesfazerEventoModal,
                    )
                  }
                  disabled={sessaoEncerrada || Boolean(desfazendoEventoId)}
                >
                  {desfazendoEventoId === eventoDetalheModal.id
                    ? 'Desfazendo...'
                    : 'Desfazer evento'}
                </Button>
              ) : null}
            </>
          }
        >
          {eventoDetalheModal ? (
            <div className="space-y-3">
              <div className="rounded border border-app-border bg-app-bg p-2 space-y-1">
                <p className="text-xs font-semibold text-app-fg">
                  {textoSeguro(eventoDetalheModal.descricao)}
                </p>
                <p className="text-[11px] text-app-muted">
                  Tipo: {textoSeguro(eventoDetalheModal.tipoEvento)}
                  {typeof eventoDetalheModal.cenaId === 'number'
                    ? ` | Cena #${eventoDetalheModal.cenaId}`
                    : ''}
                </p>
                <p className="text-[11px] text-app-muted">
                  {formatarDataHora(eventoDetalheModal.criadoEm)}
                  {eventoDetalheModal.autor?.apelido
                    ? ` por ${textoSeguro(eventoDetalheModal.autor.apelido)}`
                    : ''}
                </p>
                {eventoDetalheModal.desfeito ? (
                  <p className="text-[11px] text-app-muted">
                    Evento marcado como desfeito.
                  </p>
                ) : null}
              </div>

              {podeControlarSessao && eventoDetalheModal.podeDesfazer ? (
                <Input
                  label="Motivo para desfazer (opcional)"
                  value={motivoDesfazerEventoModal}
                  onChange={(event) => setMotivoDesfazerEventoModal(event.target.value)}
                  placeholder="Ex.: acao aplicada por engano"
                  disabled={sessaoEncerrada || Boolean(desfazendoEventoId)}
                />
              ) : null}

              <div className="rounded border border-app-border bg-app-bg p-2 space-y-2">
                <p className="text-xs font-semibold text-app-fg">Dados brutos</p>
                <pre className="max-h-[320px] overflow-auto rounded border border-app-border bg-app-surface p-2 text-[11px] text-app-muted whitespace-pre-wrap break-words">
                  {dadosEventoDetalheModal}
                </pre>
              </div>
            </div>
          ) : null}
        </Modal>

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
      </div>
    </main>
  );
}

