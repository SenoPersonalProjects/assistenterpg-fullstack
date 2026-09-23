'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { EventoSessaoTimeline } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { formatarDataHora } from '@/lib/utils/formatters';

type EventoDetalheModalProps = {
  evento: EventoSessaoTimeline | null;
  onClose: () => void;
  onDesfazerEvento: (evento: EventoSessaoTimeline, motivo?: string) => void;
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  desfazendoEventoId: number | null;
  motivoDesfazer: string;
  onMotivoDesfazerChange: (valor: string) => void;
  dadosEventoDetalhe: string;
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
}: EventoDetalheModalProps) {
  const podeDesfazer = Boolean(evento && podeControlarSessao && evento.podeDesfazer);

  return (
    <Modal
      isOpen={Boolean(evento)}
      onClose={onClose}
      title="Detalhes do evento da sessão"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          {podeDesfazer && evento ? (
            <Button
              variant="destructive"
              onClick={() => onDesfazerEvento(evento, motivoDesfazer)}
              disabled={sessaoEncerrada || Boolean(desfazendoEventoId)}
            >
              {desfazendoEventoId === evento.id ? 'Desfazendo...' : 'Desfazer evento'}
            </Button>
          ) : null}
        </>
      }
    >
      {evento ? (
        <div className="space-y-4">
          <div className="rounded border border-app-border bg-app-surface p-3 space-y-1">
            <p className="text-sm font-semibold text-app-fg">
              {textoSeguro(evento.descricao)}
            </p>
            <p className="text-xs text-app-muted">
              Tipo: {textoSeguro(evento.tipoEvento)}
              {typeof evento.cenaId === 'number' ? ` | Cena #${evento.cenaId}` : ''}
            </p>
            <p className="text-xs text-app-muted">
              {formatarDataHora(evento.criadoEm)}
              {evento.autor?.apelido ? ` por ${textoSeguro(evento.autor.apelido)}` : ''}
            </p>
            {evento.desfeito ? (
              <p className="text-xs text-app-muted">Evento marcado como desfeito.</p>
            ) : null}
          </div>

          {evento.contexto?.categoria === 'DOMINIO' ? (
            <div className="rounded border border-app-secondary/40 bg-app-secondary/10 p-3 space-y-2">
              <p className="text-xs font-semibold text-app-fg">Linha do tempo de Domínios</p>
              {evento.contexto.dominios.length ? (
                <p className="text-xs text-app-muted">Domínio: {evento.contexto.dominios.map((item) => item.nome).join(' · ')}</p>
              ) : null}
              {evento.contexto.personagens.length ? (
                <p className="text-xs text-app-muted">Personagem: {evento.contexto.personagens.map((item) => item.nome).join(' · ')}</p>
              ) : null}
              {evento.contexto.npcs.length ? (
                <p className="text-xs text-app-muted">NPC: {evento.contexto.npcs.map((item) => item.nome).join(' · ')}</p>
              ) : null}
            </div>
          ) : null}

          {podeDesfazer ? (
            <div className="rounded border border-app-border bg-app-bg p-3 space-y-2">
              <p className="text-xs font-semibold text-app-fg">Desfazer evento</p>
              <Input
                label="Motivo para desfazer (opcional)"
                value={motivoDesfazer}
                onChange={(event) => onMotivoDesfazerChange(event.target.value)}
                placeholder="Ex.: ação aplicada por engano"
                disabled={sessaoEncerrada || Boolean(desfazendoEventoId)}
              />
            </div>
          ) : null}

          <details className="rounded border border-app-border bg-app-bg p-3">
            <summary className="cursor-pointer text-xs font-semibold text-app-fg">
              Dados tecnicos
            </summary>
            <pre className="mt-2 max-h-[320px] overflow-auto rounded border border-app-border bg-app-surface p-2 text-[11px] text-app-muted whitespace-pre-wrap break-words">
              {dadosEventoDetalhe}
            </pre>
          </details>
        </div>
      ) : null}
    </Modal>
  );
}
