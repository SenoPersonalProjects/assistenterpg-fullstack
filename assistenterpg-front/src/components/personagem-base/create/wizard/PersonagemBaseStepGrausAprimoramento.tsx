// components/personagem-base/wizard/PersonagemBaseStepGrausAprimoramento.tsx
'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import type {
  TipoGrauCatalogo,
  CreatePersonagemBasePayload,
  PersonagemBasePreview,
  PassivasAtributoConfigFront,
} from '@/lib/api';
import { apiPreviewPersonagemBase } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { Icon } from '@/components/ui/Icon';

type Props = {
  tiposGrau: TipoGrauCatalogo[];
  valores: Record<string, number>;
  onChangeValor: (codigo: string, valor: number) => void;

  nivel: number;
  estudouEscolaTecnica: boolean;
  trilhaNome: string | null;

  nome: string;
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
  atributoChaveEa: string;
  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];

  prestigioBase: number;
  prestigioClaBase: number | null;
  idade: number | null;
  alinhamentoId: string;
  background: string | null;

  passivasAtributosConfig?: PassivasAtributoConfigFront;
};

const LIMITE_GRAU = 5;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function calcularGrausLivresMaxFallback(nivel: number): number {
  const marcos = [2, 8, 14, 18];
  return marcos.filter((m) => nivel >= m).length;
}

function LinhaGrau({
  nome,
  codigo,
  valor,
  valorTotal,
  bonusOutros,
  podeInc,
  podeDec,
  onInc,
  onDec,
  temBonusIntelectoII,
}: {
  nome: string;
  codigo: string;
  valor: number;
  valorTotal: number | null;
  bonusOutros: number;
  podeInc: boolean;
  podeDec: boolean;
  onInc: () => void;
  onDec: () => void;
  temBonusIntelectoII?: boolean;
}) {
  const isZero = valor === 0;
  const isMax = valor === LIMITE_GRAU;

  return (
    <div
      className={`rounded border bg-app-surface transition-colors ${
        isMax
          ? 'border-amber-400/40 bg-amber-400/5'
          : 'border-app-border hover:border-app-border/60'
      }`}
    >
      <div className="p-2.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-app-fg">{nome}</p>
              {temBonusIntelectoII && (
                <div
                  className="flex items-center gap-1 text-[10px] text-app-warning font-medium px-1.5 py-0.5 rounded bg-app-warning/10"
                  title="Recebe +1 de Intelecto II"
                >
                  <Icon name="sparkles" className="h-3 w-3" />
                  +1
                </div>
              )}
            </div>
            <p className="text-[10px] text-app-muted font-mono">{codigo}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!podeDec}
              onClick={onDec}
              className="h-8 w-8 px-0 disabled:opacity-40 text-lg font-bold"
              aria-label={`Diminuir ${nome}`}
            >
              −
            </Button>

            <div
              className={`w-8 text-center text-sm font-bold ${
                isZero ? 'text-app-muted' : isMax ? 'text-amber-400' : 'text-app-fg'
              }`}
            >
              {valor}
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={!podeInc}
              onClick={onInc}
              className="h-8 w-8 px-0 disabled:opacity-40 text-lg font-bold"
              aria-label={`Aumentar ${nome}`}
            >
              +
            </Button>
          </div>
        </div>

        {/* ✅ NOVO: Mostrar grau total calculado */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-app-border/50">
          <span className="text-app-muted">
            {valor > 0 ? (
              <>
                Grau livre: <span className="font-semibold text-app-fg">{valor}</span>
                {bonusOutros > 0 && (
                  <>
                    {' '}
                    + Bônus: <span className="font-semibold text-app-warning">{bonusOutros}</span>
                  </>
                )}
              </>
            ) : (
              'Nenhum grau livre distribuído'
            )}
          </span>

          {valorTotal !== null && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-app-muted">Total:</span>
              <span className="font-bold text-app-success text-sm">{valorTotal}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PersonagemBaseStepGrausAprimoramento(props: Props) {
  const { token } = useAuth();
  const [previewCalculado, setPreviewCalculado] = useState<PersonagemBasePreview | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [breakdownAberto, setBreakdownAberto] = useState(false);
  const requestIdRef = useRef(0);

  const intelectoIIInfo = useMemo(() => {
    const cfgIntII = props.passivasAtributosConfig?.INT_II;
    return cfgIntII?.tipoGrauCodigoAprimoramento
      ? { ativo: true, codigo: cfgIntII.tipoGrauCodigoAprimoramento }
      : { ativo: false, codigo: null };
  }, [props.passivasAtributosConfig]);

  const usados = useMemo(() => {
    return Object.values(props.valores ?? {}).reduce((acc, v) => acc + (v || 0), 0);
  }, [props.valores]);

  const maxLivres = useMemo(() => {
    if (previewCalculado?.grausLivresInfo) {
      return previewCalculado.grausLivresInfo.total;
    }
    return calcularGrausLivresMaxFallback(props.nivel);
  }, [previewCalculado, props.nivel]);

  const grausLivresInfo = previewCalculado?.grausLivresInfo;
  const restantes = maxLivres - usados;
  const excedeu = usados > maxLivres;
  const completo = usados === maxLivres && !excedeu;

  const payloadPreview = useMemo<CreatePersonagemBasePayload | null>(() => {
    if (!props.classeId || !props.origemId || !props.claId) return null;

    return {
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

      periciasClasseEscolhidasCodigos: props.periciasClasseEscolhidasCodigos,
      periciasOrigemEscolhidasCodigos: props.periciasOrigemEscolhidasCodigos,
      periciasLivresCodigos: props.periciasLivresCodigos,

      grausAprimoramento: Object.entries(props.valores ?? {}).map(([tipoGrauCodigo, valor]) => ({
        tipoGrauCodigo,
        valor,
      })),

      grausTreinamento: [],
      proficienciasCodigos: [],

      passivasAtributosConfig:
        props.passivasAtributosConfig && Object.keys(props.passivasAtributosConfig).length > 0
          ? props.passivasAtributosConfig
          : undefined,
    };
  }, [
    props.nome,
    props.nivel,
    props.claId,
    props.origemId,
    props.classeId,
    props.trilhaId,
    props.caminhoId,
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
    props.periciasClasseEscolhidasCodigos,
    props.periciasOrigemEscolhidasCodigos,
    props.periciasLivresCodigos,
    props.valores,
    props.passivasAtributosConfig,
  ]);

  useEffect(() => {
    if (!token || !payloadPreview) {
      queueMicrotask(() => setPreviewCalculado(null));
      return;
    }

    const requestId = ++requestIdRef.current;
    queueMicrotask(() => setCarregando(true));

    const timeout = setTimeout(() => {
      apiPreviewPersonagemBase(payloadPreview)
        .then((res) => {
          if (requestId !== requestIdRef.current) return;
          setPreviewCalculado(res);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setPreviewCalculado(null);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setCarregando(false);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [token, payloadPreview]);

  // ✅ NOVO: Mapear graus totais do preview
  const grausTotaisMap = useMemo(() => {
    if (!previewCalculado?.grausAprimoramento) return {};
    const map: Record<string, { total: number; bonus: number }> = {};
    
    for (const grau of previewCalculado.grausAprimoramento) {
      const livre = props.valores[grau.tipoGrauCodigo] || 0;
      const bonus = grau.valor - livre;
      map[grau.tipoGrauCodigo] = { total: grau.valor, bonus };
    }
    
    return map;
  }, [previewCalculado, props.valores]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Graus de aprimoramento"
        right={
          <div className="flex items-center gap-2">
            {carregando && <Icon name="spinner" className="w-4 h-4 animate-spin text-app-muted" />}
            <Icon name="training" className="h-5 w-5 text-app-muted" />
          </div>
        }
        contentClassName="space-y-4"
      >
        {/* ✅ 1. INFO + RESUMO */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon name="info" className="w-4 h-4 text-app-muted" />
                <p className="text-sm font-medium text-app-fg">Como funciona</p>
              </div>
              <p className="text-xs text-app-muted mt-1">
                Distribua seus graus livres entre as técnicas. Limite por técnica:{' '}
                <span className="font-semibold text-app-fg">0–{LIMITE_GRAU}</span>
              </p>
            </div>

            {/* ✅ Badge resumo */}
            <div
              className={`rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${
                excedeu
                  ? 'bg-app-danger/10 text-app-danger border border-app-danger/30'
                  : completo
                  ? 'bg-app-success/10 text-app-success border border-app-success/30'
                  : usados > 0
                  ? 'bg-app-warning/10 text-app-warning border border-app-warning/30'
                  : 'bg-app-border text-app-muted'
              }`}
            >
              {usados}/{maxLivres} graus
            </div>
          </div>

          {/* ✅ Progress bar visual */}
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-app-border overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  excedeu
                    ? 'bg-app-danger'
                    : completo
                    ? 'bg-app-success'
                    : usados > 0
                    ? 'bg-app-warning'
                    : 'bg-transparent'
                }`}
                style={{ width: `${Math.min(100, (usados / Math.max(maxLivres, 1)) * 100)}%` }}
              />
            </div>

            {excedeu ? (
              <p className="text-xs text-app-danger flex items-center gap-1">
                <Icon name="error" className="w-3 h-3" />
                Excede o máximo. Reduza antes de avançar.
              </p>
            ) : restantes > 0 ? (
              <p className="text-xs text-app-muted">
                Restam <span className="font-semibold text-app-fg">{restantes}</span> grau(s).
              </p>
            ) : (
              <p className="text-xs text-app-success flex items-center gap-1">
                <Icon name="check" className="w-3 h-3" />
                Todos os graus distribuídos.
              </p>
            )}
          </div>

          {/* ✅ Breakdown (collapse) */}
          {grausLivresInfo && (
            <div className="rounded border border-app-border bg-app-elevated">
              <button
                type="button"
                onClick={() => setBreakdownAberto(!breakdownAberto)}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-app-border/20 transition-colors"
              >
                <span className="text-xs font-medium text-app-fg">Ver origem dos graus livres</span>
                <Icon
                  name="chevron-down"
                  className={`w-3 h-3 text-app-muted transition-transform ${
                    breakdownAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {breakdownAberto && (
                <div className="border-t border-app-border p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-app-muted">Base de nível:</span>
                    <span className="font-semibold text-app-fg">{grausLivresInfo.base}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-app-muted">De habilidades:</span>
                    <span className="font-semibold text-app-fg">{grausLivresInfo.deHabilidades}</span>
                  </div>
                  {grausLivresInfo.deIntelecto > 0 && (
                    <div className="flex justify-between">
                      <span className="text-app-warning font-medium">Intelecto II:</span>
                      <span className="font-semibold text-app-warning">+{grausLivresInfo.deIntelecto}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 mt-1.5 border-t border-app-border">
                    <span className="font-semibold text-app-fg">Total disponível:</span>
                    <span className="font-bold text-app-success">{grausLivresInfo.total}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ✅ 2. DISTRIBUIÇÃO (interação) */}
        <div className="grid gap-2">
          {props.tiposGrau.map((tipo) => {
            const codigo = tipo.codigo;
            const nome = tipo.nome;

            const atualRaw = props.valores?.[codigo] ?? 0;
            const atual = clamp(atualRaw, 0, LIMITE_GRAU);

            const podeDec = atual > 0;
            const podeInc = usados < maxLivres && atual < LIMITE_GRAU;

            const temBonusIntelectoII = intelectoIIInfo.ativo && intelectoIIInfo.codigo === codigo;

            // ✅ NOVO: Pegar valor total e bônus do preview
            const grauInfo = grausTotaisMap[codigo];
            const valorTotal = grauInfo?.total ?? null;
            const bonusOutros = grauInfo?.bonus ?? 0;

            return (
              <LinhaGrau
                key={codigo}
                nome={nome}
                codigo={codigo}
                valor={atual}
                valorTotal={valorTotal}
                bonusOutros={bonusOutros}
                podeDec={podeDec}
                podeInc={podeInc}
                temBonusIntelectoII={temBonusIntelectoII}
                onDec={() => props.onChangeValor(codigo, clamp(atual - 1, 0, LIMITE_GRAU))}
                onInc={() => props.onChangeValor(codigo, clamp(atual + 1, 0, LIMITE_GRAU))}
              />
            );
          })}
        </div>

        {/* ✅ 3. BÔNUS DE HABILIDADES (se houver) */}
        {previewCalculado?.bonusHabilidades && previewCalculado.bonusHabilidades.length > 0 && (
          <div className="rounded border border-app-warning/30 bg-app-warning/5 p-3">
            <p className="text-xs font-medium text-app-fg mb-2 flex items-center gap-2">
              <Icon name="sparkles" className="w-4 h-4 text-app-warning" />
              Bônus de habilidades
            </p>
            <ul className="space-y-1.5">
              {previewCalculado.bonusHabilidades.map((bonus, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between text-xs rounded bg-app-surface border border-app-border px-2 py-1"
                >
                  <span className="text-app-fg">
                    {bonus.tipoGrauCodigo}{' '}
                    <span className="text-[10px] text-app-muted">({bonus.habilidadeNome})</span>
                  </span>
                  <span className="font-semibold text-app-warning">+{bonus.valor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
