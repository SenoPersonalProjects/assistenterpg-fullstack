'use client';

import { Button } from '@/components/ui/Button';
import type { EventoSessaoTimeline } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { formatarDataHora } from '@/lib/utils/formatters';

type TimelinePanelProps = {
  eventosSessao: EventoSessaoTimeline[];
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  desfazendoEventoId: number | null;
  onAbrirDetalhes: (evento: EventoSessaoTimeline) => void;
  onDesfazerEvento: (eventoId: number) => void;
};

export function TimelinePanel({
  eventosSessao,
  sessaoEncerrada,
  podeControlarSessao,
  desfazendoEventoId,
  onAbrirDetalhes,
  onDesfazerEvento,
}: TimelinePanelProps) {
  return (
    <div className="max-h-[420px] overflow-y-auto rounded border border-app-border p-2 space-y-2">
      {eventosSessao.length === 0 ? (
        <p className="text-xs text-app-muted">
          Nenhum evento operacional registrado ainda.
        </p>
      ) : (
        eventosSessao.map((evento) => (
          <div
            key={evento.id}
            className="rounded border border-app-border bg-app-surface px-2 py-2 space-y-1"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-app-fg">
                {textoSeguro(evento.descricao)}
              </p>
              {evento.desfeito ? (
                <span className="text-[10px] rounded border border-app-border px-1.5 py-0.5 text-app-muted">
                  Desfeito
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-app-muted">
              {textoSeguro(evento.tipoEvento)}
              {typeof evento.cenaId === 'number' ? ` | Cena #${evento.cenaId}` : ''}
            </p>
            <p className="text-[11px] text-app-muted">
              {formatarDataHora(evento.criadoEm)}
              {evento.autor?.apelido ? ` por ${textoSeguro(evento.autor.apelido)}` : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => onAbrirDetalhes(evento)}>
                Detalhes
              </Button>
              {podeControlarSessao && evento.podeDesfazer ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onDesfazerEvento(evento.id)}
                  disabled={Boolean(desfazendoEventoId) || sessaoEncerrada}
                >
                  {desfazendoEventoId === evento.id ? 'Desfazendo...' : 'Desfazer evento'}
                </Button>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

