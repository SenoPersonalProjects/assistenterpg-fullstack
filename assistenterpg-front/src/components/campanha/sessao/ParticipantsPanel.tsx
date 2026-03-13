'use client';

type ParticipanteItem = {
  usuarioId: number;
  apelido: string;
  papel: string;
  ehDono: boolean;
};

type ParticipantsPanelProps = {
  participantes: ParticipanteItem[];
  onlineSet: Set<number>;
  labelPapelParticipante: (papel: string) => string;
  textoSeguro: (valor: string | null | undefined) => string;
};

export function ParticipantsPanel({
  participantes,
  onlineSet,
  labelPapelParticipante,
  textoSeguro,
}: ParticipantsPanelProps) {
  if (participantes.length === 0) {
    return (
      <p className="text-xs text-app-muted">
        Nenhum participante carregado para esta campanha.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {participantes.map((participante) => {
        const online = onlineSet.has(participante.usuarioId);

        return (
          <div
            key={participante.usuarioId}
            className="flex items-center justify-between rounded border border-app-border bg-app-surface px-2 py-1.5"
          >
            <div>
              <p className="text-xs font-semibold text-app-fg">
                {textoSeguro(participante.apelido)}
                {participante.ehDono ? ' (Dono)' : ''}
              </p>
              <p className="text-[11px] text-app-muted">
                {labelPapelParticipante(participante.papel)}
              </p>
            </div>
            <span
              className={
                online
                  ? 'text-[11px] font-medium text-emerald-300'
                  : 'text-[11px] font-medium text-app-muted'
              }
            >
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

