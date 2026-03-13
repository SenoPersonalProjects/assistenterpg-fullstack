'use client';

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
  className?: string;
};

type LinhaRecurso = {
  key: string;
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
        <span className="session-initiative-badge">
          INI {typeof iniciativaValor === 'number' ? iniciativaValor : '--'}
        </span>
      </div>

      <div className="session-resource-list">
        {linhas.map((linha) => (
          <div key={linha.key} className="session-resource-row">
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
          </div>
        ))}
      </div>
    </div>
  );
}

