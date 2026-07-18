'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiCancelarSorteioRoletaCampanha,
  apiEscolherRoletaCampanha,
  apiGirarRoletaCampanha,
  apiHistoricoRoletaCampanha,
  apiIniciarSorteioRoletaCampanha,
  apiObterRoletaCampanha,
  apiPreviewRoletaCampanha,
  apiSalvarPermissaoRoletaCampanha,
  apiSalvarPresetRoletaCampanha,
  apiTerceiroGiroRoletaCampanha,
  criarClientRequestIdRoleta,
  type CampanhaRoletaEstado,
  type CampanhaRoletaGiro,
  type CampanhaRoletaHistorico,
  type CampanhaRoletaPoolItem,
  type CampanhaRoletaSlot,
} from '@/lib/api/campanha-roleta';
import { useCampanhaRoletaRealtime } from '@/hooks/useCampanhaRoletaRealtime';
import type { EventoCampanhaRoletaGiro } from '@/lib/realtime/campanha-socket';
import { CampaignRouletteConfigModal } from './CampaignRouletteConfigModal';
import { VerticalCampaignRoulette } from './VerticalCampaignRoulette';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';

const PRESETS: Array<{ slot: CampanhaRoletaSlot; label: string; descricao: string }> = [
  { slot: 'CLA', label: 'Clã', descricao: 'Todos iguais, com uma duplicação opcional.' },
  { slot: 'TECNICA', label: 'Técnica', descricao: 'Duas opções distintas ou terceiro giro definitivo.' },
  { slot: 'CUSTOMIZADO', label: 'Customizado', descricao: 'Preset livre e persistente da campanha.' },
];

function itensVisuaisSemSorteio(
  estado: CampanhaRoletaEstado,
  slot: CampanhaRoletaSlot,
): CampanhaRoletaPoolItem[] {
  const preset = estado.presets.find((item) => item.slot === slot);
  if (!preset) return [];
  const suplementos = new Set(preset.config.fontes.suplementoIds);
  const homebrews = new Set(preset.config.fontes.homebrewIds);
  return estado.catalogo.itens
    .filter((item) => {
      if (preset.modo === 'CLA') return item.categoria === 'CLA';
      if (preset.modo === 'TECNICA') return item.categoria === 'TECNICA';
      return preset.config.inclusoesCatalogo.includes(item.chave);
    })
    .filter(
      (item) =>
        !preset.config.exclusoes.includes(item.chave) &&
        (preset.config.inclusoesCatalogo.includes(item.chave) ||
          (item.fonte === 'SISTEMA_BASE' && preset.config.fontes.sistemaBase) ||
          (item.fonte === 'SUPLEMENTO' && item.fonteId && suplementos.has(item.fonteId)) ||
          (item.fonte === 'HOMEBREW' && item.fonteId && homebrews.has(item.fonteId))),
    )
    .map((item) => ({
      ...item,
      ocorrencias: 1,
      pesoUnitario: 1,
      pesoTotal: 1,
      incluidoManualmente: preset.config.inclusoesCatalogo.includes(item.chave),
    }));
}

function extrairGiro(evento: EventoCampanhaRoletaGiro): CampanhaRoletaGiro | null {
  const dados = evento.dados as Partial<CampanhaRoletaGiro> | null;
  return dados?.giro && dados.sorteio ? (dados as CampanhaRoletaGiro) : null;
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
  const [slot, setSlot] = useState<CampanhaRoletaSlot>('CLA');
  const [configurando, setConfigurando] = useState(false);
  const [alvoUsuarioId, setAlvoUsuarioId] = useState('');
  const [claSelecionado, setClaSelecionado] = useState('');
  const [claDuplicado, setClaDuplicado] = useState('');
  const [giro, setGiro] = useState<CampanhaRoletaGiro['giro'] | null>(null);
  const [resultadoAnunciado, setResultadoAnunciado] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarEstado = useCallback(async () => {
    const proximo = await apiObterRoletaCampanha(campanhaId);
    setEstado(proximo);
  }, [campanhaId]);
  const carregarHistorico = useCallback(
    async (pagina = 1) => {
      setHistorico(await apiHistoricoRoletaCampanha(campanhaId, pagina));
    },
    [campanhaId],
  );
  const sincronizar = useCallback(async () => {
    await Promise.all([carregarEstado(), carregarHistorico(historico?.pagina ?? 1)]);
  }, [carregarEstado, carregarHistorico, historico?.pagina]);
  const receberGiro = useCallback((evento: EventoCampanhaRoletaGiro) => {
    const recebido = extrairGiro(evento);
    if (recebido) setGiro(recebido.giro);
  }, []);
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
        }
      } catch (error) {
        if (!cancelado) {
          setErro(error instanceof Error ? error.message : 'Falha ao carregar a roleta.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    void carregar();
    return () => {
      cancelado = true;
    };
  }, [campanhaId]);

  const preset = estado?.presets.find((item) => item.slot === slot) ?? null;
  const sorteio = estado?.sorteiosAtivos.find((item) => item.slot === slot) ?? null;
  const itensRoleta = useMemo(() => {
    if (sorteio) return sorteio.poolSnapshot.itens;
    return estado ? itensVisuaisSemSorteio(estado, slot) : [];
  }, [estado, slot, sorteio]);
  const participantesAlvo =
    estado?.catalogo.participantes.filter((item) => item.papel !== 'OBSERVADOR') ?? [];
  const clas = estado?.catalogo.itens.filter((item) => item.categoria === 'CLA') ?? [];
  const ehAlvo = sorteio?.alvo?.id === usuarioId;
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

  const iniciar = () =>
    executar(async () => {
      const resposta = await apiIniciarSorteioRoletaCampanha(campanhaId, {
        slot,
        alvoUsuarioId: alvoUsuarioId ? Number(alvoUsuarioId) : undefined,
        claSelecionadoChave: claSelecionado || undefined,
        claDuplicadoChave: claDuplicado || undefined,
        presetRevisaoEsperada: preset.revisao,
        clientRequestId: criarClientRequestIdRoleta(),
      });
      setGiro(null);
      setResultadoAnunciado('');
      setEstado((atual) =>
        atual
          ? {
              ...atual,
              sorteiosAtivos: [
                ...atual.sorteiosAtivos.filter((item) => item.slot !== slot),
                resposta.sorteio,
              ],
            }
          : atual,
      );
      await carregarHistorico();
    });

  const girar = () =>
    sorteio &&
    executar(async () => {
      const resposta = await apiGirarRoletaCampanha(
        campanhaId,
        sorteio.id,
        sorteio.revisao,
      );
      setGiro(resposta.giro);
      await carregarEstado();
    });

  const terceiroGiro = () =>
    sorteio &&
    executar(async () => {
      const resposta = await apiTerceiroGiroRoletaCampanha(
        campanhaId,
        sorteio.id,
        sorteio.revisao,
      );
      setGiro(resposta.giro);
      await carregarEstado();
      await carregarHistorico();
    });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="dice" className="h-6 w-6 text-app-primary" />
            <h2 className="text-xl font-bold text-app-fg">Roleta da campanha</h2>
            <Badge color={realtimeStatus === 'online' ? 'green' : 'yellow'}>
              {realtimeStatus === 'online' ? 'Tempo real' : 'Sincronizando'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-app-muted">
            O servidor define os resultados; esta tela apenas reproduz a animação compartilhada.
          </p>
        </div>
        {estado.capacidades.podeConfigurar ? (
          <Button size="sm" variant="secondary" onClick={() => setConfigurando(true)}>
            <Icon name="settings" className="mr-2 h-4 w-4" />
            Configurar preset
          </Button>
        ) : null}
      </div>

      {erro ? (
        <div className="rounded-xl border border-app-danger/40 bg-app-danger/10 p-3 text-sm text-app-danger">
          {erro}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        {PRESETS.map((item) => {
          const ativo = slot === item.slot;
          const execucao = estado.sorteiosAtivos.find(
            (sorteioAtual) => sorteioAtual.slot === item.slot,
          );
          return (
            <button
              key={item.slot}
              type="button"
              onClick={() => {
                setSlot(item.slot);
                setGiro(null);
                setResultadoAnunciado('');
              }}
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
            itens={itensRoleta}
            giro={giro}
            onAnimationComplete={(resultado) => setResultadoAnunciado(resultado.nome)}
          />
          <div className="text-center" aria-live="polite">
            {resultadoAnunciado ? (
              <p className="text-lg font-extrabold text-amber-300">
                Resultado: {resultadoAnunciado}
              </p>
            ) : sorteio?.resultados.length ? (
              <p className="text-sm text-app-muted">
                Último resultado: {sorteio.resultados.at(-1)?.nome}
              </p>
            ) : null}
          </div>
          {sorteio ? (
            <div className="space-y-3 rounded-2xl border border-app-border bg-app-bg/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-app-fg">
                    Sorteio #{sorteio.id} · {sorteio.status.replaceAll('_', ' ')}
                  </p>
                  <p className="text-xs text-app-muted">
                    {sorteio.alvo ? `Alvo: ${sorteio.alvo.apelido}` : 'Sem alvo · mestres decidem'}
                  </p>
                </div>
                <Badge color="gray">
                  {sorteio.poolSnapshot.quantidadeResultados} itens · peso {sorteio.poolSnapshot.pesoTotal}
                </Badge>
              </div>

              {sorteio.status === 'AGUARDANDO_ESCOLHA' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {sorteio.resultados.slice(0, 2).map((resultado, indice) => (
                    <Button
                      key={`${resultado.chave}-${indice}`}
                      variant="secondary"
                      disabled={!podeDecidir || pendente}
                      aria-label={`Escolher ${resultado.nome}`}
                      onClick={() =>
                        void executar(async () => {
                          await apiEscolherRoletaCampanha(
                            campanhaId,
                            sorteio.id,
                            sorteio.revisao,
                            indice as 0 | 1,
                          );
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
                {['AGUARDANDO_GIRO_1', 'AGUARDANDO_GIRO_2'].includes(sorteio.status) ? (
                  <Button onClick={() => void girar()} disabled={!podeGirar || pendente}>
                    <Icon name={pendente ? 'spinner' : 'sparkles'} className="mr-2 h-4 w-4" />
                    {sorteio.status === 'AGUARDANDO_GIRO_2' ? 'Girar segunda opção' : 'Girar'}
                  </Button>
                ) : null}
                {sorteio.status === 'AGUARDANDO_ESCOLHA' ? (
                  <Button
                    variant="secondary"
                    onClick={() => void terceiroGiro()}
                    disabled={!podeDecidir || pendente}
                  >
                    Abdicar e aceitar terceiro giro
                  </Button>
                ) : null}
                {estado.capacidades.podeCancelar ? (
                  <Button
                    variant="destructive"
                    disabled={pendente}
                    onClick={() => {
                      if (!window.confirm('Cancelar este sorteio? O evento ficará no histórico.')) return;
                      void executar(async () => {
                        await apiCancelarSorteioRoletaCampanha(
                          campanhaId,
                          sorteio.id,
                          sorteio.revisao,
                        );
                        await sincronizar();
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </div>
          ) : estado.capacidades.podeIniciar ? (
            <div className="space-y-3 rounded-2xl border border-app-border bg-app-bg/40 p-4">
              <h3 className="font-bold text-app-fg">Preparar sorteio</h3>
              <label className="block text-sm font-semibold text-app-fg">
                Jogador-alvo opcional
                <select
                  value={alvoUsuarioId}
                  onChange={(event) => setAlvoUsuarioId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2"
                >
                  <option value="">Sem alvo</option>
                  {participantesAlvo.map((participante) => (
                    <option key={participante.id} value={participante.id}>
                      {participante.apelido} · {participante.papel}
                    </option>
                  ))}
                </select>
              </label>
              {preset.modo === 'CLA' ? (
                <label className="block text-sm font-semibold text-app-fg">
                  Clã com uma ocorrência adicional
                  <select
                    value={claDuplicado}
                    onChange={(event) => setClaDuplicado(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2"
                  >
                    <option value="">Nenhum</option>
                    {clas.map((cla) => (
                      <option key={cla.chave} value={cla.chave}>{cla.nome}</option>
                    ))}
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
                    <option value="">Usar último clã sorteado para o alvo</option>
                    {clas.map((cla) => (
                      <option key={cla.chave} value={cla.chave}>{cla.nome}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              <Button onClick={() => void iniciar()} disabled={pendente} className="w-full">
                <Icon name={pendente ? 'spinner' : 'play'} className="mr-2 h-4 w-4" />
                Iniciar sorteio
              </Button>
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
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-app-fg">Configuração atual</h3>
              <Badge color="purple">Revisão {preset.revisao}</Badge>
            </div>
            <p className="text-sm text-app-muted">
              {preset.modo} · {preset.config.fontes.sistemaBase ? 'sistema base' : 'sem sistema base'} ·{' '}
              {preset.config.fontes.suplementoIds.length} suplemento(s) ·{' '}
              {preset.config.fontes.homebrewIds.length} homebrew(s)
            </p>
            <div className="flex flex-wrap gap-2">
              {itensRoleta
                .filter((item) => item.ocorrencias > 1 || item.pesoUnitario > 1)
                .slice(0, 20)
                .map((item) => (
                  <Badge key={item.chave} color="yellow">
                    {item.nome} {item.ocorrencias > 1 ? `×${item.ocorrencias}` : ''}
                    {item.pesoUnitario > 1 ? ` · peso ${item.pesoUnitario}×` : ''}
                  </Badge>
                ))}
            </div>
          </Card>

          <Card variant="glass" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-app-fg">Histórico público</h3>
              <Badge color="gray">{historico?.total ?? 0}</Badge>
            </div>
            {historico?.itens.length ? (
              <div className="max-h-[34rem] space-y-2 overflow-auto pr-1">
                {historico.itens.map((item) => (
                  <details key={item.id} className="rounded-xl border border-app-border p-3">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-app-fg">
                            {item.slot} · {item.resultadoFinal?.nome ?? item.status}
                          </p>
                          <p className="text-xs text-app-muted">
                            {new Date(item.criadoEm).toLocaleString('pt-BR')}
                            {item.alvo ? ` · ${item.alvo.apelido}` : ''}
                          </p>
                        </div>
                        <Badge color={item.status === 'CANCELADO' ? 'red' : 'green'}>
                          {item.status}
                        </Badge>
                      </div>
                    </summary>
                    <div className="mt-3 space-y-2 border-t border-app-border pt-3 text-xs text-app-muted">
                      <p>
                        Pool congelado: {item.poolSnapshot.quantidadeResultados} itens, peso{' '}
                        {item.poolSnapshot.pesoTotal}.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.poolSnapshot.itens
                          .filter((poolItem) => poolItem.ocorrencias > 1 || poolItem.pesoUnitario > 1)
                          .map((poolItem) => (
                            <Badge key={poolItem.chave} color="yellow">
                              {poolItem.nome} ×{poolItem.ocorrencias} · peso {poolItem.pesoTotal}
                            </Badge>
                          ))}
                      </div>
                      <p>{item.eventos.length} evento(s) imutável(is) registrado(s).</p>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <EmptyState variant="plain" description="Nenhum sorteio registrado ainda." size="sm" />
            )}
            {historico && historico.totalPaginas > 1 ? (
              <div className="flex justify-between gap-2">
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={historico.pagina <= 1}
                  onClick={() => void carregarHistorico(historico.pagina - 1)}
                >
                  Anterior
                </Button>
                <span className="text-xs text-app-muted">
                  {historico.pagina}/{historico.totalPaginas}
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={historico.pagina >= historico.totalPaginas}
                  onClick={() => void carregarHistorico(historico.pagina + 1)}
                >
                  Próxima
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {configurando ? (
        <CampaignRouletteConfigModal
          key={`${preset.id}:${preset.revisao}`}
          campanhaId={campanhaId}
          preset={preset}
          estado={estado}
          onClose={() => setConfigurando(false)}
          onSave={async (modo, config) => {
            await apiSalvarPresetRoletaCampanha(campanhaId, slot, {
              modo,
              config,
              revisaoEsperada: preset.revisao,
            });
            await carregarEstado();
            setConfigurando(false);
          }}
          onPreview={(modo, config) =>
            apiPreviewRoletaCampanha(campanhaId, { slot, modo, config })
          }
          onPermission={async (participanteId, permissao) => {
            await apiSalvarPermissaoRoletaCampanha(
              campanhaId,
              participanteId,
              permissao,
            );
            await carregarEstado();
          }}
        />
      ) : null}
    </section>
  );
}
