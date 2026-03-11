'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  apiAdicionarNpcSessaoCampanha,
  apiAtualizarCenaSessaoCampanha,
  apiAtualizarNpcSessaoCampanha,
  apiAtualizarRecursosPersonagemCampanha,
  apiAvancarTurnoSessaoCampanha,
  apiDesfazerEventoSessaoCampanha,
  apiEncerrarSessaoCampanha,
  apiEnviarMensagemChatSessaoCampanha,
  apiGetSessaoCampanha,
  apiGetMeusNpcsAmeacas,
  apiListarChatSessaoCampanha,
  apiListarEventosSessaoCampanha,
  apiRemoverNpcSessaoCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  EventoSessaoTimeline,
  MensagemChatSessao,
  NpcAmeacaResumo,
  NpcSessaoCampanha,
  PersonagemCampanhaResumo,
  SessaoCampanhaDetalhe,
  TipoCenaSessaoCampanha,
} from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { CampaignCharacterEditorModal } from '@/components/campanha/CampaignCharacterEditorModal';
import { MestreShieldGuide } from '@/components/campanha/MestreShieldGuide';
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

type RecursosEditaveis = {
  pvAtual: string;
  peAtual: string;
  eaAtual: string;
  sanAtual: string;
};

type NpcEditavel = {
  vd: string;
  defesa: string;
  pontosVidaAtual: string;
  pontosVidaMax: string;
  deslocamentoMetros: string;
  notasCena: string;
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
  const [edicaoRecursos, setEdicaoRecursos] = useState<
    Record<number, RecursosEditaveis>
  >({});
  const [edicaoNpcs, setEdicaoNpcs] = useState<Record<number, NpcEditavel>>({});
  const [npcsDisponiveis, setNpcsDisponiveis] = useState<NpcAmeacaResumo[]>([]);
  const [npcSelecionadoId, setNpcSelecionadoId] = useState('');
  const [nomeNpcCustomizado, setNomeNpcCustomizado] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [atualizandoCena, setAtualizandoCena] = useState(false);
  const [avancandoTurno, setAvancandoTurno] = useState(false);
  const [encerrandoSessao, setEncerrandoSessao] = useState(false);
  const [salvandoCardId, setSalvandoCardId] = useState<number | null>(null);
  const [adicionandoNpc, setAdicionandoNpc] = useState(false);
  const [salvandoNpcId, setSalvandoNpcId] = useState<number | null>(null);
  const [removendoNpcId, setRemovendoNpcId] = useState<number | null>(null);
  const [desfazendoEventoId, setDesfazendoEventoId] = useState<number | null>(null);
  const [motivoDesfazerEvento, setMotivoDesfazerEvento] = useState('');
  const [socketConectado, setSocketConectado] = useState(false);
  const [onlineUsuarioIds, setOnlineUsuarioIds] = useState<number[]>([]);
  const [personagemEmEdicao, setPersonagemEmEdicao] = useState<
    Pick<PersonagemCampanhaResumo, 'id' | 'nome' | 'recursos'> | null
  >(null);

  const chatRef = useRef<MensagemChatSessao[]>([]);
  const fimChatRef = useRef<HTMLDivElement | null>(null);
  const sincronizandoTempoRealRef = useRef(false);

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    fimChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const sincronizarEstadosDerivados = useCallback(
    (proximoDetalhe: SessaoCampanhaDetalhe) => {
      setCenaTipo(proximoDetalhe.cenaAtual.tipo as TipoCenaSessaoCampanha);
      setCenaNome(proximoDetalhe.cenaAtual.nome ?? '');

      setEdicaoRecursos((estadoAtual) => {
        const proximoEstado = { ...estadoAtual };
        for (const card of proximoDetalhe.cards) {
          if (!card.recursos || !card.podeEditar) continue;
          proximoEstado[card.personagemCampanhaId] = {
            pvAtual: String(card.recursos.pvAtual),
            peAtual: String(card.recursos.peAtual),
            eaAtual: String(card.recursos.eaAtual),
            sanAtual: String(card.recursos.sanAtual),
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
  const onlineSet = useMemo(() => new Set(onlineUsuarioIds), [onlineUsuarioIds]);

  const tituloSessao = useMemo(() => {
    if (!detalhe) return 'Sessao da campanha';
    return detalhe.titulo;
  }, [detalhe]);
  const totalParticipantesOnline = useMemo(
    () => participantes.filter((participante) => onlineSet.has(participante.usuarioId)).length,
    [onlineSet, participantes],
  );

  const renderCardsSessao = () => (
    <>
      <Card className="space-y-2">
        <h2 className="text-sm font-semibold text-app-fg">Personagens da sessao</h2>
        <p className="text-xs text-app-muted">
          Jogadores editam apenas sua ficha. O mestre pode editar todas.
        </p>
      </Card>

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
          const draft = edicaoRecursos[card.personagemCampanhaId];

          return (
            <Card key={card.personagemSessaoId} className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-app-fg">{card.nomePersonagem}</h3>
                <p className="text-xs text-app-muted">Jogador: {card.nomeJogador}</p>
              </div>

              {recursos ? (
                card.podeEditar ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label={`PV (max ${recursos.pvMax})`}
                        type="number"
                        value={draft?.pvAtual ?? String(recursos.pvAtual)}
                        onChange={(event) =>
                          setEdicaoRecursos((anterior) => ({
                            ...anterior,
                            [card.personagemCampanhaId]: {
                              ...(anterior[card.personagemCampanhaId] ?? {
                                pvAtual: String(recursos.pvAtual),
                                peAtual: String(recursos.peAtual),
                                eaAtual: String(recursos.eaAtual),
                                sanAtual: String(recursos.sanAtual),
                              }),
                              pvAtual: event.target.value,
                            },
                          }))
                        }
                      />
                      <Input
                        label={`PE (max ${recursos.peMax})`}
                        type="number"
                        value={draft?.peAtual ?? String(recursos.peAtual)}
                        onChange={(event) =>
                          setEdicaoRecursos((anterior) => ({
                            ...anterior,
                            [card.personagemCampanhaId]: {
                              ...(anterior[card.personagemCampanhaId] ?? {
                                pvAtual: String(recursos.pvAtual),
                                peAtual: String(recursos.peAtual),
                                eaAtual: String(recursos.eaAtual),
                                sanAtual: String(recursos.sanAtual),
                              }),
                              peAtual: event.target.value,
                            },
                          }))
                        }
                      />
                      <Input
                        label={`EA (max ${recursos.eaMax})`}
                        type="number"
                        value={draft?.eaAtual ?? String(recursos.eaAtual)}
                        onChange={(event) =>
                          setEdicaoRecursos((anterior) => ({
                            ...anterior,
                            [card.personagemCampanhaId]: {
                              ...(anterior[card.personagemCampanhaId] ?? {
                                pvAtual: String(recursos.pvAtual),
                                peAtual: String(recursos.peAtual),
                                eaAtual: String(recursos.eaAtual),
                                sanAtual: String(recursos.sanAtual),
                              }),
                              eaAtual: event.target.value,
                            },
                          }))
                        }
                      />
                      <Input
                        label={`SAN (max ${recursos.sanMax})`}
                        type="number"
                        value={draft?.sanAtual ?? String(recursos.sanAtual)}
                        onChange={(event) =>
                          setEdicaoRecursos((anterior) => ({
                            ...anterior,
                            [card.personagemCampanhaId]: {
                              ...(anterior[card.personagemCampanhaId] ?? {
                                pvAtual: String(recursos.pvAtual),
                                peAtual: String(recursos.peAtual),
                                eaAtual: String(recursos.eaAtual),
                                sanAtual: String(recursos.sanAtual),
                              }),
                              sanAtual: event.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => void handleSalvarCard(card.personagemCampanhaId)}
                        disabled={
                          sessaoEncerrada || salvandoCardId === card.personagemCampanhaId
                        }
                      >
                        {salvandoCardId === card.personagemCampanhaId
                          ? 'Salvando...'
                          : 'Salvar recursos'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAbrirEdicaoPersonagem(card)}
                        disabled={sessaoEncerrada || !card.recursos}
                      >
                        Ajustes narrativos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-app-muted">
                    PV {recursos.pvAtual}/{recursos.pvMax} | PE {recursos.peAtual}/
                    {recursos.peMax} | EA {recursos.eaAtual}/{recursos.eaMax} | SAN{' '}
                    {recursos.sanAtual}/{recursos.sanMax}
                  </p>
                )
              ) : (
                <p className="text-xs text-app-muted">
                  Visao resumida: apenas nome do jogador e personagem.
                </p>
              )}

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

  async function handleAvancarTurno() {
    if (!detalhe) return;

    setAvancandoTurno(true);
    setErro(null);
    try {
      const atualizado = await apiAvancarTurnoSessaoCampanha(campanhaId, sessaoId);
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAvancandoTurno(false);
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

  async function handleSalvarCard(personagemCampanhaId: number) {
    if (!detalhe) return;
    const card = detalhe.cards.find(
      (item) => item.personagemCampanhaId === personagemCampanhaId,
    );
    const draft = edicaoRecursos[personagemCampanhaId];
    if (!card?.recursos || !draft) return;

    setSalvandoCardId(personagemCampanhaId);
    setErro(null);
    try {
      await apiAtualizarRecursosPersonagemCampanha(campanhaId, personagemCampanhaId, {
        pvAtual: parseRecurso(draft.pvAtual, card.recursos.pvAtual),
        peAtual: parseRecurso(draft.peAtual, card.recursos.peAtual),
        eaAtual: parseRecurso(draft.eaAtual, card.recursos.eaAtual),
        sanAtual: parseRecurso(draft.sanAtual, card.recursos.sanAtual),
      });
      const atualizado = await apiGetSessaoCampanha(campanhaId, sessaoId);
      setDetalhe(atualizado);
      sincronizarEstadosDerivados(atualizado);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvandoCardId(null);
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

    setEdicaoRecursos((anterior) => ({
      ...anterior,
      [personagem.id]: {
        pvAtual: String(personagem.recursos.pvAtual),
        peAtual: String(personagem.recursos.peAtual),
        eaAtual: String(personagem.recursos.eaAtual),
        sanAtual: String(personagem.recursos.sanAtual),
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

  async function handleDesfazerEvento(eventoId: number) {
    if (!idsValidos || !usuario) return;

    setDesfazendoEventoId(eventoId);
    setErro(null);
    try {
      const [detalheAtualizada, eventosAtualizados] = await Promise.all([
        apiDesfazerEventoSessaoCampanha(campanhaId, sessaoId, eventoId, {
          motivo: motivoDesfazerEvento.trim() || undefined,
        }),
        apiListarEventosSessaoCampanha(campanhaId, sessaoId, {
          limit: 80,
          incluirChat: false,
        }),
      ]);

      setDetalhe(detalheAtualizada);
      sincronizarEstadosDerivados(detalheAtualizada);
      setEventosSessao(eventosAtualizados);
      setMotivoDesfazerEvento('');
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
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-app-fg">{tituloSessao}</h1>
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
          <Button variant="ghost" onClick={() => router.push(`/campanhas/${campanhaId}`)}>
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar para campanha
          </Button>
        </header>

        {erro ? <ErrorAlert message={erro} /> : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="space-y-3">
            {podeControlarSessao ? (
              <Card className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-app-fg">
                      Escudo do Mestre
                    </h2>
                    <p className="text-xs text-app-muted">
                      Guias rapidos com regras operacionais da mesa.
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full border border-app-border bg-app-surface p-2">
                    <Icon name="shield" className="h-4 w-4 text-app-fg" />
                  </span>
                </div>
                <MestreShieldGuide />
              </Card>
            ) : (
              renderCardsSessao()
            )}

            <Card className="space-y-2">
              <h2 className="text-sm font-semibold text-app-fg">
                Aliados ou ameacas na cena
              </h2>
              <p className="text-xs text-app-muted">
                Mestre adiciona e ajusta aliados ou ameacas por cena. Jogadores veem em modo leitura.
              </p>
            </Card>

            {podeControlarSessao ? (
              <Card className="space-y-2">
                <h3 className="text-sm font-semibold text-app-fg">Adicionar aliado ou ameaca</h3>
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
                      {npcDisponivel.nome} ({labelTipoNpc(npcDisponivel.tipo)})
                    </option>
                  ))}
                </Select>
                <Input
                  label="Nome em cena (opcional)"
                  value={nomeNpcCustomizado}
                  onChange={(event) => setNomeNpcCustomizado(event.target.value)}
                  placeholder="Ex.: Taro (ferido)"
                />
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
              </Card>
            ) : null}

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
                  <Card key={npc.npcSessaoId} className="space-y-3">
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

          <section className="space-y-3">
            {podeControlarSessao ? renderCardsSessao() : null}

            <Card className="space-y-3">
              <h2 className="text-sm font-semibold text-app-fg">Painel da sessao</h2>
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
                <div className="rounded border border-app-border p-3 space-y-1">
                  <p className="text-sm text-app-fg">Rodada: {detalhe.rodadaAtual ?? 1}</p>
                  <p className="text-sm text-app-fg">
                    Turno atual:{' '}
                    {detalhe.turnoAtual
                      ? `${detalhe.turnoAtual.nomePersonagem} (${detalhe.turnoAtual.nomeJogador})`
                      : 'Sem turno definido'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-app-muted">
                  Cena livre: sem contagem de rodadas/turnos.
                </p>
              )}
            </Card>

            {podeControlarSessao ? (
              <Card className="space-y-3">
                <h3 className="text-sm font-semibold text-app-fg">
                  Controle do mestre
                </h3>
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
                    <Button
                      variant="secondary"
                      onClick={() => void handleAvancarTurno()}
                      disabled={avancandoTurno || sessaoEncerrada}
                    >
                      {avancandoTurno ? 'Avancando...' : 'Avancar turno'}
                    </Button>
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
              </Card>
            ) : (
              <Card className="space-y-2">
                <h3 className="text-sm font-semibold text-app-fg">
                  Controle da sessao
                </h3>
                <p className="text-sm text-app-muted">
                  Apenas o mestre pode trocar cena e controlar turnos.
                </p>
              </Card>
            )}
          </section>

          <section className="space-y-3">
            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-app-fg">Participantes</h2>
                <span
                  className={
                    socketConectado
                      ? 'inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300'
                      : 'inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'
                  }
                >
                  {socketConectado ? 'Tempo real' : 'Fallback (polling)'}
                </span>
              </div>
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
                            {participante.apelido}
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
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-app-fg">Timeline da sessao</h2>
                <span className="text-[11px] text-app-muted">
                  {eventosSessao.length} evento(s)
                </span>
              </div>

              {podeControlarSessao ? (
                <Input
                  label="Motivo para desfazer (opcional)"
                  value={motivoDesfazerEvento}
                  onChange={(event) => setMotivoDesfazerEvento(event.target.value)}
                  maxLength={240}
                  placeholder="Ex.: acao registrada por engano"
                  disabled={Boolean(desfazendoEventoId) || sessaoEncerrada}
                />
              ) : null}

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
                          {evento.descricao}
                        </p>
                        {evento.desfeito ? (
                          <span className="text-[10px] rounded border border-app-border px-1.5 py-0.5 text-app-muted">
                            Desfeito
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-app-muted">
                        {evento.tipoEvento}
                        {typeof evento.cenaId === 'number' ? ` | Cena #${evento.cenaId}` : ''}
                      </p>
                      <p className="text-[11px] text-app-muted">
                        {formatarDataHora(evento.criadoEm)}
                        {evento.autor?.apelido ? ` por ${evento.autor.apelido}` : ''}
                      </p>
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
                  ))
                )}
              </div>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-sm font-semibold text-app-fg">Chat em tempo real</h2>
              <div className="h-[420px] overflow-y-auto rounded border border-app-border p-3 space-y-2 bg-app-bg">
                {chat.length === 0 ? (
                  <p className="text-xs text-app-muted">
                    Nenhuma mensagem ainda. Inicie a conversa da sessao.
                  </p>
                ) : (
                  chat.map((item) => (
                    <div key={item.id} className="rounded border border-app-border bg-app-surface px-2 py-1.5">
                      <p className="text-xs text-app-muted">
                        {item.autor.apelido}
                        {item.autor.personagemNome
                          ? ` (${item.autor.personagemNome})`
                          : ''}{' '}
                        | {formatarDataHora(item.criadoEm)}
                      </p>
                      <p className="text-sm text-app-fg whitespace-pre-wrap">{item.mensagem}</p>
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
            </Card>
          </section>
        </div>

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

