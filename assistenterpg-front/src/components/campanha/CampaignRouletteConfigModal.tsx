'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CampanhaRoletaCatalogoItem,
  CampanhaRoletaConfig,
  CampanhaRoletaEstado,
  CampanhaRoletaModo,
  CampanhaRoletaPreset,
} from '@/lib/api/campanha-roleta';
import {
  aplicarSelecaoCatalogoRoleta,
  agruparCatalogoRoleta,
  agruparRepeticoesRoleta,
  itemSelecionadoRoleta,
  limparOverridesItensRoleta,
  montarResumoConfigRoleta,
} from '@/lib/campanhas/campaign-roulette.helpers';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type AbaConfig = 'CONTEUDO' | 'PERMISSOES';

const ROTULOS_MODO: Record<CampanhaRoletaModo, string> = {
  CLA: 'Clã pela regra',
  TECNICA: 'Técnica pela regra',
  SIMPLES: 'Roleta simples',
};

function copiarConfig(config: CampanhaRoletaConfig): CampanhaRoletaConfig {
  return JSON.parse(JSON.stringify(config)) as CampanhaRoletaConfig;
}

function alternarTexto(lista: string[], valor: string): string[] {
  return lista.includes(valor)
    ? lista.filter((item) => item !== valor)
    : [...lista, valor];
}

function itemCompativelComModo(
  item: CampanhaRoletaCatalogoItem,
  modo: CampanhaRoletaModo,
): boolean {
  if (modo === 'CLA') return item.categoria === 'CLA';
  if (modo === 'TECNICA') return item.categoria === 'TECNICA';
  return item.categoria !== 'MANUAL';
}

function CheckboxGrupo({
  marcado,
  parcial,
  onChange,
  label,
}: {
  marcado: boolean;
  parcial: boolean;
  onChange: (marcado: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = parcial;
  }, [parcial]);
  return (
    <label className="inline-flex min-w-0 items-center gap-2 text-sm font-bold text-app-fg">
      <input
        ref={ref}
        type="checkbox"
        checked={marcado}
        aria-checked={parcial ? 'mixed' : marcado}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-app-border bg-app-surface text-app-primary focus:ring-app-primary"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

export function CampaignRouletteConfigModal({
  preset,
  estado,
  onClose,
  onSave,
  onPermission,
}: {
  preset: CampanhaRoletaPreset;
  estado: CampanhaRoletaEstado;
  onClose: () => void;
  onSave: (
    modo: CampanhaRoletaModo,
    config: CampanhaRoletaConfig,
  ) => Promise<void>;
  onPermission: (
    usuarioId: number,
    permissao: { podeConfigurar: boolean; podeGirar: boolean },
  ) => Promise<void>;
}) {
  const [aba, setAba] = useState<AbaConfig>('CONTEUDO');
  const [modo, setModo] = useState<CampanhaRoletaModo>(preset.modo);
  const [config, setConfig] = useState(() => copiarConfig(preset.config));
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const resumo = useMemo(
    () => montarResumoConfigRoleta({ modo, config, catalogo: estado.catalogo }),
    [config, estado.catalogo, modo],
  );
  const repetidos = useMemo(
    () => agruparRepeticoesRoleta(config.listaManualTexto),
    [config.listaManualTexto],
  );
  const gruposCatalogoCompletos = useMemo(
    () => agruparCatalogoRoleta({ catalogo: estado.catalogo, modo, config }),
    [config, estado.catalogo, modo],
  );
  const gruposCatalogo = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return gruposCatalogoCompletos
      .map((grupo) => ({
        ...grupo,
        itens: grupo.itens.filter(
          (item) => !termo || item.nome.toLocaleLowerCase('pt-BR').includes(termo),
        ),
      }))
      .filter((grupo) => grupo.itens.length > 0);
  }, [busca, gruposCatalogoCompletos]);
  const itensCompativeis = useMemo(
    () => estado.catalogo.itens.filter((item) => itemCompativelComModo(item, modo)),
    [estado.catalogo.itens, modo],
  );
  const suplementosDisponiveis = useMemo(
    () =>
      estado.catalogo.suplementos.filter((suplemento) =>
        itensCompativeis.some(
          (item) => item.fonte === 'SUPLEMENTO' && item.fonteId === suplemento.id,
        ),
      ),
    [estado.catalogo.suplementos, itensCompativeis],
  );
  const homebrewsDisponiveis = useMemo(
    () =>
      estado.catalogo.homebrews.filter((homebrew) =>
        itensCompativeis.some(
          (item) => item.fonte === 'HOMEBREW' && item.fonteId === homebrew.id,
        ),
      ),
    [estado.catalogo.homebrews, itensCompativeis],
  );
  const tecnicasHereditarias = useMemo(
    () =>
      gruposCatalogoCompletos
        .flatMap((grupo) => grupo.itens)
        .filter((item) => item.categoria === 'TECNICA' && item.hereditaria),
    [gruposCatalogoCompletos],
  );
  const clas = estado.catalogo.itens.filter((item) => item.categoria === 'CLA');

  const executar = async (acao: () => Promise<void>) => {
    setPendente(true);
    setErro(null);
    try {
      await acao();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar a roleta.');
    } finally {
      setPendente(false);
    }
  };

  const alterarModo = (proximoModo: CampanhaRoletaModo) => {
    const itensValidos = estado.catalogo.itens.filter((item) =>
      itemCompativelComModo(item, proximoModo),
    );
    const chavesValidas = new Set(itensValidos.map((item) => item.chave));
    const suplementosValidos = new Set(
      itensValidos
        .filter((item) => item.fonte === 'SUPLEMENTO')
        .map((item) => item.fonteId),
    );
    const homebrewsValidos = new Set(
      itensValidos
        .filter((item) => item.fonte === 'HOMEBREW')
        .map((item) => item.fonteId),
    );
    setModo(proximoModo);
    setBusca('');
    setConfig((atual) => ({
      ...atual,
      fontes: {
        ...atual.fontes,
        suplementoIds: atual.fontes.suplementoIds.filter((id) =>
          suplementosValidos.has(id),
        ),
        homebrewIds: atual.fontes.homebrewIds.filter((id) =>
          homebrewsValidos.has(id),
        ),
      },
      inclusoesCatalogo: atual.inclusoesCatalogo.filter((chave) =>
        chavesValidas.has(chave),
      ),
      exclusoes: atual.exclusoes.filter((chave) => chavesValidas.has(chave)),
      compatibilidadesHereditarias:
        proximoModo === 'TECNICA'
          ? atual.compatibilidadesHereditarias.filter((item) =>
              chavesValidas.has(item.tecnicaChave),
            )
          : [],
    }));
  };

  const alterarFonte = (params: {
    fonte: 'SISTEMA_BASE' | 'SUPLEMENTO' | 'HOMEBREW';
    fonteId?: number;
    habilitada: boolean;
  }) => {
    const chavesFonte = estado.catalogo.itens
      .filter(
        (item) =>
          item.fonte === params.fonte &&
          (params.fonte === 'SISTEMA_BASE' || item.fonteId === params.fonteId),
      )
      .map((item) => item.chave);
    setConfig((atual) => {
      const base = params.habilitada
        ? atual
        : limparOverridesItensRoleta(atual, chavesFonte);
      if (params.fonte === 'SISTEMA_BASE') {
        return {
          ...base,
          fontes: { ...base.fontes, sistemaBase: params.habilitada },
        };
      }
      if (params.fonte === 'SUPLEMENTO' && params.fonteId) {
        return {
          ...base,
          fontes: {
            ...base.fontes,
            suplementoIds: params.habilitada
              ? [...new Set([...base.fontes.suplementoIds, params.fonteId])]
              : base.fontes.suplementoIds.filter((id) => id !== params.fonteId),
          },
        };
      }
      if (params.fonte === 'HOMEBREW' && params.fonteId) {
        return {
          ...base,
          fontes: {
            ...base.fontes,
            homebrewIds: params.habilitada
              ? [...new Set([...base.fontes.homebrewIds, params.fonteId])]
              : base.fontes.homebrewIds.filter((id) => id !== params.fonteId),
          },
        };
      }
      return base;
    });
  };

  const conteudo = (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-app-fg">Modo e fontes</h3>
            <p className="text-sm text-app-muted">
              Escolha de onde vêm as possibilidades desta roleta.
            </p>
          </div>
          {preset.slot === 'CUSTOMIZADO' ? (
            <label className="block text-sm font-semibold text-app-fg">
              Tipo de sorteio
              <select
                value={modo}
                onChange={(event) => alterarModo(event.target.value as CampanhaRoletaModo)}
                className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2"
              >
                <option value="SIMPLES">Roleta simples</option>
                <option value="CLA">Clã pela regra</option>
                <option value="TECNICA">Técnica pela regra</option>
              </select>
            </label>
          ) : (
            <div className="rounded-xl border border-app-primary/25 bg-app-primary/5 p-3">
              <p className="text-sm font-bold text-app-fg">{ROTULOS_MODO[modo]}</p>
              <p className="mt-1 text-xs text-app-muted">
                {modo === 'CLA'
                  ? 'No sorteio, um clã poderá receber uma ocorrência adicional.'
                  : 'O sorteio gera duas opções distintas e permite uma terceira definitiva.'}
              </p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {itensCompativeis.some((item) => item.fonte === 'SISTEMA_BASE') ? (
              <div className="rounded-xl border border-app-border bg-app-card/50 p-3">
                <Checkbox
                  checked={config.fontes.sistemaBase}
                  onChange={(event) =>
                    alterarFonte({
                      fonte: 'SISTEMA_BASE',
                      habilitada: event.target.checked,
                    })
                  }
                  label="Sistema base"
                />
              </div>
            ) : null}
            {suplementosDisponiveis.map((suplemento) => (
              <div key={suplemento.id} className="rounded-xl border border-app-border bg-app-card/50 p-3">
                <Checkbox
                  checked={config.fontes.suplementoIds.includes(suplemento.id)}
                  onChange={(event) =>
                    alterarFonte({
                      fonte: 'SUPLEMENTO',
                      fonteId: suplemento.id,
                      habilitada: event.target.checked,
                    })
                  }
                  label={suplemento.nome}
                />
                <p className="mt-1 pl-6 text-xs text-app-muted">Suplemento publicado</p>
              </div>
            ))}
            {homebrewsDisponiveis.map((homebrew) => (
              <div key={homebrew.id} className="rounded-xl border border-app-border bg-app-card/50 p-3">
                <Checkbox
                  checked={config.fontes.homebrewIds.includes(homebrew.id)}
                  onChange={(event) =>
                    alterarFonte({
                      fonte: 'HOMEBREW',
                      fonteId: homebrew.id,
                      habilitada: event.target.checked,
                    })
                  }
                  label={homebrew.nome}
                />
                <p className="mt-1 pl-6 text-xs text-app-muted">
                  Homebrew de {homebrew.autor.apelido}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit space-y-3 rounded-2xl border border-app-border bg-app-bg/45 p-4 lg:sticky lg:top-0">
          <div>
            <h3 className="font-bold text-app-fg">Resumo da roleta</h3>
            <p className="text-xs text-app-muted">Atualizado conforme você configura.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-app-surface p-2">
              <p className="text-lg font-extrabold text-app-fg">{resumo.pool.quantidadeResultados}</p>
              <p className="text-[0.7rem] text-app-muted">possibilidades</p>
            </div>
            <div className="rounded-lg bg-app-surface p-2">
              <p className="text-lg font-extrabold text-app-fg">{resumo.pool.pesoTotal}</p>
              <p className="text-[0.7rem] text-app-muted">peso total</p>
            </div>
            <div className="rounded-lg bg-app-surface p-2">
              <p className="text-lg font-extrabold text-app-fg">{resumo.fontesAtivas}</p>
              <p className="text-[0.7rem] text-app-muted">fontes</p>
            </div>
          </div>
          {resumo.tecnicasHereditariasCondicionais > 0 ? (
            <p className="rounded-lg border border-app-primary/25 bg-app-primary/5 p-2 text-xs text-app-muted">
              {resumo.tecnicasHereditariasCondicionais} técnica(s) podem receber peso 2× conforme o clã escolhido.
            </p>
          ) : null}
          {resumo.erros.length ? (
            <ul className="space-y-1 rounded-lg border border-app-warning/30 bg-app-warning/10 p-2 text-xs text-app-warning">
              {resumo.erros.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : (
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-auto">
              {resumo.pool.itens.slice(0, 30).map((item) => (
                <Badge key={item.chave} color={item.pesoTotal > 1 ? 'yellow' : 'gray'} size="sm">
                  {item.nome}{item.ocorrencias > 1 ? ` ×${item.ocorrencias}` : ''}
                </Badge>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-bold text-app-fg">Possibilidades do catálogo</h3>
          <p className="text-sm text-app-muted">
            {modo === 'SIMPLES'
              ? 'Selecione grupos inteiros ou apenas os itens que deseja usar.'
              : 'As fontes entram completas; desmarque somente o que não deve participar.'}
          </p>
        </div>
        {gruposCatalogo.length || busca ? (
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            icon="search"
            placeholder="Pesquisar nas fontes habilitadas"
          />
        ) : null}
        {gruposCatalogo.length ? (
          <div className="space-y-3">
            {gruposCatalogo.map((grupo) => {
              const grupoCompleto =
                gruposCatalogoCompletos.find((item) => item.chave === grupo.chave) ??
                grupo;
              const selecionados = grupoCompleto.itens.filter((item) =>
                itemSelecionadoRoleta(item.chave, modo, config),
              ).length;
              const todos = selecionados === grupoCompleto.itens.length;
              const parcial = selecionados > 0 && !todos;
              return (
                <div key={grupo.chave} className="overflow-hidden rounded-xl border border-app-border">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-app-muted-surface/70 px-3 py-2.5">
                    <div className="min-w-0">
                      <CheckboxGrupo
                        marcado={todos}
                        parcial={parcial}
                        label={grupo.nome}
                        onChange={(marcado) =>
                          setConfig((atual) =>
                            aplicarSelecaoCatalogoRoleta(
                              atual,
                              modo,
                              grupoCompleto.itens.map((item) => item.chave),
                              marcado,
                            ),
                          )
                        }
                      />
                      <p className="pl-6 text-xs text-app-muted">{grupo.descricao}</p>
                    </div>
                    <Badge color="gray" size="sm">{selecionados}/{grupoCompleto.itens.length}</Badge>
                  </div>
                  <div className="grid gap-1 p-2 sm:grid-cols-2">
                    {grupo.itens.map((item) => {
                      const selecionado = itemSelecionadoRoleta(item.chave, modo, config);
                      const forcarIncompativel =
                        modo === 'TECNICA' &&
                        item.hereditaria &&
                        config.inclusoesCatalogo.includes(item.chave);
                      return (
                        <div key={item.chave} className="rounded-lg bg-app-bg/45 p-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <Checkbox
                              checked={selecionado}
                              onChange={(event) =>
                                setConfig((atual) =>
                                  aplicarSelecaoCatalogoRoleta(
                                    atual,
                                    modo,
                                    [item.chave],
                                    event.target.checked,
                                  ),
                                )
                              }
                              label={item.nome}
                              className="min-w-0"
                            />
                            {item.hereditaria ? <Badge color="purple" size="sm">Hereditária</Badge> : null}
                          </div>
                          {modo === 'TECNICA' && item.hereditaria && selecionado ? (
                            <button
                              type="button"
                              className="mt-2 text-left text-xs font-semibold text-app-primary hover:underline"
                              onClick={() =>
                                setConfig((atual) => ({
                                  ...atual,
                                  inclusoesCatalogo: alternarTexto(
                                    atual.inclusoesCatalogo,
                                    item.chave,
                                  ),
                                }))
                              }
                            >
                              {forcarIncompativel
                                ? 'Permitida mesmo sem compatibilidade'
                                : 'Permitir também sem compatibilidade'}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-app-border p-5 text-center text-sm text-app-muted">
            {busca
              ? 'Nenhum item encontrado nas fontes habilitadas.'
              : 'Habilite uma fonte para explorar o catálogo.'}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div>
          <label className="text-sm font-bold text-app-fg" htmlFor="roleta-lista-manual">
            Lista própria
          </label>
          <p className="text-xs text-app-muted">
            Separe os itens por ponto e vírgula. Repetições aumentam a chance.
          </p>
        </div>
        <textarea
          id="roleta-lista-manual"
          value={config.listaManualTexto}
          maxLength={10_000}
          onChange={(event) =>
            setConfig((atual) => ({ ...atual, listaManualTexto: event.target.value }))
          }
          rows={5}
          placeholder="Exemplo A; Exemplo B; Exemplo A"
          className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-app-fg"
        />
        <p className="text-right text-xs text-app-muted">{config.listaManualTexto.length}/10.000</p>
        {repetidos.length ? (
          <div className="rounded-xl border border-app-warning/30 bg-app-warning/10 p-3">
            <p className="mb-2 text-sm font-bold text-app-warning">Itens repetidos aumentam o peso</p>
            <div className="flex flex-wrap gap-2">
              {repetidos.map((item) => (
                <Badge key={item.nome} color="yellow">{item.nome} ×{item.quantidade}</Badge>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {modo === 'TECNICA' && tecnicasHereditarias.length ? (
        <section className="space-y-3">
          <div>
            <h3 className="font-bold text-app-fg">Compatibilidade hereditária</h3>
            <p className="text-sm text-app-muted">
              Técnicas compatíveis com o clã escolhido recebem peso 2×.
            </p>
          </div>
          {tecnicasHereditarias.map((tecnica) => {
            const mapeamento = config.compatibilidadesHereditarias.find(
              (item) => item.tecnicaChave === tecnica.chave,
            ) ?? { tecnicaChave: tecnica.chave, claChaves: [] };
            return (
              <details key={tecnica.chave} className="rounded-xl border border-app-border p-3">
                <summary className="cursor-pointer text-sm font-bold text-app-fg">
                  {tecnica.nome} · {mapeamento.claChaves.length} clã(s)
                </summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {clas.map((cla) => (
                    <Checkbox
                      key={cla.chave}
                      checked={mapeamento.claChaves.includes(cla.chave)}
                      onChange={() => {
                        const proximo = alternarTexto(mapeamento.claChaves, cla.chave);
                        setConfig((atual) => ({
                          ...atual,
                          compatibilidadesHereditarias: [
                            ...atual.compatibilidadesHereditarias.filter(
                              (item) => item.tecnicaChave !== tecnica.chave,
                            ),
                            { tecnicaChave: tecnica.chave, claChaves: proximo },
                          ].filter((item) => item.claChaves.length > 0),
                        }));
                      }}
                      label={cla.nome}
                    />
                  ))}
                </div>
              </details>
            );
          })}
        </section>
      ) : null}
    </div>
  );

  const permissoes = (
    <section className="space-y-4">
      <div>
        <h3 className="font-bold text-app-fg">Permissões delegadas</h3>
        <p className="text-sm text-app-muted">
          Jogadores podem receber acesso para configurar ou apenas girar. Observadores continuam somente leitura.
        </p>
      </div>
      <div className="space-y-2">
        {estado.catalogo.participantes
          .filter((participante) => participante.papel === 'JOGADOR')
          .map((participante) => {
            const permissao = estado.permissoes.find(
              (item) => item.usuarioId === participante.id,
            );
            return (
              <div key={participante.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app-border px-3 py-3">
                <span className="text-sm font-semibold text-app-fg">{participante.apelido}</span>
                <div className="flex gap-4">
                  <Checkbox
                    checked={permissao?.podeConfigurar ?? false}
                    disabled={pendente}
                    onChange={(event) =>
                      void executar(() =>
                        onPermission(participante.id, {
                          podeConfigurar: event.target.checked,
                          podeGirar: permissao?.podeGirar ?? false,
                        }),
                      )
                    }
                    label="Configurar"
                  />
                  <Checkbox
                    checked={permissao?.podeGirar ?? false}
                    disabled={pendente}
                    onChange={(event) =>
                      void executar(() =>
                        onPermission(participante.id, {
                          podeConfigurar: permissao?.podeConfigurar ?? false,
                          podeGirar: event.target.checked,
                        }),
                      )
                    }
                    label="Girar"
                  />
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Configurar ${preset.slot === 'CUSTOMIZADO' ? 'roleta personalizada' : preset.slot === 'CLA' ? 'sorteio de clã' : 'sorteio de técnica'}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pendente}>Cancelar</Button>
          {aba === 'CONTEUDO' ? (
            <Button
              onClick={() =>
                void executar(async () => {
                  if (resumo.erros.length) throw new Error(resumo.erros[0]);
                  await onSave(modo, config);
                })
              }
              disabled={pendente || resumo.erros.length > 0}
            >
              <Icon name={pendente ? 'spinner' : 'save'} className="mr-2 h-4 w-4" />
              Salvar configuração
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-5">
        {erro ? (
          <div className="rounded-xl border border-app-danger/40 bg-app-danger/10 p-3 text-sm text-app-danger">{erro}</div>
        ) : null}
        {estado.capacidades.podeGerenciarPermissoes ? (
          <div className="grid grid-cols-2 rounded-xl border border-app-border bg-app-bg/45 p-1" role="tablist" aria-label="Configuração da roleta">
            <button
              type="button"
              role="tab"
              aria-selected={aba === 'CONTEUDO'}
              onClick={() => setAba('CONTEUDO')}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${aba === 'CONTEUDO' ? 'bg-app-primary text-white' : 'text-app-muted hover:text-app-fg'}`}
            >
              Conteúdo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={aba === 'PERMISSOES'}
              onClick={() => setAba('PERMISSOES')}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${aba === 'PERMISSOES' ? 'bg-app-primary text-white' : 'text-app-muted hover:text-app-fg'}`}
            >
              Permissões
            </button>
          </div>
        ) : null}
        <div role="tabpanel">{aba === 'CONTEUDO' ? conteudo : permissoes}</div>
      </div>
    </Modal>
  );
}
