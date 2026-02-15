'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  apiGetPassivasDisponiveis,
  type AtributoBaseCodigo,
  type PassivaAtributoCatalogo,
  type PassivasAtributoConfigFront,
  type PericiaCatalogo,
  type ProficienciaCatalogo,
  type TipoGrauCatalogo,
  type PersonagemBasePreview,
} from '@/lib/api';
import { Checkbox } from '@/components/ui/Checkbox';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Alert';

type Props = {
  atributos: {
    agilidade: number;
    forca: number;
    intelecto: number;
    presenca: number;
    vigor: number;
  };

  ativos: AtributoBaseCodigo[];
  onToggle: (atributo: AtributoBaseCodigo) => void;

  escolhasConfig: PassivasAtributoConfigFront;
  onChangeEscolha: (config: PassivasAtributoConfigFront) => void;

  todasPericias: PericiaCatalogo[];
  todasProficiencias: ProficienciaCatalogo[];
  tiposGrau: TipoGrauCatalogo[];

  profsFinaisCodigos: string[];
  previewBase: PersonagemBasePreview | null;
};

type AtributoKeyApi = 'AGILIDADE' | 'FORCA' | 'INTELECTO' | 'PRESENCA' | 'VIGOR';

const ATRIBUTO_LABEL: Record<AtributoBaseCodigo, string> = {
  AGI: 'Agilidade',
  FOR: 'Força',
  INT: 'Intelecto',
  PRE: 'Presença',
  VIG: 'Vigor',
};

const BASE_TO_VALUE_KEY: Record<AtributoBaseCodigo, keyof Props['atributos']> = {
  AGI: 'agilidade',
  FOR: 'forca',
  INT: 'intelecto',
  PRE: 'presenca',
  VIG: 'vigor',
};

const BASE_TO_API: Record<AtributoBaseCodigo, AtributoKeyApi> = {
  AGI: 'AGILIDADE',
  FOR: 'FORCA',
  INT: 'INTELECTO',
  PRE: 'PRESENCA',
  VIG: 'VIGOR',
};

function tiersPorValor(valor: number): Array<1 | 2> {
  if (valor >= 6) return [2];
  if (valor >= 3) return [1];
  return [];
}

type IntConfig = NonNullable<PassivasAtributoConfigFront['INT_I']>;
type IntConfigII = NonNullable<PassivasAtributoConfigFront['INT_II']>;

function IntelectoChoicesPanel(props: {
  valorIntelecto: number;
  config: PassivasAtributoConfigFront;
  onChangeConfig: (config: PassivasAtributoConfigFront) => void;
  todasPericias: PericiaCatalogo[];
  todasProficiencias: ProficienciaCatalogo[];
  tiposGrau: TipoGrauCatalogo[];
  profsFinaisCodigos: string[];
  previewBase: PersonagemBasePreview | null;
}) {
  const {
    valorIntelecto,
    config,
    onChangeConfig,
    todasPericias,
    todasProficiencias,
    tiposGrau,
    profsFinaisCodigos,
    previewBase,
  } = props;

  const temIntII = valorIntelecto >= 6;
  const temIntI = valorIntelecto >= 3 && valorIntelecto < 6;

  const intI: IntConfig = config.INT_I ?? {};
  const intII: IntConfigII = config.INT_II ?? {};

  const profsIntI = intI.proficienciasCodigos ?? [];
  const profsIntII = intII.proficienciasCodigos ?? [];

  const maxEscolhasIntII = 2;

  const profsDisponiveis = useMemo(() => {
    const escolhidasNasPassivas = new Set([...profsIntI, ...profsIntII]);

    return todasProficiencias.filter((p) => {
      if (escolhidasNasPassivas.has(p.codigo)) return true;
      return !profsFinaisCodigos.includes(p.codigo);
    });
  }, [todasProficiencias, profsFinaisCodigos, profsIntI, profsIntII]);

  const periciasNaoExpert = useMemo(() => {
    if (!previewBase?.pericias) return todasPericias;
    const expertCodigos = new Set(
      previewBase.pericias
        .filter((p) => p.grauTreinamento >= 4)
        .map((p) => p.codigo),
    );
    return todasPericias.filter((p) => !expertCodigos.has(p.codigo));
  }, [previewBase, todasPericias]);

  function atualizarIntI(partial: Partial<IntConfig>) {
    onChangeConfig({
      ...config,
      INT_I: { ...intI, ...partial },
    });
  }

  function atualizarIntII(partial: Partial<IntConfigII>) {
    onChangeConfig({
      ...config,
      INT_II: { ...intII, ...partial },
    });
  }

  return (
    <div className="mt-3 space-y-3 rounded border border-app-border bg-app-surface p-3">
      <p className="text-xs font-semibold text-app-fg flex items-center gap-2">
        <Icon name="rules" className="w-4 h-4 text-app-primary" />
        Escolhas de Intelecto
      </p>

      {temIntI && (
        <div className="space-y-3">
          <p className="text-xs text-app-muted">
            <strong>Intelecto I:</strong> +1 perícia livre ou 1 proficiência extra, e +1 grau de treinamento.
          </p>

          <Select
            label="Proficiência extra (opcional)"
            value={profsIntI[0] ?? ''}
            onChange={(e) => {
              const codigo = e.target.value || undefined;
              atualizarIntI({
                proficienciasCodigos: codigo ? [codigo] : [],
              });
            }}
            helperText="Deixe vazio para ganhar +1 perícia livre"
          >
            <option value="">Nenhuma (perícia livre)</option>
            {profsDisponiveis.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nome}
              </option>
            ))}
          </Select>

          {(!profsIntI[0] || profsIntI[0] === '') && (
            <p className="text-xs text-app-success flex items-center gap-2">
              <Icon name="check" className="w-3.5 h-3.5" />
              Você receberá +1 perícia livre no passo de Perícias
            </p>
          )}

          <Select
            label="Perícia que recebe +1 grau *"
            value={intI.periciaCodigoTreino ?? ''}
            onChange={(e) =>
              atualizarIntI({
                periciaCodigoTreino: e.target.value || undefined,
              })
            }
            helperText={periciasNaoExpert.length < todasPericias.length ? 'Perícias Expert não aparecem' : undefined}
          >
            <option value="">Selecione uma perícia</option>
            {periciasNaoExpert.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nome}
              </option>
            ))}
          </Select>
        </div>
      )}

      {temIntII && (
        <div className="space-y-3">
          <p className="text-xs text-app-muted">
            <strong>Intelecto II:</strong> Até +2 perícias livres ou proficiências (máx. 2 total), +1 grau de treinamento e +1 grau de aprimoramento.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-fg">
              Proficiências extras (máx. 2)
            </label>

            <div className="max-h-40 overflow-y-auto rounded border border-app-border bg-app-surface p-2 space-y-1">
              {profsDisponiveis.map((p) => {
                const selecionada = profsIntII.includes(p.codigo);
                const limiteAtingido = !selecionada && profsIntII.length >= maxEscolhasIntII;

                return (
                  <Checkbox
                    key={p.codigo}
                    label={p.nome}
                    checked={selecionada}
                    disabled={limiteAtingido}
                    onChange={() => {
                      if (selecionada) {
                        atualizarIntII({
                          proficienciasCodigos: profsIntII.filter((c) => c !== p.codigo),
                        });
                      } else if (!limiteAtingido) {
                        atualizarIntII({
                          proficienciasCodigos: [...profsIntII, p.codigo],
                        });
                      }
                    }}
                  />
                );
              })}
            </div>

            {profsIntII.length < maxEscolhasIntII && (
              <p className="text-xs text-app-success flex items-center gap-2">
                <Icon name="check" className="w-3.5 h-3.5" />
                +{maxEscolhasIntII - profsIntII.length} perícia(s) livre(s) disponível(is)
              </p>
            )}
          </div>

          <Select
            label="Perícia que recebe +1 grau *"
            value={intII.periciaCodigoTreino ?? ''}
            onChange={(e) =>
              atualizarIntII({
                periciaCodigoTreino: e.target.value || undefined,
              })
            }
          >
            <option value="">Selecione uma perícia</option>
            {periciasNaoExpert.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nome}
              </option>
            ))}
          </Select>

          <Select
            label="Grau de aprimoramento +1 *"
            value={intII.tipoGrauCodigoAprimoramento ?? ''}
            onChange={(e) =>
              atualizarIntII({
                tipoGrauCodigoAprimoramento: e.target.value || undefined,
              })
            }
          >
            <option value="">Selecione um grau</option>
            {tiposGrau.map((t) => (
              <option key={t.codigo} value={t.codigo}>
                {t.nome}
              </option>
            ))}
          </Select>
        </div>
      )}

      {!temIntI && !temIntII && (
        <p className="text-xs text-app-muted">
          Intelecto precisa ser 3+ para ativar passivas.
        </p>
      )}
    </div>
  );
}

export function PassivasAtributosSelector({
  atributos,
  ativos,
  onToggle,
  escolhasConfig,
  onChangeEscolha,
  todasPericias,
  todasProficiencias,
  tiposGrau,
  profsFinaisCodigos,
  previewBase,
}: Props) {
  const { token } = useAuth();

  const [passivas, setPassivas] = useState<
    Record<AtributoKeyApi, PassivaAtributoCatalogo[]>
  >({
    AGILIDADE: [],
    FORCA: [],
    INTELECTO: [],
    PRESENCA: [],
    VIGOR: [],
  });

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setErro(null);
        setLoading(true);
        const data = await apiGetPassivasDisponiveis();
        setPassivas(data);
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar passivas');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const atributosDisponiveis = useMemo(() => {
    const all: AtributoBaseCodigo[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];
    return all.filter((a) => atributos[BASE_TO_VALUE_KEY[a]] >= 3);
  }, [atributos]);

  useEffect(() => {
    const novoConfig: PassivasAtributoConfigFront = { ...escolhasConfig };

    const valorInt = atributos.intelecto ?? 0;
    const intAtivo = ativos.includes('INT');

    if (!intAtivo || valorInt < 3) {
      delete (novoConfig as any).INT_I;
      delete (novoConfig as any).INT_II;
    } else if (valorInt >= 3 && valorInt < 6) {
      if (!novoConfig.INT_I) {
        novoConfig.INT_I = {};
      }
      delete (novoConfig as any).INT_II;
    } else if (valorInt >= 6) {
      delete (novoConfig as any).INT_I;
      if (!novoConfig.INT_II) {
        novoConfig.INT_II = {};
      }
    }

    if (JSON.stringify(novoConfig) !== JSON.stringify(escolhasConfig)) {
      onChangeEscolha(novoConfig);
    }
  }, [atributos, ativos, escolhasConfig, onChangeEscolha]);

  if (loading) return <Loading />;
  if (erro) return <ErrorAlert message={erro} />;

  if (atributosDisponiveis.length === 0) {
    return (
      <p className="text-sm text-app-muted">
        Você precisa ter pelo menos um atributo com valor{' '}
        <strong>3 ou mais</strong> para desbloquear passivas.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-app-muted space-y-1">
        <p>• Escolha até <strong>2 atributos</strong> para ativar passivas</p>
        <p>• Valor 3–5: <strong>Nível I</strong> • Valor 6–7: <strong>Nível II</strong></p>
      </div>

      <div className="space-y-3">
        {atributosDisponiveis.map((atributo) => {
          const valor = atributos[BASE_TO_VALUE_KEY[atributo]];
          const tiers = tiersPorValor(valor);

          const apiKey = BASE_TO_API[atributo];
          const lista = passivas[apiKey] ?? [];

          const passivasAplicadas = lista
            .filter((p) => tiers.includes(p.nivel as 1 | 2))
            .sort((a, b) => a.nivel - b.nivel);

          const selecionado = ativos.includes(atributo);
          const podeSelecionar = selecionado || ativos.length < 2;

          const isIntelecto = atributo === 'INT';

          return (
            <div
              key={atributo}
              className={`rounded border p-3 transition-all ${
                selecionado
                  ? 'border-app-primary/50 bg-app-primary/5'
                  : 'border-app-border bg-app-surface'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    label=""
                    checked={selecionado}
                    onChange={() => onToggle(atributo)}
                    disabled={!podeSelecionar}
                  />
                  <div>
                    <p className="text-sm font-semibold text-app-fg">
                      {ATRIBUTO_LABEL[atributo]}
                    </p>
                    <p className="text-xs text-app-muted">Valor: {valor}</p>
                  </div>
                </div>

                {!podeSelecionar && (
                  <p className="text-xs text-app-danger">Máximo atingido</p>
                )}
              </div>

              {passivasAplicadas.length === 0 ? (
                <p className="mt-2 text-xs text-app-muted">
                  Nenhuma passiva aplicável (precisa de 3+).
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {passivasAplicadas.map((p) => {
                    const efeitos = p.efeitos as any;
                    const temEscolha =
                      efeitos && typeof efeitos === 'object' && 'escolha' in efeitos;
                    const opcoes = temEscolha
                      ? (efeitos.escolha as Array<{
                          descricao: string;
                          [key: string]: any;
                        }>)
                      : null;

                    const escolhaSelecionada =
                      (escolhasConfig as any).passivaIdToIndex?.[p.id] ?? 0;

                    return (
                      <div
                        key={p.id}
                        className="rounded border border-app-border bg-app-bg p-2"
                      >
                        <p className="text-xs font-semibold text-app-fg">
                          {p.nome} {p.nivel === 2 ? '(II)' : '(I)'}
                        </p>
                        <p className="mt-1 text-xs text-app-muted leading-relaxed">
                          {p.descricao}
                        </p>

                        {temEscolha &&
                          opcoes &&
                          opcoes.length > 0 &&
                          selecionado &&
                          !isIntelecto && (
                            <div className="mt-2 space-y-2">
                              <Select
                                label="Escolha o efeito"
                                value={escolhaSelecionada.toString()}
                                onChange={(e) => {
                                  const novaEscolha = parseInt(e.target.value, 10);

                                  const antigo =
                                    (escolhasConfig as any).passivaIdToIndex ?? {};
                                  const novoConfig: PassivasAtributoConfigFront = {
                                    ...escolhasConfig,
                                    passivaIdToIndex: {
                                      ...antigo,
                                      [p.id]: novaEscolha,
                                    },
                                  } as any;

                                  onChangeEscolha(novoConfig);
                                }}
                              >
                                {opcoes.map((opcao, idx) => (
                                  <option key={idx} value={idx}>
                                    {opcao.descricao}
                                  </option>
                                ))}
                              </Select>

                              {opcoes[escolhaSelecionada] &&
                                (() => {
                                  const escolhaObj = opcoes[escolhaSelecionada];
                                  const efeitosNumericos = Object.entries(
                                    escolhaObj,
                                  ).filter(
                                    ([k, v]) =>
                                      k !== 'descricao' && typeof v === 'number',
                                  );

                                  if (efeitosNumericos.length > 0) {
                                    return (
                                      <div className="text-xs text-app-muted">
                                        {efeitosNumericos.map(([key, value]) => (
                                          <p key={key} className="text-app-success">
                                            • {key}: <strong>+{String(value)}</strong>
                                          </p>
                                        ))}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                            </div>
                          )}

                        {!temEscolha &&
                          efeitos &&
                          typeof efeitos === 'object' &&
                          Object.keys(efeitos).length > 0 && (
                            <div className="mt-2 text-xs text-app-muted">
                              {Object.entries(efeitos).map(([key, value]) => (
                                <p key={key} className="text-app-success">
                                  • {key}: <strong>+{String(value)}</strong>
                                </p>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })}

                  {isIntelecto && selecionado && (
                    <IntelectoChoicesPanel
                      valorIntelecto={valor}
                      config={escolhasConfig}
                      onChangeConfig={onChangeEscolha}
                      todasPericias={todasPericias}
                      todasProficiencias={todasProficiencias}
                      tiposGrau={tiposGrau}
                      profsFinaisCodigos={profsFinaisCodigos}
                      previewBase={previewBase}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
