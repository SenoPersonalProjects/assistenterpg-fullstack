// components/personagem-base/create/wizard/PersonagemBaseStepPoderes.tsx
'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  apiGetPoderesGenericos,
  apiPreviewPersonagemBase,
  type PoderGenericoCatalogo,
  type CreatePersonagemBasePayload,
  type PersonagemBasePreview,
  type GrauTreinamento,
  type PoderGenericoInstanciaPayload,
  type PericiaCatalogo,
  type TipoGrauCatalogo,
  type PassivasAtributoConfigFront,
  type AtributoBaseCodigo,
} from '@/lib/api';
import { validarRequisitosPoder, calcularSlotsPoderes } from '@/lib/utils/poderes';
import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

type Props = {
  nivel: number;
  poderesGenericos: PoderGenericoInstanciaPayload[];
  onTogglePoderGenerico: (id: number) => void;
  addPoderGenericoInstancia?: (id: number, config?: Record<string, unknown>) => void;
  removePoderGenericoInstancia?: (index: number) => void;
  updatePoderGenericoInstancia?: (index: number, partialConfig: Record<string, unknown>) => void;

  nome: string;
  classeId: string;
  origemId: string;
  claId: string;
  tecnicaInataId: string | null;
  trilhaId: string | null;
  caminhoId: string | null;
  estudouEscolaTecnica: boolean;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  atributoChaveEa: string;
  graus: Record<string, number>;
  prestigioBase: number;
  prestigioClaBase: number | null;
  idade: number | null;
  alinhamentoId: string;
  background: string | null;
  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];
  grausTreinamento: GrauTreinamento[];

  todasPericias: PericiaCatalogo[];
  tiposGrau: TipoGrauCatalogo[];

  passivasAtributosConfig?: PassivasAtributoConfigFront;
  passivasAtributosAtivos?: AtributoBaseCodigo[];
};

type PoderGenericoConfig = Record<string, unknown> & {
  periciasCodigos?: string[];
  proficiencias?: string[];
  tipoGrauCodigo?: string;
};

type MecanicasEscolha = {
  tipo?: string;
  quantidade?: number;
};

type MecanicasEspeciais = {
  repetivel?: boolean;
  escolha?: MecanicasEscolha;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function parseMecanicasEspeciais(value: unknown): MecanicasEspeciais | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const escolhaRaw = asRecord(record.escolha);
  const escolha: MecanicasEscolha | undefined = escolhaRaw
    ? {
        tipo: typeof escolhaRaw.tipo === 'string' ? escolhaRaw.tipo : undefined,
        quantidade: typeof escolhaRaw.quantidade === 'number' ? escolhaRaw.quantidade : undefined,
      }
    : undefined;

  return {
    repetivel: record.repetivel === true,
    escolha,
  };
}

function sanitizarPassivasConfig(
  config: PassivasAtributoConfigFront | undefined,
): PassivasAtributoConfigFront | undefined {
  if (!config) return undefined;

  const sanitizado: PassivasAtributoConfigFront = { ...config };

  if (sanitizado.INT_I && !sanitizado.INT_I.periciaCodigoTreino) {
    delete sanitizado.INT_I;
  }

  if (sanitizado.INT_II && !sanitizado.INT_II.periciaCodigoTreino) {
    delete sanitizado.INT_II;
  }

  const temConfig = Object.keys(sanitizado).some(
    (k) => k !== 'passivaIdToIndex' && sanitizado[k as keyof PassivasAtributoConfigFront]
  );

  return temConfig || sanitizado.passivaIdToIndex ? sanitizado : undefined;
}

function sanitizarGrausTreinamento(
  grausTreinamento: GrauTreinamento[],
): GrauTreinamento[] | undefined {
  if (!grausTreinamento || grausTreinamento.length === 0) return undefined;

  const sanitizados = grausTreinamento
    .map((gt) => ({
      ...gt,
      melhorias: gt.melhorias.filter((m) => m.periciaCodigo && m.periciaCodigo.trim() !== ''),
    }))
    .filter((gt) => gt.melhorias.length > 0);

  return sanitizados.length > 0 ? sanitizados : undefined;
}

function sanitizarPoderesGenericos(
  poderes: PoderGenericoInstanciaPayload[],
  catalogoPoderes?: PoderGenericoCatalogo[],
): PoderGenericoInstanciaPayload[] | undefined {
  if (!poderes || poderes.length === 0) return undefined;

  const validos = poderes
    .map((inst) => {
      const poderDb = catalogoPoderes?.find((p) => p.id === inst.habilidadeId);
      const mecanicas = parseMecanicasEspeciais(poderDb?.mecanicasEspeciais);
      const exigeEscolha = mecanicas?.escolha !== undefined;

      if (!exigeEscolha) {
        return { ...inst, config: inst.config ?? {} };
      }

      const configInicial = asRecord(inst.config);
      if (!configInicial || Object.keys(configInicial).length === 0) return null;

      const cfg: PoderGenericoConfig = { ...configInicial };

      if ('periciasCodigos' in cfg) {
        const pericias = toStringArray(cfg.periciasCodigos);

        let quantidadeEsperada = 2;
        if (typeof mecanicas?.escolha?.quantidade === 'number') {
          quantidadeEsperada = mecanicas.escolha.quantidade;
        }

        if (pericias.length < quantidadeEsperada) return null;
        cfg.periciasCodigos = pericias;
      }

      if ('proficiencias' in cfg) {
        const profs = toStringArray(cfg.proficiencias);

        if (profs.length === 0) return null;
        cfg.proficiencias = profs;
      }

      if ('tipoGrauCodigo' in cfg) {
        const tg = cfg.tipoGrauCodigo;
        if (!tg || String(tg).trim() === '') return null;
      }

      return { ...inst, config: cfg };
    })
    .filter((inst) => inst !== null) as PoderGenericoInstanciaPayload[];

  return validos.length > 0 ? validos : undefined;
}

export function PersonagemBaseStepPoderes({
  nivel,
  poderesGenericos,
  addPoderGenericoInstancia,
  removePoderGenericoInstancia,
  updatePoderGenericoInstancia,
  nome,
  classeId,
  origemId,
  claId,
  tecnicaInataId,
  trilhaId,
  caminhoId,
  estudouEscolaTecnica,
  agilidade,
  forca,
  intelecto,
  presenca,
  vigor,
  atributoChaveEa,
  graus,
  prestigioBase,
  prestigioClaBase,
  idade,
  alinhamentoId,
  background,
  periciasClasseEscolhidasCodigos,
  periciasOrigemEscolhidasCodigos,
  periciasLivresCodigos,
  grausTreinamento,
  todasPericias,
  tiposGrau,
  passivasAtributosConfig,
  passivasAtributosAtivos,
}: Props) {
  const [poderes, setPoderes] = useState<PoderGenericoCatalogo[]>([]);
  const [preview, setPreview] = useState<PersonagemBasePreview | null>(null);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [limiteRenderPoderes, setLimiteRenderPoderes] = useState(60);
  const [configAberta, setConfigAberta] = useState<Record<number, boolean>>({});
  const termoBuscaDeferred = useDeferredValue(termoBusca);

  const reqPreviewRef = useRef(0);

  const slotsDisponiveis = calcularSlotsPoderes(nivel);
  const slotsUsados = poderesGenericos.length;

  // Carrega o catálogo de poderes.
  useEffect(() => {
    (async () => {
      try {
        setLoadingCatalogo(true);
        setErro(null);

        // Chamada de catálogo sem token explícito no payload.
        const data = await apiGetPoderesGenericos();
        setPoderes(data);
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao carregar poderes genéricos');
      } finally {
        setLoadingCatalogo(false);
      }
    })();
  }, []);

  const poderesGenericosNormalizados: PoderGenericoInstanciaPayload[] = useMemo(
    () =>
      (poderesGenericos ?? []).map((inst) => ({
        ...inst,
        config: inst.config ?? {},
      })),
    [poderesGenericos],
  );

  // Recalcula preview quando os dados base mudam.
  useEffect(() => {
    if (!classeId || !origemId || !claId) {
      setPreview(null);
      return;
    }

    const configSanitizado = sanitizarPassivasConfig(passivasAtributosConfig);
    const grausTreinamentoSanitizados = sanitizarGrausTreinamento(grausTreinamento);
    const poderesGenericosSanitizados = sanitizarPoderesGenericos(
      poderesGenericosNormalizados,
      poderes,
    );

    const payload: CreatePersonagemBasePayload = {
      nome: nome || 'Preview',
      nivel,
      claId: Number(claId),
      origemId: Number(origemId),
      classeId: Number(classeId),
      trilhaId: trilhaId ? Number(trilhaId) : null,
      caminhoId: caminhoId ? Number(caminhoId) : null,
      agilidade,
      forca,
      intelecto,
      presenca,
      vigor,
      estudouEscolaTecnica,
      tecnicaInataId: tecnicaInataId ? Number(tecnicaInataId) : null,
      atributoChaveEa: atributoChaveEa as 'INT' | 'PRE',
      prestigioBase,
      prestigioClaBase,
      idade,
      alinhamentoId: alinhamentoId ? Number(alinhamentoId) : null,
      background,
      periciasClasseEscolhidasCodigos,
      periciasOrigemEscolhidasCodigos,
      periciasLivresCodigos,
      grausAprimoramento: Object.entries(graus).map(([tipoGrauCodigo, valor]) => ({
        tipoGrauCodigo,
        valor,
      })),
      proficienciasCodigos: [],
      grausTreinamento: grausTreinamentoSanitizados,
      poderesGenericos: poderesGenericosSanitizados,
      passivasAtributosAtivos:
        passivasAtributosAtivos && passivasAtributosAtivos.length > 0
          ? passivasAtributosAtivos
          : undefined,
      passivasAtributosConfig: configSanitizado,
    };

    const reqId = ++reqPreviewRef.current;
    setLoadingPreview(true);

    const timeout = setTimeout(() => {
      // Chamada de preview sem token explícito no payload.
      apiPreviewPersonagemBase(payload)
        .then((res) => {
          if (reqId !== reqPreviewRef.current) return;
          setPreview(res);
        })
        .catch(() => {
          if (reqId !== reqPreviewRef.current) return;
          setPreview(null);
        })
        .finally(() => {
          if (reqId !== reqPreviewRef.current) return;
          setLoadingPreview(false);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    // Sem dependência de token: o interceptor cuida da autenticação.
    classeId,
    origemId,
    claId,
    tecnicaInataId,
    trilhaId,
    caminhoId,
    nivel,
    estudouEscolaTecnica,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    atributoChaveEa,
    periciasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    graus,
    nome,
    prestigioBase,
    prestigioClaBase,
    idade,
    alinhamentoId,
    background,
    grausTreinamento,
    poderesGenericosNormalizados,
    poderes,
    passivasAtributosConfig,
    passivasAtributosAtivos,
  ]);

  const periciasParaValidacao = useMemo(() => {
    const raw =
      preview?.pericias.map((p) => ({
        codigo: p.codigo,
        grauTreinamento: p.grauTreinamento,
      })) ?? [];
    return raw;
  }, [preview]);

  const grausParaValidacao = useMemo(() => {
    const map: Record<string, number> = {};
    if (preview?.grausAprimoramento) {
      preview.grausAprimoramento.forEach((g) => {
        map[g.tipoGrauCodigo] = g.valor ?? 0;
      });
    }
    return map;
  }, [preview]);

  const atributosParaValidacao = useMemo(
    () => ({
      agilidade,
      forca,
      intelecto,
      presenca,
      vigor,
    }),
    [agilidade, forca, intelecto, presenca, vigor],
  );

  const poderesSelecionadosIds = useMemo(
    () => poderesGenericos.map((inst) => inst.habilidadeId),
    [poderesGenericos],
  );

  const mapaGrausAtualPorTipo = useMemo(() => {
    const map = new Map<string, number>();
    if (preview?.grausAprimoramento) {
      preview.grausAprimoramento.forEach((g) => {
        map.set(g.tipoGrauCodigo, g.valor ?? 0);
      });
    } else {
      Object.entries(graus).forEach(([codigo, valor]) => {
        map.set(codigo, Number(valor) || 0);
      });
    }
    return map;
  }, [preview, graus]);

  const mapaGrausPreview = useMemo(() => {
    const map = new Map<string, number>();
    (preview?.pericias ?? []).forEach((p) => {
      map.set(p.codigo, p.grauTreinamento);
    });
    return map;
  }, [preview]);

  const periciasElegiveisTreino = useMemo(
    () =>
      todasPericias
        .map((p) => {
          const grau = mapaGrausPreview.get(p.codigo) ?? 0;
          return {
            codigo: p.codigo,
            nome: p.nome,
            grauTreinamento: grau,
          };
        })
        .filter((p) => p.grauTreinamento < 4),
    [todasPericias, mapaGrausPreview],
  );

  const poderesFiltrados = useMemo(() => {
    if (!termoBuscaDeferred.trim()) return poderes;

    const termo = termoBuscaDeferred.toLowerCase();
    return poderes.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo) ||
        p.origem?.toLowerCase().includes(termo),
    );
  }, [poderes, termoBuscaDeferred]);

  const poderesRenderizados = useMemo(
    () => poderesFiltrados.slice(0, limiteRenderPoderes),
    [poderesFiltrados, limiteRenderPoderes],
  );

  if (loadingCatalogo) {
    return <Loading message="Carregando poderes genéricos..." />;
  }

  if (erro) {
    return <ErrorAlert message={erro} />;
  }

  if (slotsDisponiveis === 0) {
    return (
      <SectionCard
        title="Poderes genéricos"
        right={<Icon name="sparkles" className="h-5 w-5 text-app-muted" />}
      >
        <EmptyState
          variant="card"
          icon="info"
          title="Ainda indisponível"
          description="Poderes genéricos são desbloqueados nos níveis 3, 6, 9, 12, 15 e 18."
        />
      </SectionCard>
    );
  }

  const semSlotsLivres = slotsUsados >= slotsDisponiveis;
  const percentualUsado = Math.min(100, (slotsUsados / slotsDisponiveis) * 100);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Poderes genéricos"
        right={
          <div className="flex items-center gap-2">
            {loadingPreview && <Icon name="spinner" className="w-4 h-4 animate-spin text-app-muted" />}
            <Icon name="sparkles" className="h-5 w-5 text-app-muted" />
          </div>
        }
        contentClassName="space-y-4"
      >
        {/* 1. Info + resumo */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon name="info" className="w-4 h-4 text-app-muted" />
                <p className="text-sm font-medium text-app-fg">Slots de poderes</p>
              </div>
              <p className="text-xs text-app-muted mt-1">
                Você pode selecionar até {slotsDisponiveis} poder(es) genérico(s) neste nível.
              </p>
            </div>

            {/* Badge resumo */}
            <div
              className={`rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${
                semSlotsLivres
                  ? 'bg-app-danger/10 text-app-danger border border-app-danger/30'
                  : slotsUsados > 0
                  ? 'bg-app-success/10 text-app-success border border-app-success/30'
                  : 'bg-app-border text-app-muted'
              }`}
            >
              {slotsUsados}/{slotsDisponiveis} slots
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-app-border overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  semSlotsLivres ? 'bg-app-danger' : slotsUsados > 0 ? 'bg-app-success' : 'bg-transparent'
                }`}
                style={{ width: `${percentualUsado}%` }}
              />
            </div>

            {semSlotsLivres && (
              <p className="text-xs text-app-danger flex items-center gap-1">
                <Icon name="error" className="w-3 h-3" />
                Limite atingido. Remova poderes para selecionar outros.
              </p>
            )}
          </div>
        </div>

        {/* 2. Busca */}
        <Input
          type="text"
          placeholder="Buscar poderes..."
          value={termoBusca}
          onChange={(e) => {
            setTermoBusca(e.target.value);
            setLimiteRenderPoderes(60);
          }}
          icon="search"
        />

        {/* 3. Lista de poderes */}
        <div className="space-y-2">
          {poderesRenderizados.map((poder) => {
            const mecanicas = poder.mecanicasEspeciais as
              | {
                  repetivel?: boolean;
                  escolha?: { tipo: string; quantidade?: number };
                }
              | undefined;

            const repetivel = mecanicas?.repetivel === true;
            const escolha = mecanicas?.escolha;

            const instanciasDestePoder = poderesGenericos
              .map((inst, indexGlobal) => ({ inst, indexGlobal }))
              .filter((x) => x.inst.habilidadeId === poder.id);

            const selecionado = instanciasDestePoder.length > 0;

            const validacao = validarRequisitosPoder(poder.requisitos, {
              nivel,
              pericias: periciasParaValidacao,
              atributos: atributosParaValidacao,
              graus: grausParaValidacao,
              poderesSelecionados: poderesSelecionadosIds,
              todosPoderes: poderes,
            });

            const podeCriarInstancia =
              !semSlotsLivres &&
              validacao.atende &&
              !!addPoderGenericoInstancia &&
              (repetivel || instanciasDestePoder.length === 0);

            const podeRemoverInstancia = instanciasDestePoder.length > 0 && !!removePoderGenericoInstancia;

            const configAb = configAberta[poder.id] ?? false;

            return (
              <div
                key={poder.id}
                className={`rounded border transition-all ${
                  selecionado
                    ? 'border-app-success bg-app-success/5'
                    : !validacao.atende
                    ? 'border-app-border/50 opacity-60'
                    : 'border-app-border hover:border-app-border/60'
                }`}
              >
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-app-fg text-sm">{poder.nome}</h4>
                        {repetivel && (
                          <span className="rounded-full bg-app-primary/10 px-2 py-0.5 text-[10px] font-medium text-app-primary">
                            Repetível
                          </span>
                        )}
                        {poder.origem && (
                          <span className="text-[10px] text-app-muted">Origem: {poder.origem}</span>
                        )}
                      </div>

                      {poder.descricao && (
                        <p className="text-xs text-app-muted mt-1 leading-relaxed line-clamp-2">
                          {poder.descricao}
                        </p>
                      )}

                      {!validacao.atende && validacao.motivoNaoAtende && (
                        <p className="text-xs text-app-danger mt-1">
                          Requisitos: {validacao.motivoNaoAtende}
                        </p>
                      )}
                    </div>

                    {/* Controles */}
                    <div className="flex items-center gap-2">
                      {selecionado && (
                        <span className="text-xs text-app-muted font-medium">
                          {instanciasDestePoder.length}×
                        </span>
                      )}

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!podeRemoverInstancia}
                        onClick={() => {
                          if (!removePoderGenericoInstancia) return;
                          const last = instanciasDestePoder[instanciasDestePoder.length - 1];
                          if (last) {
                            removePoderGenericoInstancia(last.indexGlobal);
                          }
                        }}
                        className="h-8 w-8 px-0 text-lg font-bold"
                      >
                        -
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!podeCriarInstancia}
                        onClick={() => {
                          if (!addPoderGenericoInstancia) return;
                          addPoderGenericoInstancia(poder.id);
                        }}
                        className="h-8 w-8 px-0 text-lg font-bold"
                        title={
                          semSlotsLivres
                            ? 'Sem slots disponíveis'
                            : !validacao.atende
                            ? 'Requisitos não atendidos'
                            : 'Adicionar instância'
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Config (collapse) */}
                  {escolha && instanciasDestePoder.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-app-border/50">
                      <button
                        type="button"
                        onClick={() => setConfigAberta({ ...configAberta, [poder.id]: !configAb })}
                        className="w-full flex items-center justify-between text-left hover:opacity-70 transition-opacity"
                      >
                        <span className="text-xs font-medium text-app-fg">
                          Configurar instâncias ({instanciasDestePoder.length})
                        </span>
                        <Icon
                          name="chevron-down"
                          className={`w-3 h-3 text-app-muted transition-transform ${
                            configAb ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {configAb && (
                        <div className="mt-2 space-y-2">
                          {instanciasDestePoder.map(({ inst, indexGlobal }, idx) => {
                            const cfg = asRecord(inst.config) ?? {};

                            if (escolha.tipo === 'PERICIAS') {
                              const quantidade = escolha.quantidade ?? 2;
                              const lista = toStringArray(cfg.periciasCodigos);

                              const valores = [...lista];
                              while (valores.length < quantidade) {
                                valores.push('');
                              }

                              return (
                                <div
                                  key={indexGlobal}
                                  className="rounded border border-app-border bg-app-elevated p-2 space-y-1.5"
                                >
                                  <p className="text-[10px] text-app-muted">
                                    Instância {idx + 1} - escolha {quantidade} perícia(s)
                                  </p>

                                  {valores.map((valorAtual: string, idxPericia: number) => {
                                    const usados = new Set(valores.filter((v, i) => v && i !== idxPericia));
                                    const opcoes = periciasElegiveisTreino.filter(
                                      (p) => !usados.has(p.codigo),
                                    );

                                    return (
                                      <select
                                        key={idxPericia}
                                        className="w-full rounded border border-app-border bg-app-card px-2 py-1 text-xs"
                                        value={valorAtual}
                                        onChange={(e) => {
                                          if (!updatePoderGenericoInstancia) return;

                                          const novoCodigo = e.target.value;
                                          const novaLista = [...valores];
                                          novaLista[idxPericia] = novoCodigo;

                                          updatePoderGenericoInstancia(indexGlobal, {
                                            periciasCodigos: novaLista.slice(0, quantidade),
                                          });
                                        }}
                                      >
                                        <option value="">Perícia {idxPericia + 1}...</option>
                                        {opcoes.map((p) => (
                                          <option key={p.codigo} value={p.codigo}>
                                            {p.nome} (grau {p.grauTreinamento})
                                          </option>
                                        ))}
                                      </select>
                                    );
                                  })}
                                </div>
                              );
                            }

                            if (escolha.tipo === 'TIPO_GRAU') {
                              const tipoGrauCodigo =
                                typeof cfg.tipoGrauCodigo === 'string' ? cfg.tipoGrauCodigo : '';

                              const opcoesTipoGrau = tiposGrau.filter((tg) => {
                                const atual = mapaGrausAtualPorTipo.get(tg.codigo) ?? 0;
                                return atual < 5;
                              });

                              return (
                                <div
                                  key={indexGlobal}
                                  className="rounded border border-app-border bg-app-elevated p-2"
                                >
                                  <p className="text-[10px] text-app-muted mb-1.5">
                                    Instância {idx + 1} - escolha um tipo de grau
                                  </p>

                                  <select
                                    className="w-full rounded border border-app-border bg-app-card px-2 py-1 text-xs"
                                    value={tipoGrauCodigo}
                                    onChange={(e) => {
                                      if (!updatePoderGenericoInstancia) return;
                                      const value = e.target.value;
                                      updatePoderGenericoInstancia(indexGlobal, {
                                        tipoGrauCodigo: value || undefined,
                                      });
                                    }}
                                  >
                                    <option value="">Selecione...</option>
                                    {opcoesTipoGrau.map((tg) => (
                                      <option key={tg.codigo} value={tg.codigo}>
                                        {tg.nome} (grau {mapaGrausAtualPorTipo.get(tg.codigo) ?? 0})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={indexGlobal}
                                className="rounded border border-app-border bg-app-elevated p-2"
                              >
                                <p className="text-[10px] text-app-muted">
                                  Tipo &quot;{escolha.tipo}&quot; sem UI específica.
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {poderesFiltrados.length > limiteRenderPoderes && (
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setLimiteRenderPoderes((atual) => Math.min(poderesFiltrados.length, atual + 60))
            }
            className="w-full"
          >
            Mostrar mais ({poderesFiltrados.length - limiteRenderPoderes} restantes)
          </Button>
        )}

        {/* Empty states */}
        {poderesFiltrados.length === 0 && termoBusca && (
          <EmptyState
            variant="card"
            icon="search"
            title="Nenhum poder encontrado"
            description={`Nenhum resultado para "${termoBusca}"`}
          />
        )}

        {poderes.length === 0 && (
          <EmptyState
            variant="card"
            icon="info"
            title="Nenhum poder disponível"
            description="O catálogo de poderes genéricos está vazio."
          />
        )}
      </SectionCard>
    </div>
  );
}
