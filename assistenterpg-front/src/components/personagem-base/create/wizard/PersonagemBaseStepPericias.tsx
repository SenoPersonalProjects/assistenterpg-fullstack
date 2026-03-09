// components/personagem-base/wizard/PersonagemBaseStepPericias.tsx
'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ClasseCatalogo,
  OrigemCatalogo,
  PericiaCatalogo,
  CreatePersonagemBasePayload,
  PersonagemBasePreview,
  PoderGenericoInstanciaPayload,
  PassivasAtributoConfigFront,
  AtributoBaseCodigo,
} from '@/lib/api';
import { apiPreviewPersonagemBase } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';

import { formatarBonus, calcularBonusGrau } from '@/lib/utils/pericias';

type Props = {
  classes: ClasseCatalogo[];
  origens: OrigemCatalogo[];
  todasPericias: PericiaCatalogo[];

  classeId: string;
  origemId: string;
  claId: string;
  tecnicaInataId: string | null;
  trilhaId: string | null;
  caminhoId: string | null;
  nivel: number;
  estudouEscolaTecnica: boolean;

  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];

  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  atributoChaveEa: string;
  graus: Record<string, number>;
  nome: string;

  prestigioBase: number;
  prestigioClaBase: number | null;
  idade: number | null;
  alinhamentoId: string;
  background: string | null;

  poderesGenericos: PoderGenericoInstanciaPayload[];
  passivasAtributosConfig?: PassivasAtributoConfigFront;
  passivasAtributosAtivos?: AtributoBaseCodigo[];

  periciasLivresExtras: number;

  onChangePericiasLivres: (codigos: string[]) => void;
  onChangePericiasLivresExtras?: (valor: number) => void;
};

export function PersonagemBaseStepPericias(props: Props) {
  const { token } = useAuth();
  const [previewCalculado, setPreviewCalculado] = useState<PersonagemBasePreview | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [buscaLivres, setBuscaLivres] = useState('');
  const [limiteRenderPericias, setLimiteRenderPericias] = useState(80);
  const [previewAberto, setPreviewAberto] = useState(false);
  const buscaLivresDeferred = useDeferredValue(buscaLivres);

  const requestIdRef = useRef(0);

  const listaClasses = useMemo(() => props.classes ?? [], [props.classes]);
  const listaOrigens = useMemo(() => props.origens ?? [], [props.origens]);
  const listaPericias = useMemo(() => props.todasPericias ?? [], [props.todasPericias]);

  const livres = useMemo(() => props.periciasLivresCodigos ?? [], [props.periciasLivresCodigos]);
  const codigosClasse = useMemo(
    () => props.periciasClasseEscolhidasCodigos ?? [],
    [props.periciasClasseEscolhidasCodigos],
  );
  const codigosOrigem = useMemo(
    () => props.periciasOrigemEscolhidasCodigos ?? [],
    [props.periciasOrigemEscolhidasCodigos],
  );

  const classeSelecionada = useMemo(
    () => listaClasses.find((c) => String(c.id) === props.classeId),
    [listaClasses, props.classeId],
  );
  const origemSelecionada = useMemo(
    () => listaOrigens.find((o) => String(o.id) === props.origemId),
    [listaOrigens, props.origemId],
  );

  const periciasOrigem = useMemo(() => origemSelecionada?.pericias ?? [], [origemSelecionada]);
  const periciasClasse = useMemo(() => classeSelecionada?.pericias ?? [], [classeSelecionada]);
  const onChangePericiasLivresExtras = props.onChangePericiasLivresExtras;

  const periciasFixasOrigem = useMemo(
    () => periciasOrigem.filter((op) => op.tipo === 'FIXA').map((op) => op.pericia) ?? [],
    [periciasOrigem],
  );
  const periciasFixasClasse = useMemo(
    () => periciasClasse.filter((cp) => cp.tipo === 'FIXA').map((cp) => cp.pericia) ?? [],
    [periciasClasse],
  );

  const codigosFixos = useMemo(() => {
    return new Set<string>([
      ...periciasFixasOrigem.map((p) => p.codigo),
      ...periciasFixasClasse.map((p) => p.codigo),
      ...codigosClasse,
      ...codigosOrigem,
      ...(props.estudouEscolaTecnica ? ['JUJUTSU'] : []),
    ]);
  }, [
    periciasFixasOrigem,
    periciasFixasClasse,
    codigosClasse,
    codigosOrigem,
    props.estudouEscolaTecnica,
  ]);

  const periciasGarantidas = useMemo(() => {
    return listaPericias.filter((p) => codigosFixos.has(p.codigo));
  }, [listaPericias, codigosFixos]);

  const livresBaseClasse = classeSelecionada?.periciasLivresBase ?? 0;
  const livresMax = useMemo(() => {
    if (previewCalculado?.periciasLivresInfo) {
      return previewCalculado.periciasLivresInfo.total;
    }
    return Math.max(0, livresBaseClasse + props.intelecto);
  }, [previewCalculado, livresBaseClasse, props.intelecto]);

  const periciasOrdenadas = useMemo(() => {
    return [...listaPericias].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [listaPericias]);

  // Filtro de busca
  const periciasFiltradasBusca = useMemo(() => {
    if (!buscaLivresDeferred.trim()) return periciasOrdenadas;
    const termo = buscaLivresDeferred.toLowerCase().trim();
    return periciasOrdenadas.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.codigo.toLowerCase().includes(termo),
    );
  }, [periciasOrdenadas, buscaLivresDeferred]);

  const periciasRenderizadas = useMemo(
    () => periciasFiltradasBusca.slice(0, limiteRenderPericias),
    [periciasFiltradasBusca, limiteRenderPericias],
  );

  function obterFontePericia(codigo: string): {
    label: string;
    cor: string;
  } | null {
    if (props.estudouEscolaTecnica && codigo === 'JUJUTSU')
      return { label: 'Escola', cor: 'bg-purple-500/10 text-purple-600' };
    if (periciasFixasOrigem.some((p) => p.codigo === codigo))
      return { label: 'Origem', cor: 'bg-blue-500/10 text-blue-600' };
    if (periciasFixasClasse.some((p) => p.codigo === codigo))
      return { label: 'Classe', cor: 'bg-green-500/10 text-green-600' };
    if (codigosOrigem.includes(codigo))
      return { label: 'Origem', cor: 'bg-blue-500/10 text-blue-600' };
    if (codigosClasse.includes(codigo))
      return { label: 'Classe', cor: 'bg-green-500/10 text-green-600' };
    return null;
  }

  function togglePericiaLivre(codigo: string) {
    if (codigosFixos.has(codigo)) return;

    const jaSelecionada = livres.includes(codigo);

    if (jaSelecionada) {
      props.onChangePericiasLivres(livres.filter((c) => c !== codigo));
      return;
    }

    if (livres.length >= livresMax) return;

    props.onChangePericiasLivres([...livres, codigo]);
  }

  const payloadPreview = useMemo<CreatePersonagemBasePayload | null>(() => {
    if (!props.classeId || !props.origemId || !props.claId) return null;

    const payload: CreatePersonagemBasePayload = {
      nome: props.nome || 'Preview',
      nivel: props.nivel,
      claId: Number(props.claId),
      origemId: Number(props.origemId),
      classeId: Number(props.classeId),
      trilhaId: props.trilhaId ? Number(props.trilhaId) : null,
      caminhoId: props.caminhoId ? Number(props.caminhoId) : null,

      agilidade: props.agilidade,
      forca: props.forca,
      intelecto: props.intelecto,
      presenca: props.presenca,
      vigor: props.vigor,

      estudouEscolaTecnica: props.estudouEscolaTecnica,
      tecnicaInataId: props.tecnicaInataId ? Number(props.tecnicaInataId) : null,

      atributoChaveEa: props.atributoChaveEa as 'INT' | 'PRE',

      prestigioBase: props.prestigioBase,
      prestigioClaBase: props.prestigioClaBase,
      idade: props.idade,

      alinhamentoId: props.alinhamentoId ? Number(props.alinhamentoId) : null,
      background: props.background,

      periciasClasseEscolhidasCodigos: codigosClasse,
      periciasOrigemEscolhidasCodigos: codigosOrigem,
      periciasLivresCodigos: livres,

      periciasLivresExtras: props.periciasLivresExtras ?? 0,

      grausAprimoramento: Object.entries(props.graus).map(([tipoGrauCodigo, valor]) => ({
        tipoGrauCodigo,
        valor,
      })),

      grausTreinamento: [],
      proficienciasCodigos: [],

      poderesGenericos:
        props.poderesGenericos?.length
          ? (props.poderesGenericos as PoderGenericoInstanciaPayload[])
          : undefined,
      passivasAtributosConfig:
        props.passivasAtributosConfig && Object.keys(props.passivasAtributosConfig).length > 0
          ? props.passivasAtributosConfig
          : undefined,
      passivasAtributosAtivos:
        props.passivasAtributosAtivos && props.passivasAtributosAtivos.length > 0
          ? props.passivasAtributosAtivos
          : undefined,
    };

    return payload;
  }, [
    props.classeId,
    props.origemId,
    props.claId,
    props.trilhaId,
    props.caminhoId,
    props.nome,
    props.nivel,
    props.agilidade,
    props.forca,
    props.intelecto,
    props.presenca,
    props.vigor,
    props.estudouEscolaTecnica,
    props.tecnicaInataId,
    props.atributoChaveEa,
    props.prestigioBase,
    props.prestigioClaBase,
    props.idade,
    props.alinhamentoId,
    props.background,
    props.graus,
    props.poderesGenericos,
    props.passivasAtributosConfig,
    props.passivasAtributosAtivos,
    props.periciasLivresExtras,
    codigosClasse,
    codigosOrigem,
    livres,
  ]);

  // Preview com debounce
  useEffect(() => {
    if (!token || !payloadPreview) {
      queueMicrotask(() => setPreviewCalculado(null));
      onChangePericiasLivresExtras?.(0);
      return;
    }

    const requestId = ++requestIdRef.current;
    queueMicrotask(() => setCarregando(true));

    const timeout = setTimeout(() => {
      apiPreviewPersonagemBase(payloadPreview)
        .then((res) => {
          if (requestId !== requestIdRef.current) return;
          setPreviewCalculado(res);

          const extra = res.periciasLivresInfo?.deIntelecto ?? 0;
          onChangePericiasLivresExtras?.(extra);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setPreviewCalculado(null);
          onChangePericiasLivresExtras?.(0);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setCarregando(false);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [token, payloadPreview, onChangePericiasLivresExtras]);

  const limiteAtingido = livresMax > 0 && livres.length >= livresMax;
  const proximoDoLimite = livresMax > 0 && livres.length >= livresMax - 1 && livres.length < livresMax;

  const periciasLivresInfo = previewCalculado?.periciasLivresInfo;
  const livreBaseCount = periciasLivresInfo?.base ?? Math.max(0, livresBaseClasse + props.intelecto);
  const livreIntelectoCount = periciasLivresInfo?.deIntelecto ?? 0;

  // helpers Intelecto
  function veioDeIntelectoI(codigo: string): boolean {
    if (props.intelecto < 3) return false;
    if (!props.passivasAtributosAtivos?.includes('INT')) return false;
    const cfgIntI = props.passivasAtributosConfig?.INT_I;
    if (!cfgIntI) return false;
    return cfgIntI.periciaCodigoTreino === codigo;
  }

  function veioDeIntelectoII(codigo: string): boolean {
    if (props.intelecto < 6) return false;
    if (!props.passivasAtributosAtivos?.includes('INT')) return false;
    const cfgIntII = props.passivasAtributosConfig?.INT_II;
    if (!cfgIntII) return false;
    return cfgIntII.periciaCodigoTreino === codigo;
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Perícias"
        right={<Icon name="list" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-4"
      >
        {/* 1. GARANTIDAS (sempre visíveis, compactas) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="check" className="w-4 h-4 text-app-success" />
            <p className="text-sm font-medium text-app-fg">
              Perícias garantidas ({periciasGarantidas.length})
            </p>
          </div>
          <p className="text-xs text-app-muted">
            Vêm da origem/classe. Não podem ser removidas.
          </p>

          {periciasGarantidas.length === 0 ? (
            <EmptyState
              variant="card"
              icon="info"
              title="Nenhuma perícia garantida"
              description="Selecione origem/classe para preencher esta lista."
            />
          ) : (
            <div className="rounded border border-app-border bg-app-surface p-2">
              <div className="flex flex-wrap gap-1.5">
                {periciasGarantidas.map((p) => {
                  const fonte = obterFontePericia(p.codigo);
                  return (
                    <div
                      key={p.id}
                      className="inline-flex items-center gap-1.5 rounded border border-app-border bg-app-bg px-2 py-0.5 text-xs"
                    >
                      <span className="font-medium text-app-fg">{p.nome}</span>
                      {fonte ? (
                        <span className={`text-[10px] rounded px-1 py-0.5 ${fonte.cor}`}>
                          {fonte.label}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. LIVRES (principal interação) */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Icon name="sparkles" className="w-4 h-4 text-app-warning" />
                <p className="text-sm font-medium text-app-fg">Perícias livres</p>
              </div>
              <p className="text-xs text-app-muted mt-1">
                Escolha até <span className="font-medium text-app-fg">{livresMax}</span> perícia(s).
              </p>
              <p className="text-[11px] text-app-muted mt-0.5">
                Base: {livreBaseCount}
                {livreIntelectoCount > 0 && (
                  <span className="text-app-warning"> + {livreIntelectoCount} (passivas)</span>
                )}
              </p>
            </div>

            {livresMax > 0 && (
              <div
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  limiteAtingido
                    ? 'bg-app-danger/10 text-app-danger border border-app-danger/30'
                    : proximoDoLimite
                    ? 'bg-app-warning/10 text-app-warning border border-app-warning/30'
                    : 'bg-app-border text-app-muted'
                }`}
              >
                {livres.length}/{livresMax}
              </div>
            )}
          </div>

          {livresMax === 0 ? (
            <EmptyState
              variant="card"
              icon="info"
              title="Sem perícias livres"
              description="Sua classe não concede perícias livres e não há bônus de atributos."
            />
          ) : (
            <>
              {/* Busca */}
              <Input
                type="text"
                placeholder="Buscar perícia por nome ou código..."
                value={buscaLivres}
                onChange={(e) => {
                  setBuscaLivres(e.target.value);
                  setLimiteRenderPericias(80);
                }}
                icon="search"
              />

              {/* Lista com checkboxes */}
              <div className="max-h-80 overflow-y-auto rounded border border-app-border bg-app-surface">
                {periciasFiltradasBusca.length === 0 ? (
                  <div className="p-4 text-center text-xs text-app-muted">
                    Nenhuma perícia encontrada para &quot;{buscaLivres}&quot;
                  </div>
                ) : (
                  <div className="divide-y divide-app-border">
                    {periciasRenderizadas.map((p) => {
                      const ehGarantida = codigosFixos.has(p.codigo);
                      const selecionadaLivre = livres.includes(p.codigo);
                      const disabled = ehGarantida || (!selecionadaLivre && limiteAtingido);

                      return (
                        <div
                          key={p.id}
                          className={`px-3 py-2 transition-colors hover:bg-app-border/30 ${
                            disabled && !ehGarantida ? 'opacity-40' : ''
                          }`}
                        >
                          <Checkbox
                            label={
                              <span className="text-xs flex items-center gap-2">
                                <span className="text-app-fg font-medium">{p.nome}</span>
                                <span className="text-app-muted text-[10px]">({p.codigo})</span>
                                {ehGarantida && (
                                  <span className="text-[10px] rounded px-1.5 py-0.5 bg-app-success/10 text-app-success">
                                    garantida
                                  </span>
                                )}
                              </span>
                            }
                            checked={ehGarantida || selecionadaLivre}
                            disabled={disabled}
                            onChange={() => togglePericiaLivre(p.codigo)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {periciasFiltradasBusca.length > limiteRenderPericias && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() =>
                    setLimiteRenderPericias((atual) =>
                      Math.min(periciasFiltradasBusca.length, atual + 80),
                    )
                  }
                >
                  Mostrar mais ({periciasFiltradasBusca.length - limiteRenderPericias} restantes)
                </Button>
              )}
            </>
          )}
        </div>

        {/* 3. PREVIEW CALCULADAS (collapse) */}
        <div className="rounded border border-app-border bg-app-elevated">
          <button
            type="button"
            onClick={() => setPreviewAberto(!previewAberto)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-app-border/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="calculator" className="w-4 h-4 text-app-muted" />
              <span className="text-sm font-medium text-app-fg">
                Preview calculado{' '}
                {previewCalculado && (
                  <span className="text-xs text-app-muted">
                    ({previewCalculado.pericias.length} perícias)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {carregando && (
                <Icon name="spinner" className="w-4 h-4 animate-spin text-app-muted" />
              )}
              <Icon
                name="chevron-down"
                className={`w-4 h-4 text-app-muted transition-transform ${
                  previewAberto ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {previewAberto && (
            <div className="border-t border-app-border p-3">
              <p className="text-xs text-app-muted mb-3">
                Todas as perícias com bônus calculados (incluindo atributos e passivas).
              </p>

              {!previewCalculado || previewCalculado.pericias.length === 0 ? (
                <EmptyState
                  variant="card"
                  icon="info"
                  title="Sem preview"
                  description="Complete os steps anteriores para calcular as perícias."
                />
              ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {previewCalculado.pericias.map((p) => {
                    const grauBase = calcularBonusGrau(p.grauTreinamento, p.bonusExtra);
                    const bonusAtributo = p.bonusTotal - grauBase;
                    const fonte = obterFontePericia(p.codigo);
                    const intIAtivo = veioDeIntelectoI(p.codigo);
                    const intIIAtivo = veioDeIntelectoII(p.codigo);

                    return (
                      <li
                        key={p.codigo}
                        className="rounded border border-app-border bg-app-surface p-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-app-fg">{p.nome}</span>
                              <span className="text-[10px] text-app-muted">
                                ({p.codigo}) {p.atributoBase}
                              </span>
                              {fonte && (
                                <span className={`text-[10px] rounded px-1.5 py-0.5 ${fonte.cor}`}>
                                  {fonte.label}
                                </span>
                              )}
                              {intIAtivo && (
                                <span className="text-[10px] rounded px-1.5 py-0.5 bg-amber-500/10 text-amber-600">
                                  INT I
                                </span>
                              )}
                              {intIIAtivo && (
                                <span className="text-[10px] rounded px-1.5 py-0.5 bg-amber-500/10 text-amber-600">
                                  INT II
                                </span>
                              )}
                            </div>
                            {(p.bonusExtra > 0 || bonusAtributo !== 0) && (
                              <p className="mt-1 text-[10px] text-app-muted">
                                Grau: {grauBase}
                                {p.bonusExtra > 0 && ` + ${p.bonusExtra} (fonte duplicada)`}
                                {bonusAtributo !== 0 && ` ${formatarBonus(bonusAtributo)} (atributo)`}
                              </p>
                            )}
                          </div>

                          <span className="shrink-0 text-app-success font-semibold text-base">
                            {formatarBonus(p.bonusTotal)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
