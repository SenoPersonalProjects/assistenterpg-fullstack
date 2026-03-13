'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { EventoSessaoTimeline } from '@/lib/types';

type EventoDetalheModalProps = {
  evento: EventoSessaoTimeline | null;
  onClose: () => void;
  onDesfazerEvento: (eventoId: number, motivo?: string) => void;
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  desfazendoEventoId: number | null;
  motivoDesfazer: string;
  onMotivoDesfazerChange: (valor: string) => void;
  dadosEventoDetalhe: string;
  textoSeguro: (value: string | null | undefined) => string;
  formatarDataHora: (valor: string) => string;
};

export function EventoDetalheModal({
  evento,
  onClose,
  onDesfazerEvento,
  sessaoEncerrada,
  podeControlarSessao,
  desfazendoEventoId,
  motivoDesfazer,
  onMotivoDesfazerChange,
  dadosEventoDetalhe,
  textoSeguro,
  formatarDataHora,
}: EventoDetalheModalProps) {
  const podeDesfazer = Boolean(evento && podeControlarSessao && evento.podeDesfazer);

  return (
    <Modal
      isOpen={Boolean(evento)}
      onClose={onClose}
      title="Detalhes do evento da sessao"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          {podeDesfazer && evento ? (
            <Button
              variant="secondary"
              onClick={() => onDesfazerEvento(evento.id, motivoDesfazer)}
              disabled={sessaoEncerrada || Boolean(desfazendoEventoId)}
            >
              {desfazendoEventoId === evento.id ? 'Desfazendo...' : 'Desfazer evento'}
            </Button>
          ) : null}
        </>
      }
    >
      {evento ? (
        <div className="space-y-3">
          <div className="rounded border border-app-border bg-app-bg p-2 space-y-1">
            <p className="text-xs font-semibold text-app-fg">{textoSeguro(evento.descricao)}</p>
            <p className="text-[11px] text-app-muted">
              Tipo: {textoSeguro(evento.tipoEvento)}
              {typeof evento.cenaId === 'number' ? ` | Cena #${evento.cenaId}` : ''}
            </p>
            <p className="text-[11px] text-app-muted">
              {formatarDataHora(evento.criadoEm)}
              {evento.autor?.apelido ? ` por ${textoSeguro(evento.autor.apelido)}` : ''}
            </p>
            {evento.desfeito ? (
              <p className="text-[11px] text-app-muted">Evento marcado como desfeito.</p>
            ) : null}
          </div>

          {podeDesfazer ? (
            <Input
              label="Motivo para desfazer (opcional)"
              value={motivoDesfazer}
              onChange={(event) => onMotivoDesfazerChange(event.target.value)}
              placeholder="Ex.: acao aplicada por engano"
              disabled={sessaoEncerrada || Boolean(desfazendoEventoId)}
            />
          ) : null}

          <div className="rounded border border-app-border bg-app-bg p-2 space-y-2">
            <p className="text-xs font-semibold text-app-fg">Dados brutos</p>
            <pre className="max-h-[320px] overflow-auto rounded border border-app-border bg-app-surface p-2 text-[11px] text-app-muted whitespace-pre-wrap break-words">
              {dadosEventoDetalhe}
            </pre>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
