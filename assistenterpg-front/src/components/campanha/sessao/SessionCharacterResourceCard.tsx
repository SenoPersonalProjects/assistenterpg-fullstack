'use client';

import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

type RecursosResumo = {
  pvAtual: number;
  pvMax: number;
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
  acaoPendenteCampo = null,
  desabilitado = false,
  className = '',
}: SessionCharacterResourceCardProps) {
  const linhas: LinhaRecurso[] = [
    {
      key: 'pv',
      label: 'Vida',
      atual: recursos.pvAtual,
      maximo: recursos.pvMax,
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
    </div>
  );
}
