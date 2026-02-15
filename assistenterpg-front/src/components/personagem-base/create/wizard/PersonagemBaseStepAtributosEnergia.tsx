// components/personagem-base/create/wizard/PersonagemBaseStepAtributosEnergia.tsx
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { InfoTile } from '@/components/ui/InfoTile';
import { Alert } from '@/components/ui/Alert';

import type {
  AtributoBaseCodigo,
  PassivasAtributoConfigFront,
  PericiaCatalogo,
  ProficienciaCatalogo,
  TipoGrauCatalogo,
  CreatePersonagemBasePayload,
  PersonagemBasePreview,
} from '@/lib/api';
import { apiPreviewPersonagemBase } from '@/lib/api';
import { PassivasAtributosSelector } from '../PersonagemBasePassivasAtributosSelector';

type Props = {
  nivel: number;

  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;

  atributoChaveEa: 'INT' | 'PRE';

  passivasAtributosAtivos: AtributoBaseCodigo[];
  passivasAtributosConfig?: PassivasAtributoConfigFront;

  onChangeAgilidade: (v: number) => void;
  onChangeForca: (v: number) => void;
  onChangeIntelecto: (v: number) => void;
  onChangePresenca: (v: number) => void;
  onChangeVigor: (v: number) => void;

  onChangeAtributoChaveEa: (v: 'INT' | 'PRE') => void;
  onTogglePassivaAtributo: (atributo: AtributoBaseCodigo) => void;
  onChangePassivaConfig?: (config: PassivasAtributoConfigFront) => void;

  todasPericias: PericiaCatalogo[];
  todasProficiencias: ProficienciaCatalogo[];
  tiposGrau: TipoGrauCatalogo[];

  profsFinaisCodigos: string[];

  nome: string;
  classeId: string;
  origemId: string;
  claId: string;
  tecnicaInataId: string | null;
  trilhaId: string | null;
  caminhoId: string | null;
  estudouEscolaTecnica: boolean;
  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];
  graus: Record<string, number>;
  prestigioBase: number;
  prestigioClaBase: number | null;
  idade: number | null;
  alinhamentoId: string;
  background: string | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function calcularTotalAtributosEsperado(nivel: number): number {
  const base = 9;
  const marcos = [4, 7, 10, 13, 16, 19];
  const bonus = marcos.filter((m) => nivel >= m).length;
  return base + bonus;
}

function tetoPorNivel(nivel: number): number {
  return nivel <= 3 ? 3 : 7;
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet();

  const normalize = (v: any): any => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== 'object') return v;
    if (seen.has(v)) return undefined;
    seen.add(v);

    if (Array.isArray(v)) return v.map(normalize);

    const out: Record<string, any> = {};
    for (const k of Object.keys(v).sort()) {
      const nv = normalize(v[k]);
      if (nv !== undefined) out[k] = nv;
    }
    return out;
  };

  return JSON.stringify(normalize(value));
}

function sanitizarPassivasConfig(
  config: PassivasAtributoConfigFront | undefined,
  ativos: AtributoBaseCodigo[],
): PassivasAtributoConfigFront | undefined {
  if (!config) return undefined;
  if (!ativos.includes('INT')) return config;

  const sanitizado: PassivasAtributoConfigFront = { ...config };

  if (sanitizado.INT_I && !sanitizado.INT_I.periciaCodigoTreino) {
    delete (sanitizado as any).INT_I;
  }

  if (sanitizado.INT_II && !sanitizado.INT_II.periciaCodigoTreino) {
    delete (sanitizado as any).INT_II;
  }

  const temConfig = Object.keys(sanitizado).some(
    (k) => k !== 'passivaIdToIndex' && sanitizado[k as keyof PassivasAtributoConfigFront]
  );

  return temConfig || sanitizado.passivaIdToIndex ? sanitizado : undefined;
}

type LinhaAtributoProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  canInc: boolean;
  canDec: boolean;
  onInc: () => void;
  onDec: () => void;
};

function LinhaAtributo({
  label,
  value,
  min,
  max,
  canInc,
  canDec,
  onInc,
  onDec,
}: LinhaAtributoProps) {
  const isMin = value <= min;
  const isMax = value >= max;

  const ringClass = isMin
    ? 'border-app-danger/60 ring-1 ring-app-danger/20'
    : isMax
      ? 'border-amber-400/50 ring-1 ring-amber-400/20'
      : 'border-app-border';

  const valueChipClass = isMin
    ? 'bg-app-danger/10 text-app-danger border-app-danger/30'
    : isMax
      ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
      : 'bg-app-bg/30 text-app-fg border-app-border';

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded border bg-app-surface p-3 transition-all ${ringClass}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-app-fg">{label}</p>
        <p className="text-xs text-app-muted">
          Min {min} • Máx {max}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!canDec}
          onClick={onDec}
          className="h-8 w-10 px-0"
          aria-label={`Diminuir ${label}`}
        >
          <Icon name="minus" className="w-4 h-4" />
        </Button>

        <div
          className={`w-12 text-center text-sm font-semibold rounded border px-2 py-1 transition-all ${valueChipClass}`}
          aria-label={`${label}: ${value}`}
          title={isMin ? 'Está no mínimo' : isMax ? 'Está no máximo' : undefined}
        >
          {value}
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={!canInc}
          onClick={onInc}
          className="h-8 w-10 px-0"
          aria-label={`Aumentar ${label}`}
        >
          <Icon name="add" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function PersonagemBaseStepAtributosEnergia(props: Props) {
  const {
    nivel,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    atributoChaveEa,
    passivasAtributosAtivos,
    passivasAtributosConfig,
    onChangeAgilidade,
    onChangeForca,
    onChangeIntelecto,
    onChangePresenca,
    onChangeVigor,
    onChangeAtributoChaveEa,
    onTogglePassivaAtributo,
    onChangePassivaConfig,
    todasPericias,
    todasProficiencias,
    tiposGrau,
    profsFinaisCodigos,
    nome,
    classeId,
    origemId,
    claId,
    tecnicaInataId,
    trilhaId,
    caminhoId,
    estudouEscolaTecnica,
    periciasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    graus,
    prestigioBase,
    prestigioClaBase,
    idade,
    alinhamentoId,
    background,
  } = props;

  const [previewBase, setPreviewBase] = useState<PersonagemBasePreview | null>(null);

  const reqBaseRef = useRef(0);
  const previewDebounceRef = useRef<number | null>(null);
  const lastPayloadKeyRef = useRef<string | null>(null);

  const teto = useMemo(() => tetoPorNivel(nivel), [nivel]);
  const totalEsperado = useMemo(() => calcularTotalAtributosEsperado(nivel), [nivel]);

  const somaAtributos = agilidade + forca + intelecto + presenca + vigor;

  const restantes = totalEsperado - somaAtributos;
  const excedeuTotal = restantes < 0;

  const temAtributoAcimaDoTeto = useMemo(() => {
    const valores = [agilidade, forca, intelecto, presenca, vigor];
    return valores.some((v) => v > teto);
  }, [agilidade, forca, intelecto, presenca, vigor, teto]);

  const okDistribuicao = !excedeuTotal && !temAtributoAcimaDoTeto && restantes === 0;

  const podeFazerPreview = useMemo(() => {
    if (!classeId || !origemId || !claId) return false;
    if (!okDistribuicao) return false;
    return true;
  }, [classeId, origemId, claId, okDistribuicao]);

  const payloadBase = useMemo<CreatePersonagemBasePayload | null>(() => {
    if (!podeFazerPreview) return null;

    const configSanitizado = sanitizarPassivasConfig(
      passivasAtributosConfig,
      passivasAtributosAtivos,
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
      atributoChaveEa,

      prestigioBase,
      prestigioClaBase,
      idade,
      alinhamentoId: alinhamentoId ? Number(alinhamentoId) : null,
      background,

      periciasClasseEscolhidasCodigos,
      periciasOrigemEscolhidasCodigos,
      periciasLivresCodigos,

      grausAprimoramento: Object.entries(graus)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tipoGrauCodigo, valor]) => ({ tipoGrauCodigo, valor })),

      grausTreinamento: [],

      passivasAtributosAtivos: passivasAtributosAtivos?.length
        ? passivasAtributosAtivos
        : undefined,

      passivasAtributosConfig: configSanitizado,

      proficienciasCodigos: profsFinaisCodigos,
    };

    return payload;
  }, [
    podeFazerPreview,
    nome,
    nivel,
    claId,
    origemId,
    classeId,
    trilhaId,
    caminhoId,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    estudouEscolaTecnica,
    tecnicaInataId,
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
    passivasAtributosAtivos,
    passivasAtributosConfig,
    profsFinaisCodigos,
  ]);

  // ✅ CORRIGIDO: Remover parâmetro token
  useEffect(() => {
    if (!payloadBase) {
      if (previewDebounceRef.current) window.clearTimeout(previewDebounceRef.current);
      lastPayloadKeyRef.current = null;
      setPreviewBase(null);
      return;
    }

    const payloadKey = stableStringify(payloadBase);
    if (lastPayloadKeyRef.current === payloadKey) return;
    lastPayloadKeyRef.current = payloadKey;

    if (previewDebounceRef.current) window.clearTimeout(previewDebounceRef.current);

    const reqId = ++reqBaseRef.current;

    previewDebounceRef.current = window.setTimeout(() => {
      // ✅ MUDANÇA: Não passa mais o token
      apiPreviewPersonagemBase(payloadBase)
        .then((res) => {
          if (reqId !== reqBaseRef.current) return;
          setPreviewBase(res);
        })
        .catch((error) => {
          if (reqId !== reqBaseRef.current) return;
          console.error('Erro ao buscar preview base (atributos):', error);
          setPreviewBase(null);
        });
    }, 250);

    return () => {
      if (previewDebounceRef.current) window.clearTimeout(previewDebounceRef.current);
    };
  }, [payloadBase]); // ✅ Remover 'token' das dependências

  function makeHandlers(
    value: number,
    onChange: (v: number) => void,
  ): { inc: () => void; dec: () => void; canInc: boolean; canDec: boolean } {
    const min = 0;
    const max = teto;

    const canInc = restantes > 0 && value < max;
    const canDec = value > min;

    return {
      inc: () => {
        if (!canInc) return;
        onChange(clamp(value + 1, min, max));
      },
      dec: () => {
        if (!canDec) return;
        onChange(clamp(value - 1, min, max));
      },
      canInc,
      canDec,
    };
  }

  const agiH = makeHandlers(agilidade, onChangeAgilidade);
  const forH = makeHandlers(forca, onChangeForca);
  const intH = makeHandlers(intelecto, onChangeIntelecto);
  const preH = makeHandlers(presenca, onChangePresenca);
  const vigH = makeHandlers(vigor, onChangeVigor);

  return (
    <div className="space-y-6">
      {/* Distribuição de atributos */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="chart" className="w-4 h-4 text-app-primary" />
          Distribuição de atributos
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <InfoTile label="Nível" value={nivel} />
            <InfoTile label="Pool" value={totalEsperado} />
            <InfoTile
              label="Usados"
              value={
                <span className={excedeuTotal ? 'text-app-danger' : 'text-app-fg'}>
                  {somaAtributos}
                </span>
              }
            />
            <InfoTile
              label="Restantes"
              value={
                <span
                  className={excedeuTotal ? 'text-app-danger' : 'text-app-success'}
                >
                  {restantes}
                </span>
              }
            />
          </div>

          <p className="text-xs text-app-muted">
            Teto por atributo:{' '}
            <span className="text-app-fg font-semibold">{teto}</span> (nível{' '}
            {nivel <= 3 ? '1–3' : '4+'})
          </p>

          {okDistribuicao ? (
            <Alert variant="success">
              <div className="flex items-center gap-2 text-xs">
                <Icon name="check" className="h-4 w-4" />
                <span className="font-semibold">Distribuição válida</span>
                <span className="text-app-muted">
                  • Soma correta e nenhum atributo acima do teto.
                </span>
              </div>
            </Alert>
          ) : (
            <Alert variant="warning">
              <div className="flex items-start gap-2 text-xs">
                <div>
                  <p className="font-semibold mb-1">Ajustes necessários</p>
                  <div className="space-y-1 text-app-muted">
                    {excedeuTotal && (
                      <p className="text-app-danger">
                        • Soma de atributos acima do total permitido para o nível.
                      </p>
                    )}
                    {temAtributoAcimaDoTeto && (
                      <p className="text-app-danger">
                        • Existe atributo acima do teto permitido.
                      </p>
                    )}
                    {restantes > 0 && !excedeuTotal && !temAtributoAcimaDoTeto && (
                      <p className="text-app-warning">
                        • Ainda falta distribuir {restantes} ponto
                        {restantes !== 1 ? 's' : ''}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          )}

          <div className="grid gap-2">
            <LinhaAtributo
              label="Agilidade"
              value={agilidade}
              min={0}
              max={teto}
              canInc={agiH.canInc}
              canDec={agiH.canDec}
              onInc={agiH.inc}
              onDec={agiH.dec}
            />
            <LinhaAtributo
              label="Força"
              value={forca}
              min={0}
              max={teto}
              canInc={forH.canInc}
              canDec={forH.canDec}
              onInc={forH.inc}
              onDec={forH.dec}
            />
            <LinhaAtributo
              label="Intelecto"
              value={intelecto}
              min={0}
              max={teto}
              canInc={intH.canInc}
              canDec={intH.canDec}
              onInc={intH.inc}
              onDec={intH.dec}
            />
            <LinhaAtributo
              label="Presença"
              value={presenca}
              min={0}
              max={teto}
              canInc={preH.canInc}
              canDec={preH.canDec}
              onInc={preH.inc}
              onDec={preH.dec}
            />
            <LinhaAtributo
              label="Vigor"
              value={vigor}
              min={0}
              max={teto}
              canInc={vigH.canInc}
              canDec={vigH.canDec}
              onInc={vigH.inc}
              onDec={vigH.dec}
            />
          </div>
        </div>
      </div>

      {/* Energia amaldiçoada */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="sparkles" className="w-4 h-4 text-app-primary" />
          Energia amaldiçoada
        </h3>

        <Select
          label="Atributo-chave *"
          value={atributoChaveEa}
          onChange={(e) =>
            onChangeAtributoChaveEa(e.target.value as Props['atributoChaveEa'])
          }
          helperText="Define qual atributo alimenta sua reserva de energia amaldiçoada"
        >
          <option value="INT">Intelecto</option>
          <option value="PRE">Presença</option>
        </Select>
      </div>

      {/* Passivas de atributos */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="star" className="w-4 h-4 text-app-primary" />
          Passivas de atributos
        </h3>

        <p className="text-xs text-app-muted mb-3">
          Selecione até 2 atributos para ativar passivas (dependendo do valor do
          atributo).
        </p>

        <PassivasAtributosSelector
          atributos={{ agilidade, forca, intelecto, presenca, vigor }}
          ativos={passivasAtributosAtivos}
          onToggle={onTogglePassivaAtributo}
          escolhasConfig={passivasAtributosConfig ?? {}}
          onChangeEscolha={onChangePassivaConfig ?? (() => {})}
          todasPericias={todasPericias}
          todasProficiencias={todasProficiencias}
          tiposGrau={tiposGrau}
          profsFinaisCodigos={profsFinaisCodigos}
          previewBase={previewBase}
        />
      </div>
    </div>
  );
}
