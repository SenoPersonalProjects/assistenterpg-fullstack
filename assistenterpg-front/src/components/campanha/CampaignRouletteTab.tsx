'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiCancelarSorteioRoletaCampanha,
  apiEscolherRoletaCampanha,
  apiGirarRoletaCampanha,
  apiHistoricoRoletaCampanha,
  apiIniciarSorteioRoletaCampanha,
  apiObterRoletaCampanha,
  apiSalvarPermissaoRoletaCampanha,
  apiSalvarPresetRoletaCampanha,
  apiTerceiroGiroRoletaCampanha,
  criarClientRequestIdRoleta,
  type CampanhaRoletaEstado,
  type CampanhaRoletaGiro,
  type CampanhaRoletaHistorico,
  type CampanhaRoletaHistoricoItem,
  type CampanhaRoletaSlot,
  type CampanhaRoletaSorteio,
} from '@/lib/api/campanha-roleta';
import { useCampanhaRoletaRealtime } from '@/hooks/useCampanhaRoletaRealtime';
import { useConfirm } from '@/hooks/useConfirm';
import type { EventoCampanhaRoletaGiro } from '@/lib/realtime/campanha-socket';
import {
  historicoCompativelComPresetRoleta,
  montarResumoConfigRoleta,
  removerEstadoPorSlotRoleta,
} from '@/lib/campanhas/campaign-roulette.helpers';
import { CampaignRouletteConfigModal } from './CampaignRouletteConfigModal';
import {
  CampaignRouletteHistoryCard,
  CampaignRouletteHistoryModal,
} from './CampaignRouletteHistoryCard';
import { VerticalCampaignRoulette } from './VerticalCampaignRoulette';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const PRESETS: Array<{ slot: CampanhaRoletaSlot; label: string; descricao: string }> = [
  { slot: 'CLA', label: 'Clã', descricao: 'Sorteie um clã com chance adicional opcional.' },
  { slot: 'TECNICA', label: 'Técnica', descricao: 'Gere duas opções e escolha uma delas.' },
  { slot: 'CUSTOMIZADO', label: 'Personalizado', descricao: 'Use uma lista livre ou adapte as regras.' },
];

const ROTULOS_MODO = {
  CLA: 'Clã pela regra',
  TECNICA: 'Técnica pela regra',
  SIMPLES: 'Roleta simples',
} as const;

const ROTULOS_STATUS = {
  AGUARDANDO_GIRO_1: 'Pronto para girar',
  AGUARDANDO_GIRO_2: 'Aguardando segunda opção',
  AGUARDANDO_ESCOLHA: 'Escolha uma das opções',
  FINALIZADO: 'Sorteio concluído',
  CANCELADO: 'Sorteio cancelado',
} as const;

type VisualizacaoRoleta = {
  sorteio: CampanhaRoletaSorteio;
  giro: CampanhaRoletaGiro['giro'] | null;
};

type ResultadoAnunciado = { animacaoId: string; nome: string };

function extrairGiro(evento: EventoCampanhaRoletaGiro): CampanhaRoletaGiro | null {
  const dados = evento.dados as Partial<CampanhaRoletaGiro> | null;
  return dados?.giro && dados.sorteio ? (dados as CampanhaRoletaGiro) : null;
}

function sorteioAindaAtivo(sorteio: CampanhaRoletaSorteio): boolean {
  return !['FINALIZADO', 'CANCELADO'].includes(sorteio.status);
}

export function CampaignRouletteTab({
  campanhaId,
  usuarioId,
}: {
  campanhaId: number;
  usuarioId: number;
}) {
  const [estado, setEstado] = useState<CampanhaRoletaEstado | null>(null);
  const [historico, setHistorico] = useState<CampanhaRoletaHistorico | null>(null);
  const [ultimosFinalizados, setUltimosFinalizados] = useState<
    Partial<Record<CampanhaRoletaSlot, CampanhaRoletaHistoricoItem>>
  >({});
  const [historicoSelecionado, setHistoricoSelecionado] =
    useState<CampanhaRoletaHistoricoItem | null>(null);
  const [visualizacoes, setVisualizacoes] = useState<
    Partial<Record<CampanhaRoletaSlot, VisualizacaoRoleta>>
  >({});
  const [resultadosAnunciados, setResultadosAnunciados] = useState<
    Partial<Record<CampanhaRoletaSlot, ResultadoAnunciado>>
  >({});
  const [animacoesEmCurso, setAnimacoesEmCurso] = useState<
    Partial<Record<CampanhaRoletaSlot, string>>
  >({});
  const [slot, setSlot] = useState<CampanhaRoletaSlot>('CLA');
  const [configurando, setConfigurando] = useState(false);
  const [alvoUsuarioId, setAlvoUsuarioId] = useState('');
  const [claSelecionado, setClaSelecionado] = useState('');
  const [claDuplicado, setClaDuplicado] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const confirmacao = useConfirm();

  const absorverHistorico = useCallback((proximo: CampanhaRoletaHistorico) => {
    setUltimosFinalizados((atuais) => {
      const resultado = { ...atuais };
      for (const item of proximo.itens) {
        if (item.status !== 'FINALIZADO') continue;
        const existente = resultado[item.slot];
        if (!existente || new Date(item.finalizadoEm ?? item.atualizadoEm) > new Date(existente.finalizadoEm ?? existente.atualizadoEm)) {
          resultado[item.slot] = item;
        }
      }
      return resultado;
    });
  }, []);

  const carregarEstado = useCallback(async () => {
    const proximo = await apiObterRoletaCampanha(campanhaId);
    setEstado(proximo);
    setVisualizacoes((atuais) => {
      const resultado = { ...atuais };
      for (const [slotAtual, visualizacao] of Object.entries(atuais) as Array<
        [CampanhaRoletaSlot, VisualizacaoRoleta | undefined]
      >) {
        if (!visualizacao) continue;
        if (
          sorteioAindaAtivo(visualizacao.sorteio) &&
          !proximo.sorteiosAtivos.some((item) => item.id === visualizacao.sorteio.id)
        ) {
          delete resultado[slotAtual];
        }
      }
      return resultado;
    });
  }, [campanhaId]);

  const carregarHistorico = useCallback(
    async (pagina = 1) => {
      const proximo = await apiHistoricoRoletaCampanha(campanhaId, pagina);
      setHistorico(proximo);
      absorverHistorico(proximo);
    },
    [absorverHistorico, campanhaId],
  );

  const sincronizar = useCallback(async () => {
    await Promise.all([carregarEstado(), carregarHistorico(historico?.pagina ?? 1)]);
  }, [carregarEstado, carregarHistorico, historico?.pagina]);

  const registrarGiro = useCallback((recebido: CampanhaRoletaGiro) => {
    setAnimacoesEmCurso((atuais) => ({
      ...atuais,
      [recebido.sorteio.slot]: recebido.giro.animacaoId,
    }));
    setVisualizacoes((atuais) => ({
      ...atuais,
      [recebido.sorteio.slot]: {
        sorteio: recebido.sorteio,
        giro: recebido.giro,
      },
    }));
  }, []);

  const receberGiro = useCallback(
    (evento: EventoCampanhaRoletaGiro) => {
      const recebido = extrairGiro(evento);
      if (recebido) registrarGiro(recebido);
    },
    [registrarGiro],
  );

  const realtimeStatus = useCampanhaRoletaRealtime({
    campanhaId,
    usuarioId,
    onAtualizar: sincronizar,
    onGiro: receberGiro,
  });

  useEffect(() => {
    let cancelado = false;
    const carregar = async () => {
      setLoading(true);
      try {
        const [estadoInicial, historicoInicial] = await Promise.all([
          apiObterRoletaCampanha(campanhaId),
          apiHistoricoRoletaCampanha(campanhaId),
        ]);
        if (!cancelado) {
          setEstado(estadoInicial);
          setHistorico(historicoInicial);
          absorverHistorico(historicoInicial);
        }
      } catch (error) {
        if (!cancelado) {
          setErro(error instanceof Error ? error.message : 'Não foi possível carregar a roleta.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    void carregar();
    return () => {
      cancelado = true;
    };
  }, [absorverHistorico, campanhaId]);

  const preset = estado?.presets.find((item) => item.slot === slot) ?? null;
  const sorteioAtivo = estado?.sorteiosAtivos.find((item) => item.slot === slot) ?? null;
  const visualizacaoLocal = visualizacoes[slot] ?? null;
  const historicoCompativel = historicoCompativelComPresetRoleta(
    ultimosFinalizados[slot],
    preset,
  );
  const resumoConfigurado = useMemo(
    () =>
      estado && preset
        ? montarResumoConfigRoleta({
            modo: preset.modo,
            config: preset.config,
            catalogo: estado.catalogo,
          })
        : null,
    [estado, preset],
  );
  const sorteioExibido = sorteioAtivo ?? visualizacaoLocal?.sorteio ?? historicoCompativel;
  const giroAtual =
    visualizacaoLocal && visualizacaoLocal.sorteio.id === sorteioExibido?.id
      ? visualizacaoLocal.giro
      : null;
  const itensRoleta =
    sorteioExibido?.poolSnapshot.itens ?? resumoConfigurado?.pool.itens ?? [];
  const resultadoEstatico = giroAtual ? null : sorteioExibido?.resultadoFinal ?? null;
  const anuncio = resultadosAnunciados[slot];
  const girando = Boolean(
    giroAtual && animacoesEmCurso[slot] === giroAtual.animacaoId,
  );
  const resultadoVisivel = giroAtual
    ? anuncio?.animacaoId === giroAtual.animacaoId
      ? anuncio.nome
      : null
    : sorteioExibido?.resultadoFinal?.nome ?? null;
  const participantesAlvo =
    estado?.catalogo.participantes.filter((item) => item.papel !== 'OBSERVADOR') ?? [];
  const clas = estado?.catalogo.itens.filter((item) => item.categoria === 'CLA') ?? [];
  const ehAlvo = sorteioAtivo?.alvo?.id === usuarioId;
  const podeGirar = Boolean(estado?.capacidades.podeGirar || ehAlvo);
  const podeDecidir = Boolean(estado?.capacidades.ehMestre || ehAlvo);

  const executar = useCallback(async (acao: () => Promise<void>) => {
    setPendente(true);
    setErro(null);
    try {
      await acao();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'A operação da roleta falhou.');
    } finally {
      setPendente(false);
    }
  }, []);

  if (loading) return <Loading message="Carregando roleta da campanha…" />;
  if (!estado || !preset) {
    return (
      <EmptyState
        variant="card"
        icon="dice"
        title="Roleta indisponível"
        description={erro ?? 'Não foi possível carregar a configuração da campanha.'}
      />
    );
  }

  const limparVisualizacaoAtual = () => {
    setVisualizacoes((atuais) => removerEstadoPorSlotRoleta(atuais, slot));
    setResultadosAnunciados((atuais) => removerEstadoPorSlotRoleta(atuais, slot));
  };

  const iniciarEGirar = () =>
    executar(async () => {
      limparVisualizacaoAtual();
      const inicio = await apiIniciarSorteioRoletaCampanha(campanhaId, {
        slot,
        alvoUsuarioId: alvoUsuarioId ? Number(alvoUsuarioId) : undefined,
        claSelecionadoChave: claSelecionado || undefined,
        claDuplicadoChave: claDuplicado || undefined,
        presetRevisaoEsperada: preset.revisao,
        clientRequestId: criarClientRequestIdRoleta(),
      });
      setEstado((atual) =>
        atual
          ? {
              ...atual,
              sorteiosAtivos: [
                ...atual.sorteiosAtivos.filter((item) => item.slot !== slot),
                inicio.sorteio,
              ],
            }
          : atual,
      );
      try {
        const resposta = await apiGirarRoletaCampanha(
          campanhaId,
          inicio.sorteio.id,
          inicio.sorteio.revisao,
        );
        registrarGiro(resposta);
      } finally {
        await Promise.all([carregarEstado(), carregarHistorico()]);
      }
    });

  const girar = () =>
    sorteioAtivo &&
    executar(async () => {
      const resposta = await apiGirarRoletaCampanha(
        campanhaId,
        sorteioAtivo.id,
        sorteioAtivo.revisao,
      );
      registrarGiro(resposta);
      await carregarEstado();
    });

  const terceiroGiro = () =>
    sorteioAtivo &&
    executar(async () => {
      const resposta = await apiTerceiroGiroRoletaCampanha(
        campanhaId,
        sorteioAtivo.id,
        sorteioAtivo.revisao,
      );
      registrarGiro(resposta);
      await Promise.all([carregarEstado(), carregarHistorico()]);
    });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Icon name="dice" className="h-6 w-6 text-app-primary" />
            <h2 className="text-xl font-bold text-app-fg">Roleta da campanha</h2>
            <Badge color={realtimeStatus === 'online' ? 'green' : 'yellow'}>
              {realtimeStatus === 'online' ? 'Tempo real' : 'Sincronizando'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-app-muted">
            Sorteie clãs, técnicas ou listas personalizadas com toda a campanha.
          </p>
        </div>
        {estado.capacidades.podeConfigurar ? (
          <Button size="sm" variant="secondary" onClick={() => setConfigurando(true)}>
            <Icon name="settings" className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        ) : null}
      </div>

      {erro ? (
        <div className="rounded-xl border border-app-danger/40 bg-app-danger/10 p-3 text-sm text-app-danger">{erro}</div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        {PRESETS.map((item) => {
          const ativo = slot === item.slot;
          const execucao = estado.sorteiosAtivos.find((atual) => atual.slot === item.slot);
          return (
            <button
              key={item.slot}
              type="button"
              onClick={() => setSlot(item.slot)}
              aria-pressed={ativo}
              className={`rounded-2xl border p-3 text-left transition-colors ${
                ativo
                  ? 'border-app-primary bg-app-primary/10'
                  : 'border-app-border bg-app-surface/60 hover:border-app-primary/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-app-fg">{item.label}</span>
                {execucao ? <Badge color="purple">Em andamento</Badge> : null}
              </div>
              <p className="mt-1 text-xs text-app-muted">{item.descricao}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <Card variant="glass" className="space-y-5 overflow-hidden">
          <VerticalCampaignRoulette
            key={slot}
            itens={itensRoleta}
            giro={giroAtual}
            resultadoEstatico={resultadoEstatico}
            onAnimationComplete={(resultado) =>
              giroAtual && (() => {
                setAnimacoesEmCurso((atuais) => {
                  if (atuais[slot] !== giroAtual.animacaoId) return atuais;
                  const proximo = { ...atuais };
                  delete proximo[slot];
                  return proximo;
                });
                setResultadosAnunciados((atuais) => ({
                  ...atuais,
                  [slot]: { animacaoId: giroAtual.animacaoId, nome: resultado.nome },
                }));
              })()
            }
          />

          <div className="min-h-12 text-center" aria-live="polite">
            {girando ? (
              <p className="text-sm font-semibold text-app-primary">Girando…</p>
            ) : resultadoVisivel ? (
              <div className="rounded-2xl border border-app-primary/35 bg-app-primary/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">Saiu</p>
                <p className="text-xl font-extrabold text-app-primary">{resultadoVisivel}</p>
              </div>
            ) : null}
          </div>

          {sorteioAtivo ? (
            <div className="space-y-3 rounded-2xl border border-app-border bg-app-bg/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-app-fg">{ROTULOS_STATUS[sorteioAtivo.status]}</p>
                  <p className="text-xs text-app-muted">
                    {sorteioAtivo.alvo ? `Para ${sorteioAtivo.alvo.apelido}` : 'Sem jogador-alvo'}
                  </p>
                </div>
                <Badge color="gray">
                  {sorteioAtivo.poolSnapshot.quantidadeResultados} possibilidades · peso {sorteioAtivo.poolSnapshot.pesoTotal}
                </Badge>
              </div>

              {sorteioAtivo.status === 'AGUARDANDO_ESCOLHA' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {sorteioAtivo.resultados.slice(0, 2).map((resultado, indice) => (
                    <Button
                      key={`${resultado.chave}-${indice}`}
                      variant="secondary"
                      disabled={!podeDecidir || pendente}
                      aria-label={`Escolher ${resultado.nome}`}
                      onClick={() =>
                        void executar(async () => {
                          const resposta = await apiEscolherRoletaCampanha(
                            campanhaId,
                            sorteioAtivo.id,
                            sorteioAtivo.revisao,
                            indice as 0 | 1,
                          );
                          setVisualizacoes((atuais) => ({
                            ...atuais,
                            [slot]: { sorteio: resposta.sorteio, giro: null },
                          }));
                          await sincronizar();
                        })
                      }
                    >
                      Escolher {resultado.nome}
                    </Button>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-center gap-2">
                {['AGUARDANDO_GIRO_1', 'AGUARDANDO_GIRO_2'].includes(sorteioAtivo.status) ? (
                  <Button onClick={() => void girar()} disabled={!podeGirar || pendente}>
                    <Icon name={pendente ? 'spinner' : 'sparkles'} className="mr-2 h-4 w-4" />
                    {sorteioAtivo.status === 'AGUARDANDO_GIRO_2'
                      ? 'Girar segunda opção'
                      : 'Tentar girar novamente'}
                  </Button>
                ) : null}
                {sorteioAtivo.status === 'AGUARDANDO_ESCOLHA' ? (
                  <Button variant="secondary" onClick={() => void terceiroGiro()} disabled={!podeDecidir || pendente}>
                    Descartar opções e aceitar terceiro giro
                  </Button>
                ) : null}
                {estado.capacidades.podeCancelar ? (
                  <Button
                    variant="destructive"
                    disabled={pendente}
                    onClick={() =>
                      confirmacao.confirm({
                        title: 'Cancelar sorteio?',
                        description:
                          'O sorteio será encerrado e o cancelamento continuará visível no histórico da campanha.',
                        confirmLabel: 'Cancelar sorteio',
                        variant: 'danger',
                        onConfirm: () =>
                          executar(async () => {
                            await apiCancelarSorteioRoletaCampanha(
                              campanhaId,
                              sorteioAtivo.id,
                              sorteioAtivo.revisao,
                            );
                            limparVisualizacaoAtual();
                            await sincronizar();
                          }),
                      })
                    }
                  >
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </div>
          ) : estado.capacidades.podeIniciar ? (
            <div className="space-y-3 rounded-2xl border border-app-border bg-app-bg/40 p-4">
              <div>
                <h3 className="font-bold text-app-fg">Preparar sorteio</h3>
                <p className="text-xs text-app-muted">Escolha as opções abaixo e gire em um único clique.</p>
              </div>
              <label className="block text-sm font-semibold text-app-fg">
                Jogador-alvo opcional
                <select
                  value={alvoUsuarioId}
                  onChange={(event) => setAlvoUsuarioId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2"
                >
                  <option value="">Sem alvo</option>
                  {participantesAlvo.map((participante) => (
                    <option key={participante.id} value={participante.id}>{participante.apelido} · {participante.papel}</option>
                  ))}
                </select>
              </label>
              {preset.modo === 'CLA' ? (
                <label className="block text-sm font-semibold text-app-fg">
                  Clã com uma chance adicional
                  <select
                    value={claDuplicado}
                    onChange={(event) => setClaDuplicado(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2"
                  >
                    <option value="">Nenhum</option>
                    {clas.map((cla) => <option key={cla.chave} value={cla.chave}>{cla.nome}</option>)}
                  </select>
                </label>
              ) : null}
              {preset.modo === 'TECNICA' ? (
                <label className="block text-sm font-semibold text-app-fg">
                  Clã para compatibilidade hereditária
                  <select
                    value={claSelecionado}
                    onChange={(event) => setClaSelecionado(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2"
                  >
                    <option value="">Usar o último clã sorteado para o alvo</option>
                    {clas.map((cla) => <option key={cla.chave} value={cla.chave}>{cla.nome}</option>)}
                  </select>
                </label>
              ) : null}
              <Button
                onClick={() => void iniciarEGirar()}
                disabled={pendente || (resumoConfigurado?.erros.length ?? 0) > 0}
                className="w-full"
              >
                <Icon name={pendente ? 'spinner' : 'sparkles'} className="mr-2 h-4 w-4" />
                Girar roleta
              </Button>
              {resumoConfigurado?.erros.length ? (
                <p className="text-center text-xs text-app-warning">Revise a configuração antes de girar.</p>
              ) : null}
            </div>
          ) : (
            <EmptyState
              variant="plain"
              icon="lock"
              title="Aguardando um sorteio"
              description="Você acompanha em tempo real, mas não possui permissão para iniciar."
            />
          )}
        </Card>

        <div className="space-y-5">
          <Card variant="glass" className="space-y-3">
            <h3 className="font-bold text-app-fg">Configuração atual</h3>
            <p className="text-sm font-semibold text-app-fg">{ROTULOS_MODO[preset.modo]}</p>
            <p className="text-sm text-app-muted">
              {resumoConfigurado?.pool.quantidadeResultados ?? 0} possibilidades configuradas ·{' '}
              {preset.config.fontes.sistemaBase ? 'sistema base' : 'sem sistema base'} ·{' '}
              {preset.config.fontes.suplementoIds.length} suplemento(s) ·{' '}
              {preset.config.fontes.homebrewIds.length} homebrew(s)
            </p>
            <div className="flex flex-wrap gap-2">
              {(sorteioExibido?.poolSnapshot.itens ?? resumoConfigurado?.pool.itens ?? [])
                .filter((item) => item.ocorrencias > 1 || item.pesoUnitario > 1)
                .slice(0, 20)
                .map((item) => (
                  <Badge key={item.chave} color="yellow">
                    {item.nome}{item.ocorrencias > 1 ? ` ×${item.ocorrencias}` : ''}{item.pesoUnitario > 1 ? ` · peso ${item.pesoUnitario}×` : ''}
                  </Badge>
                ))}
            </div>
          </Card>

          <Card variant="glass" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-app-fg">Histórico</h3>
              <Badge color="gray">{historico?.total ?? 0}</Badge>
            </div>
            {historico?.itens.length ? (
              <div className="max-h-[34rem] space-y-2 overflow-auto pr-1">
                {historico.itens.map((item) => (
                  <CampaignRouletteHistoryCard key={item.id} item={item} onOpen={() => setHistoricoSelecionado(item)} />
                ))}
              </div>
            ) : (
              <EmptyState variant="plain" description="Nenhum sorteio registrado ainda." size="sm" />
            )}
            {historico && historico.totalPaginas > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <Button size="xs" variant="ghost" disabled={historico.pagina <= 1} onClick={() => void carregarHistorico(historico.pagina - 1)}>Anterior</Button>
                <span className="text-xs text-app-muted">Página {historico.pagina} de {historico.totalPaginas}</span>
                <Button size="xs" variant="ghost" disabled={historico.pagina >= historico.totalPaginas} onClick={() => void carregarHistorico(historico.pagina + 1)}>Próxima</Button>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {configurando ? (
        <CampaignRouletteConfigModal
          key={`${preset.id}:${preset.revisao}`}
          preset={preset}
          estado={estado}
          onClose={() => setConfigurando(false)}
          onSave={async (modo, config) => {
            await apiSalvarPresetRoletaCampanha(campanhaId, slot, {
              modo,
              config,
              revisaoEsperada: preset.revisao,
            });
            limparVisualizacaoAtual();
            await carregarEstado();
            setConfigurando(false);
          }}
          onPermission={async (participanteId, permissao) => {
            await apiSalvarPermissaoRoletaCampanha(campanhaId, participanteId, permissao);
            await carregarEstado();
          }}
        />
      ) : null}

      {historicoSelecionado ? (
        <CampaignRouletteHistoryModal item={historicoSelecionado} onClose={() => setHistoricoSelecionado(null)} />
      ) : null}

      <ConfirmDialog
        isOpen={confirmacao.isOpen}
        onClose={confirmacao.handleClose}
        onConfirm={() => void confirmacao.handleConfirm()}
        title={confirmacao.options?.title ?? 'Confirmar ação'}
        description={confirmacao.options?.description ?? ''}
        confirmLabel={confirmacao.options?.confirmLabel}
        cancelLabel={confirmacao.options?.cancelLabel}
        variant={confirmacao.options?.variant}
        confirmLoading={pendente}
      />
    </section>
  );
}
