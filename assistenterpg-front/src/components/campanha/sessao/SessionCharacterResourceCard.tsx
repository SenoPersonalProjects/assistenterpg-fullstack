'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { NucleoAmaldicoadoCodigo } from '@/lib/types/campanha.types';

type RecursosResumo = {
  pvAtual: number;
  pvMax: number;
  pvBarrasTotal?: number;
  pvBarrasRestantes?: number;
  pvBarraMaxAtual?: number;
  nucleoAtivo?: NucleoAmaldicoadoCodigo | null;
  nucleosDisponiveis?: NucleoAmaldicoadoCodigo[];
  sanAtual: number;
  sanMax: number;
  eaAtual: number;
  eaMax: number;
  peAtual: number;
  peMax: number;
};

type SessionCharacterResourceCardProps = {
  nomePersonagem: string;
  nomeJogador?: string;
  iniciativaValor?: number | null;
  recursos: RecursosResumo;
  expandido?: boolean;
  onAlternarExpandido?: () => void;
  podeAjustar?: boolean;
  ajustePersonalizado?: Partial<Record<LinhaRecurso['key'], string>>;
  onAtualizarAjustePersonalizado?: (campo: LinhaRecurso['key'], valor: string) => void;
  onAplicarAjustePersonalizado?: (campo: LinhaRecurso['key']) => void;
  onAplicarAjusteRapido?: (campo: LinhaRecurso['key'], delta: number) => void;
  onSelecionarNucleo?: (nucleo: NucleoAmaldicoadoCodigo) => void;
  onSacrificarNucleo?: (payload: {
    modo: 'ATUAL' | 'OUTRO';
    nucleo?: NucleoAmaldicoadoCodigo;
  }) => void;
  acaoPendenteCampo?: LinhaRecurso['key'] | null;
  desabilitado?: boolean;
  className?: string;
};

type LinhaRecurso = {
  key: 'pv' | 'san' | 'ea' | 'pe';
  label: string;
  atual: number;
  maximo: number;
  tone: 'pv' | 'san' | 'ea' | 'pe';
};

function clampPercentual(atual: number, maximo: number): number {
  if (!Number.isFinite(atual) || !Number.isFinite(maximo) || maximo <= 0) return 0;
  const percentual = (atual / maximo) * 100;
  return Math.max(0, Math.min(100, percentual));
}

const NUCLEO_LABELS: Record<NucleoAmaldicoadoCodigo, string> = {
  EQUILIBRIO: 'Equilibrio',
  PODER: 'Poder',
  IMPULSO: 'Impulso',
};

export function SessionCharacterResourceCard({
  nomePersonagem,
  nomeJogador,
  iniciativaValor,
  recursos,
  expandido = false,
  onAlternarExpandido,
  podeAjustar = false,
  ajustePersonalizado,
  onAtualizarAjustePersonalizado,
  onAplicarAjustePersonalizado,
  onAplicarAjusteRapido,
  onSelecionarNucleo,
  onSacrificarNucleo,
  acaoPendenteCampo = null,
  desabilitado = false,
  className = '',
}: SessionCharacterResourceCardProps) {
  const [modalSacrificioAberto, setModalSacrificioAberto] = useState(false);
  const [modoSacrificio, setModoSacrificio] = useState<'ATUAL' | 'OUTRO'>('ATUAL');
  const [nucleoSacrificio, setNucleoSacrificio] =
    useState<NucleoAmaldicoadoCodigo | null>(null);

  const pvBarrasTotal = recursos.pvBarrasTotal ?? 1;
  const pvBarrasRestantes = recursos.pvBarrasRestantes ?? pvBarrasTotal;
  const pvBarraMaxAtual = recursos.pvBarraMaxAtual ?? recursos.pvMax;
  const temBarras = pvBarrasTotal > 1;
  const nucleosDisponiveis = useMemo(
    () => recursos.nucleosDisponiveis ?? [],
    [recursos.nucleosDisponiveis],
  );
  const nucleoAtivo =
    recursos.nucleoAtivo ?? nucleosDisponiveis[0] ?? null;

  const nucleosParaSacrificio = useMemo(
    () =>
      nucleosDisponiveis.filter((nucleo) => nucleo !== nucleoAtivo),
    [nucleosDisponiveis, nucleoAtivo],
  );

  const podeSacrificar =
    podeAjustar &&
    recursos.pvAtual <= 0 &&
    pvBarrasRestantes > 1 &&
    nucleosDisponiveis.length > 0;

  const linhas: LinhaRecurso[] = [
    {
      key: 'pv',
      label: 'Vida',
      atual: recursos.pvAtual,
      maximo: temBarras ? pvBarraMaxAtual : recursos.pvMax,
      tone: 'pv',
    },
    {
      key: 'san',
      label: 'Sanidade',
      atual: recursos.sanAtual,
      maximo: recursos.sanMax,
      tone: 'san',
    },
    {
      key: 'ea',
      label: 'EA',
      atual: recursos.eaAtual,
      maximo: recursos.eaMax,
      tone: 'ea',
    },
    {
      key: 'pe',
      label: 'PE',
      atual: recursos.peAtual,
      maximo: recursos.peMax,
      tone: 'pe',
    },
  ];

  return (
    <div className={`session-resource-card ${className}`}>
      <div className="session-resource-card__head">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-app-fg">{nomePersonagem}</p>
          {nomeJogador ? (
            <p className="truncate text-[11px] text-app-muted">Jogador: {nomeJogador}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="session-initiative-badge">
            INI {typeof iniciativaValor === 'number' ? iniciativaValor : '--'}
          </span>
          {onAlternarExpandido ? (
            <Button
              size="xs"
              variant="ghost"
              onClick={onAlternarExpandido}
              title={expandido ? 'Recolher detalhes' : 'Expandir detalhes'}
            >
              <Icon
                name={expandido ? 'chevron-up' : 'chevron-down'}
                className="h-3.5 w-3.5"
              />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="session-resource-list">
        {linhas.map((linha) => (
          <div
            key={linha.key}
            className={`session-resource-row${
              acaoPendenteCampo === linha.key ? ' session-resource-row--pending' : ''
            }`}
          >
            <div className="session-resource-row__meta">
              <span className="session-resource-row__label">{linha.label}</span>
              <span className="session-resource-row__value">
                {linha.atual}/{linha.maximo}
              </span>
            </div>
            <div className="session-resource-track">
              <span
                className={`session-resource-fill session-resource-fill--${linha.tone}`}
                style={{ width: `${clampPercentual(linha.atual, linha.maximo)}%` }}
              />
            </div>
            {linha.key === 'pv' && temBarras ? (
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-app-muted">
                  <span>PV por nucleo: {pvBarraMaxAtual}</span>
                  <span>Total: {recursos.pvMax}</span>
                  <span>
                    Nucleos: {pvBarrasRestantes}/{pvBarrasTotal}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {nucleosDisponiveis.length > 0 ? (
                    nucleosDisponiveis.map((nucleo) => (
                      <Button
                        key={nucleo}
                        size="xs"
                        variant={nucleo === nucleoAtivo ? 'secondary' : 'ghost'}
                        onClick={() => onSelecionarNucleo?.(nucleo)}
                        disabled={
                          desabilitado ||
                          !podeAjustar ||
                          !onSelecionarNucleo ||
                          nucleo === nucleoAtivo
                        }
                      >
                        {NUCLEO_LABELS[nucleo]}
                      </Button>
                    ))
                  ) : (
                    <Badge size="sm">Nucleos indisponiveis</Badge>
                  )}
                  {podeSacrificar && onSacrificarNucleo ? (
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => {
                        setModoSacrificio('ATUAL');
                        setNucleoSacrificio(nucleosParaSacrificio[0] ?? null);
                        setModalSacrificioAberto(true);
                      }}
                      disabled={desabilitado}
                    >
                      Sacrificar nucleo
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {podeAjustar ? (
              <div className="session-resource-actions">
                <div className="session-resource-actions__quick">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => onAplicarAjusteRapido?.(linha.key, -5)}
                    disabled={desabilitado || acaoPendenteCampo === linha.key}
                  >
                    -5
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => onAplicarAjusteRapido?.(linha.key, -1)}
                    disabled={desabilitado || acaoPendenteCampo === linha.key}
                  >
                    -1
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => onAplicarAjusteRapido?.(linha.key, 1)}
                    disabled={desabilitado || acaoPendenteCampo === linha.key}
                  >
                    +1
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => onAplicarAjusteRapido?.(linha.key, 5)}
                    disabled={desabilitado || acaoPendenteCampo === linha.key}
                  >
                    +5
                  </Button>
                </div>
                <div className="session-resource-actions__custom">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ajustePersonalizado?.[linha.key] ?? '0'}
                    onChange={(event) =>
                      onAtualizarAjustePersonalizado?.(linha.key, event.target.value)
                    }
                    className="session-resource-actions__input"
                    placeholder="+3 / -2"
                    disabled={desabilitado || acaoPendenteCampo === linha.key}
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => onAplicarAjustePersonalizado?.(linha.key)}
                    disabled={desabilitado || acaoPendenteCampo === linha.key}
                  >
                    {acaoPendenteCampo === linha.key ? 'Aplicando...' : 'Aplicar'}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {temBarras ? (
        <Modal
          isOpen={modalSacrificioAberto}
          onClose={() => setModalSacrificioAberto(false)}
          title="Sacrificar nucleo"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalSacrificioAberto(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onSacrificarNucleo?.({
                    modo: modoSacrificio,
                    nucleo:
                      modoSacrificio === 'OUTRO'
                        ? nucleoSacrificio ?? undefined
                        : undefined,
                  });
                  setModalSacrificioAberto(false);
                }}
                disabled={
                  desabilitado ||
                  (modoSacrificio === 'OUTRO' && !nucleoSacrificio)
                }
              >
                Confirmar sacrificio
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm text-app-fg">
            <p className="text-xs text-app-muted">
              Sacrificar um nucleo restaura seu PV para a barra atual.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="modo-sacrificio"
                  value="ATUAL"
                  checked={modoSacrificio === 'ATUAL'}
                  onChange={() => setModoSacrificio('ATUAL')}
                />
                Sacrificar nucleo atual
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="modo-sacrificio"
                  value="OUTRO"
                  checked={modoSacrificio === 'OUTRO'}
                  onChange={() => setModoSacrificio('OUTRO')}
                />
                Sacrificar outro nucleo (3 PE)
              </label>
            </div>
            {modoSacrificio === 'OUTRO' ? (
              <div className="space-y-2">
                <p className="text-xs text-app-muted">Escolha o nucleo a perder:</p>
                <div className="flex flex-wrap gap-2">
                  {nucleosParaSacrificio.map((nucleo) => (
                    <Button
                      key={nucleo}
                      size="xs"
                      variant={nucleoSacrificio === nucleo ? 'secondary' : 'ghost'}
                      onClick={() => setNucleoSacrificio(nucleo)}
                    >
                      {NUCLEO_LABELS[nucleo]}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
