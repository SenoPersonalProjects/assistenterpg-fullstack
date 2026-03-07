// components/personagem-base/wizard/PersonagemBaseStepGrausTreinamento.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  CreatePersonagemBasePayload,
  PersonagemBasePreview,
  GrauTreinamento,
  PericiaCatalogo,
  PoderGenericoInstanciaPayload,
  PassivasAtributoConfigFront,
} from '@/lib/api';
import { apiPreviewPersonagemBase } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import {
  getNomeGrau,
  getNiveisGrausTreinamento,
  calcularMaxMelhorias,
  podeReceberMelhoria,
} from '@/lib/utils/pericias';

type Props = {
  nome: string;
  nivel: number;
  classeId: string;
  origemId: string;
  claId: string;
  tecnicaInataId: string | null;
  trilhaId: string | null;
  caminhoId: string | null;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  estudouEscolaTecnica: boolean;
  atributoChaveEa: string;
  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];
  graus: Record<string, number>;
  prestigioBase: number;
  prestigioClaBase: number | null;
  idade: number | null;
  alinhamentoId: string;
  background: string | null;

  grausTreinamento: GrauTreinamento[];
  onChangeGrausTreinamento: (graus: GrauTreinamento[]) => void;

  todasPericias: PericiaCatalogo[];
  poderesGenericos: PoderGenericoInstanciaPayload[];
  passivasAtributosConfig?: PassivasAtributoConfigFront;
};

type Validacao = { valido: boolean; mensagem?: string };

const GRAUS_ANTERIOR_VALIDOS = new Set([0, 5, 10, 15]);
const GRAUS_NOVO_VALIDOS = new Set([5, 10, 15, 20]);

type DegrauTreino = 0 | 5 | 10 | 15 | 20;

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

export function PersonagemBaseStepGrausTreinamento({
  nome,
  nivel,
  classeId,
  origemId,
  claId,
  tecnicaInataId,
  trilhaId,
  caminhoId,
  agilidade,
  forca,
  intelecto,
  presenca,
  vigor,
  estudouEscolaTecnica,
  atributoChaveEa,
  periciasClasseEscolhidasCodigos,
  periciasOrigemEscolhidasCodigos,
  periciasLivresCodigos,
  graus,
  prestigioBase,
  prestigioClaBase,
  idade,
  alinhamentoId,
  background,
  grausTreinamento,
  onChangeGrausTreinamento,
  todasPericias,
  poderesGenericos,
  passivasAtributosConfig,
}: Props) {
  const { token } = useAuth();
  const [previewBase, setPreviewBase] = useState<PersonagemBasePreview | null>(null);
  const [previewFinal, setPreviewFinal] = useState<PersonagemBasePreview | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [previewAberto, setPreviewAberto] = useState(false);

  const reqBaseRef = useRef(0);
  const reqFinalRef = useRef(0);

  const grausTreinamentoAtual = useMemo(() => grausTreinamento ?? [], [grausTreinamento]);

  const niveisDisponiveis = useMemo(() => {
    const niveisValidos = getNiveisGrausTreinamento();
    return niveisValidos
      .filter((n) => nivel >= n)
      .map((n) => ({
        nivel: n,
        maxMelhorias: calcularMaxMelhorias(intelecto),
      }));
  }, [nivel, intelecto]);

  const poderesGenericosNormalizados: PoderGenericoInstanciaPayload[] = useMemo(
    () =>
      (poderesGenericos ?? []).map((inst) => ({
        ...inst,
        config: inst.config ?? {},
      })),
    [poderesGenericos],
  );

  const payloadBase = useMemo<CreatePersonagemBasePayload | null>(() => {
    if (!classeId || !origemId || !claId) return null;

    const configSanitizado = sanitizarPassivasConfig(passivasAtributosConfig);

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

      grausTreinamento: [],
      proficienciasCodigos: [],

      poderesGenericos: poderesGenericosNormalizados.length > 0 ? poderesGenericosNormalizados : undefined,
      passivasAtributosConfig: configSanitizado,
    };

    return payload;
  }, [
    nome,
    nivel,
    classeId,
    origemId,
    claId,
    tecnicaInataId,
    trilhaId,
    caminhoId,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    estudouEscolaTecnica,
    atributoChaveEa,
    prestigioBase,
    prestigioClaBase,
    idade,
    alinhamentoId,
    background,
    periciasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    graus,
    poderesGenericosNormalizados,
    passivasAtributosConfig,
  ]);

  const payloadFinal = useMemo<CreatePersonagemBasePayload | null>(() => {
    if (!classeId || !origemId || !claId) return null;

    const configSanitizado = sanitizarPassivasConfig(passivasAtributosConfig);
    const grausTreinamentoSanitizados = sanitizarGrausTreinamento(grausTreinamentoAtual);

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

      grausTreinamento: grausTreinamentoSanitizados,
      proficienciasCodigos: [],

      poderesGenericos: poderesGenericosNormalizados.length > 0 ? poderesGenericosNormalizados : undefined,
      passivasAtributosConfig: configSanitizado,
    };

    return payload;
  }, [
    nome,
    nivel,
    classeId,
    origemId,
    claId,
    tecnicaInataId,
    trilhaId,
    caminhoId,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    estudouEscolaTecnica,
    atributoChaveEa,
    prestigioBase,
    prestigioClaBase,
    idade,
    alinhamentoId,
    background,
    periciasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    graus,
    grausTreinamentoAtual,
    poderesGenericosNormalizados,
    passivasAtributosConfig,
  ]);

  useEffect(() => {
    if (!token || !payloadBase) {
      queueMicrotask(() => setPreviewBase(null));
      return;
    }

    const reqId = ++reqBaseRef.current;

    apiPreviewPersonagemBase(payloadBase)
      .then((res) => {
        if (reqId !== reqBaseRef.current) return;
        setPreviewBase(res);
      })
      .catch(() => {
        if (reqId !== reqBaseRef.current) return;
        setPreviewBase(null);
      });
  }, [token, payloadBase]);

  useEffect(() => {
    if (!token || !payloadFinal) {
      queueMicrotask(() => setPreviewFinal(null));
      return;
    }

    const reqId = ++reqFinalRef.current;

    queueMicrotask(() => setCarregando(true));

    const timeout = setTimeout(() => {
      apiPreviewPersonagemBase(payloadFinal)
        .then((res) => {
          if (reqId !== reqFinalRef.current) return;
          setPreviewFinal(res);
        })
        .catch(() => {
          if (reqId !== reqFinalRef.current) return;
          setPreviewFinal(null);
        })
        .finally(() => {
          if (reqId !== reqFinalRef.current) return;
          setCarregando(false);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [token, payloadFinal]);

  const periciasElegiveis = useMemo(() => {
    if (!previewBase) return [];
    return previewBase.pericias.filter((p) => p.grauTreinamento > 0);
  }, [previewBase]);

  const toDegrauBonus = (grauBackend: number): DegrauTreino => {
    const v = Math.max(0, Math.min(4, Math.floor(grauBackend)));
    return (v * 5) as DegrauTreino;
  };

  const getGrauBasePericia = (periciaCodigo: string): DegrauTreino => {
    const p = previewBase?.pericias?.find((x) => x.codigo === periciaCodigo);
    return toDegrauBonus(p?.grauTreinamento ?? 0);
  };

  const calcularExtraTreino = (periciaCodigo: string, nivelAtual: number): number => {
    let qtdMelhoriasAnteriores = 0;

    for (const gt of grausTreinamentoAtual) {
      if (gt.nivel >= nivelAtual) break;
      qtdMelhoriasAnteriores += gt.melhorias.filter((m) => m.periciaCodigo === periciaCodigo).length;
    }

    return Math.min(20, qtdMelhoriasAnteriores * 5);
  };

  function validarMelhoria(degrauAnterior: number, degrauNovo: number): Validacao {
    if (!GRAUS_ANTERIOR_VALIDOS.has(degrauAnterior)) {
      return { valido: false, mensagem: 'Degrau atual não pode receber melhoria' };
    }
    if (!GRAUS_NOVO_VALIDOS.has(degrauNovo)) {
      return { valido: false, mensagem: 'Degrau novo inválido' };
    }
    return podeReceberMelhoria(degrauAnterior, degrauNovo, nivel);
  }

  const adicionarMelhoria = (nivelSelecionado: number) => {
    const novos = [...grausTreinamentoAtual];
    const idx = novos.findIndex((g) => g.nivel === nivelSelecionado);

    const item = { periciaCodigo: '', grauAnterior: 0, grauNovo: 5 };

    if (idx >= 0) {
      novos[idx] = { ...novos[idx], melhorias: [...novos[idx].melhorias, item] };
    } else {
      novos.push({ nivel: nivelSelecionado, melhorias: [item] });
      novos.sort((a, b) => a.nivel - b.nivel);
    }

    onChangeGrausTreinamento(novos);
  };

  const removerMelhoria = (nivelSelecionado: number, index: number) => {
    const novos = grausTreinamentoAtual.map((gt) => {
      if (gt.nivel !== nivelSelecionado) return gt;
      return { ...gt, melhorias: gt.melhorias.filter((_, i) => i !== index) };
    });

    onChangeGrausTreinamento(novos);
  };

  const atualizarPericia = (nivelSelecionado: number, index: number, periciaCodigo: string) => {
    if (!periciaCodigo) {
      const novos = grausTreinamentoAtual.map((gt) => {
        if (gt.nivel !== nivelSelecionado) return gt;
        const novas = [...gt.melhorias];
        novas[index] = { periciaCodigo: '', grauAnterior: 0, grauNovo: 5 };
        return { ...gt, melhorias: novas };
      });

      onChangeGrausTreinamento(novos);
      return;
    }

    const grauBase = getGrauBasePericia(periciaCodigo);
    const extra = calcularExtraTreino(periciaCodigo, nivelSelecionado);

    const degrauTotalAtual = Math.min(20, grauBase + extra);
    const degrauAnterior = Math.min(15, degrauTotalAtual);
    const degrauNovo = Math.min(20, degrauAnterior + 5);

    const validacao = validarMelhoria(degrauAnterior, degrauNovo);

    if (!validacao.valido) {
      return;
    }

    const novos = grausTreinamentoAtual.map((gt) => {
      if (gt.nivel !== nivelSelecionado) return gt;
      const novas = [...gt.melhorias];
      novas[index] = { periciaCodigo, grauAnterior: degrauAnterior, grauNovo: degrauNovo };
      return { ...gt, melhorias: novas };
    });

    onChangeGrausTreinamento(novos);
  };

  useEffect(() => {
    if (niveisDisponiveis.length === 0) return;

    const existentes = new Set(grausTreinamentoAtual.map((g) => g.nivel));
    const faltando = niveisDisponiveis.filter((d) => !existentes.has(d.nivel));

    if (faltando.length > 0) {
      const estruturas = faltando.map((d) => ({ nivel: d.nivel, melhorias: [] }));
      const todos = [...grausTreinamentoAtual, ...estruturas].sort((a, b) => a.nivel - b.nivel);

      onChangeGrausTreinamento(todos);
    }
  }, [niveisDisponiveis, grausTreinamentoAtual, onChangeGrausTreinamento]);

  const totalMelhorias = useMemo(() => {
    return grausTreinamentoAtual.reduce(
      (acc, gt) => acc + gt.melhorias.filter((m) => m.periciaCodigo).length,
      0,
    );
  }, [grausTreinamentoAtual]);

  const totalPossivel = useMemo(() => {
    return niveisDisponiveis.reduce((acc, n) => acc + n.maxMelhorias, 0);
  }, [niveisDisponiveis]);

  if (niveisDisponiveis.length === 0) {
    return (
      <SectionCard
        title="Graus de treinamento"
        right={<Icon name="training" className="h-5 w-5 text-app-muted" />}
      >
        <EmptyState
          variant="card"
          icon="info"
          title="Ainda indisponível"
          description={`Graus de treinamento são desbloqueados nos níveis ${getNiveisGrausTreinamento().join(', ')}.`}
        />
        <p className="mt-2 text-xs text-app-muted">
          Seu personagem ainda não alcançou nenhum desses níveis.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Graus de treinamento"
        right={<Icon name="training" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-4"
      >
        {/* 1. INFO + RESUMO */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon name="info" className="w-4 h-4 text-app-muted" />
                <p className="text-sm font-medium text-app-fg">Como funciona</p>
              </div>
              <p className="text-xs text-app-muted mt-1">
                Progressão: <span className="font-semibold text-app-fg">{getNomeGrau(5)}</span> →{' '}
                <span className="font-semibold text-app-fg">{getNomeGrau(10)}</span> →{' '}
                <span className="font-semibold text-app-fg">{getNomeGrau(15)}</span> →{' '}
                <span className="font-semibold text-app-fg">{getNomeGrau(20)}</span>
              </p>
              <p className="text-xs text-app-muted mt-0.5">
                Em cada nível você pode fazer até{' '}
                <span className="font-semibold text-app-fg">{calcularMaxMelhorias(intelecto)} melhorias</span>.
              </p>
            </div>

            {/* Badge resumo total */}
            <div
              className={`rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${
                totalMelhorias === 0
                  ? 'bg-app-border text-app-muted'
                  : totalMelhorias >= totalPossivel
                  ? 'bg-app-success/10 text-app-success border border-app-success/30'
                  : 'bg-app-warning/10 text-app-warning border border-app-warning/30'
              }`}
            >
              {totalMelhorias}/{totalPossivel} melhorias
            </div>
          </div>
        </div>

        {/* 2. NÍVEIS (escolhas) */}
        <div className="space-y-3">
          {niveisDisponiveis.map((nivelInfo) => {
            const grauNivel = grausTreinamentoAtual.find((g) => g.nivel === nivelInfo.nivel);
            const melhorias = grauNivel?.melhorias || [];
            const melhoriasConcluidas = melhorias.filter((m) => m.periciaCodigo).length;
            const podeAdicionar = melhorias.length < nivelInfo.maxMelhorias;

            const codigosSelecionadosNoNivel = new Set(
              melhorias.map((m) => m.periciaCodigo).filter((c) => c !== ''),
            );

            const limiteAtingido = melhorias.length >= nivelInfo.maxMelhorias;
            const proximoDoLimite =
              melhorias.length >= nivelInfo.maxMelhorias - 1 && !limiteAtingido;

            return (
              <div
                key={nivelInfo.nivel}
                className="rounded border border-app-border bg-app-surface p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-app-fg">Nível {nivelInfo.nivel}</p>
                    <div
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        limiteAtingido
                          ? 'bg-app-danger/10 text-app-danger'
                          : proximoDoLimite
                          ? 'bg-app-warning/10 text-app-warning'
                          : 'bg-app-border text-app-muted'
                      }`}
                    >
                      {melhoriasConcluidas}/{nivelInfo.maxMelhorias}
                    </div>
                  </div>

                  {podeAdicionar && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => adicionarMelhoria(nivelInfo.nivel)}
                      className="text-xs h-8"
                    >
                      + Adicionar
                    </Button>
                  )}
                </div>

                {melhorias.length === 0 ? (
                  <p className="text-xs text-app-muted italic">Nenhuma melhoria adicionada.</p>
                ) : (
                  <div className="space-y-2">
                    {melhorias.map((melhoria, index) => {
                      // Filtrar opções para ESTA melhoria específica
                      const opcoesNivel = periciasElegiveis.filter((p) => {
                        if (p.codigo === melhoria.periciaCodigo) return true;
                        return !codigosSelecionadosNoNivel.has(p.codigo);
                      });

                      const periciaSelecionada = todasPericias.find(
                        (p) => p.codigo === melhoria.periciaCodigo,
                      );

                      const grauBase = getGrauBasePericia(melhoria.periciaCodigo);
                      const extra = calcularExtraTreino(melhoria.periciaCodigo, nivelInfo.nivel);
                      const degrauTotalAtual = Math.min(20, grauBase + extra);
                      const degrauAtual = Math.min(15, degrauTotalAtual);
                      const degrauNovo = Math.min(20, degrauAtual + 5);
                      const validacao = melhoria.periciaCodigo
                        ? validarMelhoria(degrauAtual, degrauNovo)
                        : { valido: true };

                      return (
                        <div
                          key={index}
                          className="rounded border border-app-border bg-app-elevated p-2.5 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <select
                              className="flex-1 bg-app-card border border-app-border rounded px-2 py-1.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-app-primary"
                              value={melhoria.periciaCodigo}
                              onChange={(e) =>
                                atualizarPericia(nivelInfo.nivel, index, e.target.value)
                              }
                            >
                              <option value="" className="bg-app-card text-app-muted">
                                Selecione uma perícia...
                              </option>

                              {opcoesNivel.map((p) => {
                                const grauBaseOpt = getGrauBasePericia(p.codigo);
                                const extraOpt = calcularExtraTreino(p.codigo, nivelInfo.nivel);
                                const degrauTotalAtualOpt = Math.min(20, grauBaseOpt + extraOpt);
                                const degrauAtualOpt = Math.min(15, degrauTotalAtualOpt);
                                const degrauNovoOpt = Math.min(20, degrauAtualOpt + 5);
                                const validacaoOpt = validarMelhoria(degrauAtualOpt, degrauNovoOpt);

                                return (
                                  <option
                                    key={p.codigo}
                                    value={p.codigo}
                                    disabled={!validacaoOpt.valido}
                                    className="bg-app-card text-app-fg disabled:text-app-muted"
                                  >
                                    {p.nome}
                                  </option>
                                );
                              })}
                            </select>

                            {/* Botão maior e mais visível */}
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => removerMelhoria(nivelInfo.nivel, index)}
                              className="h-9 w-9 px-0 text-app-danger hover:bg-app-danger/10 text-xl font-bold"
                              aria-label="Remover melhoria"
                            >
                              ×
                            </Button>
                          </div>

                          {/* Detalhes abaixo do select */}
                          {periciaSelecionada && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-app-muted">
                                {getNomeGrau(melhoria.grauAnterior)} → {getNomeGrau(melhoria.grauNovo)}
                              </span>
                              {!validacao.valido && (
                                <span className="text-app-danger text-[10px]">
                                  ⚠️ {validacao.mensagem}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. PREVIEW (collapse) */}
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
                {previewFinal && (
                  <span className="text-xs text-app-muted">
                    ({previewFinal.pericias.length} perícias)
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
                Todas as perícias com bônus finais (incluindo graus de treinamento).
              </p>

              {!previewFinal || previewFinal.pericias.length === 0 ? (
                <EmptyState
                  variant="card"
                  icon="info"
                  title="Sem preview"
                  description="Complete as melhorias para ver o resultado final."
                />
              ) : (
                <ul className="space-y-1.5 max-h-64 overflow-y-auto">
                  {previewFinal.pericias.map((p) => (
                    <li
                      key={p.codigo}
                      className="flex items-center justify-between rounded border border-app-border bg-app-surface px-2 py-1.5"
                    >
                      <div>
                        <span className="text-sm font-medium text-app-fg">{p.nome}</span>
                        <span className="text-[10px] text-app-muted ml-1">
                          ({p.codigo}) {p.atributoBase}
                        </span>
                      </div>
                      <span className="text-app-success font-semibold text-sm">
                        +{p.bonusTotal}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
