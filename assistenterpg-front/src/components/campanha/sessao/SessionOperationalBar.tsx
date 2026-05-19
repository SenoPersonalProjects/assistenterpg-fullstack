'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';

type AcaoControleTurno = 'AVANCAR' | 'VOLTAR' | 'PULAR';

type SessionOperationalBarProps = {
  cenaLabel: string;
  cenaNome?: string | null;
  rodadaAtual?: number | null;
  turnoAtualLabel?: string | null;
  proximoTurnoLabel?: string | null;
  sessaoEncerrada: boolean;
  realtimeAtivo: boolean;
  realtimeStatus?: 'online' | 'reconnecting' | 'polling';
  controleTurnosAtivo: boolean;
  combateAtivo?: boolean;
  podeControlarSessao: boolean;
  totalParticipantesOnline?: number;
  totalParticipantes?: number;
  erro?: string | null;
  acaoTurnoPendente: AcaoControleTurno | null;
  onAvancarTurno: () => void;
  onPularTurno: () => void;
  onVoltarTurno: () => void;
  className?: string;
};

export const SessionOperationalBar = forwardRef<
  HTMLElement,
  SessionOperationalBarProps
>(function SessionOperationalBar(
  {
    cenaLabel,
    cenaNome,
    rodadaAtual,
    turnoAtualLabel,
    proximoTurnoLabel,
    sessaoEncerrada,
    realtimeAtivo,
    realtimeStatus,
    controleTurnosAtivo,
    combateAtivo = false,
    podeControlarSessao,
    totalParticipantesOnline,
    totalParticipantes,
    erro,
    acaoTurnoPendente,
    onAvancarTurno,
    onPularTurno,
    onVoltarTurno,
    className = '',
  },
  ref,
) {
  const [atalhosAbertos, setAtalhosAbertos] = useState(false);
  const statusTempoReal =
    realtimeStatus ?? (realtimeAtivo ? 'online' : 'polling');

  const statusConfig: Record<
    'online' | 'reconnecting' | 'polling',
    { label: string; color: string; icon: IconName }
  > = {
    online: { label: 'Conectado', color: 'text-app-success', icon: 'bolt' },
    reconnecting: { label: 'Reconectando', color: 'text-app-warning', icon: 'refresh' },
    polling: { label: 'Periódica', color: 'text-app-muted', icon: 'refresh' },
  };
  const statusAtual = statusConfig[statusTempoReal];

  return (
    <section
      ref={ref}
      className={`session-operational-bar border-t-2 border-t-app-primary/40 shadow-xl backdrop-blur-xl ${
        combateAtivo ? 'session-operational-bar--combat ring-1 ring-app-orange/20' : ''
      } ${className}`}
    >
      <Card variant="glass" className="p-0">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary shadow-inner ${combateAtivo ? 'animate-pulse text-app-orange bg-app-orange/10' : ''}`}>
              <Icon name={combateAtivo ? 'swords' : 'shield'} className="h-6 w-6" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-primary">
                {controleTurnosAtivo ? 'Turno Atual' : 'Modo Livre'}
              </span>
              <span className="text-lg font-black tracking-tighter text-app-fg">
                {controleTurnosAtivo ? (turnoAtualLabel ?? 'Iniciando...') : 'Exploração'}
              </span>
            </div>
          </div>

          {podeControlarSessao && controleTurnosAtivo && (
            <div className="flex items-center gap-2 rounded-2xl bg-app-surface/40 p-1.5 border border-app-border/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onVoltarTurno}
                disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
                className="h-9 w-9 p-0 rounded-xl hover:bg-app-danger/10 hover:text-app-danger"
              >
                <Icon name="rotate-ccw" className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPularTurno}
                disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
                className="h-9 w-9 p-0 rounded-xl hover:bg-app-warning/10 hover:text-app-warning"
              >
                <Icon name="skip-forward" className="h-4 w-4" />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onAvancarTurno}
                disabled={sessaoEncerrada || Boolean(acaoTurnoPendente)}
                className="px-4 font-black rounded-xl shadow-lg shadow-app-primary/20"
              >
                {acaoTurnoPendente === 'AVANCAR' ? '...' : 'Próximo'}
                <Icon name="forward" className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">Cena</span>
            <span className="text-xs font-bold text-app-fg">
              {cenaLabel}{cenaNome ? ` — ${cenaNome}` : ''}
            </span>
          </div>

          {controleTurnosAtivo && (
            <>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">Rodada</span>
                <span className="text-xs font-black text-app-primary">{rodadaAtual ?? 1}</span>
              </div>

              <div className="hidden flex-col md:flex">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">Próximo</span>
                <span className="text-xs font-bold text-app-fg/70">{proximoTurnoLabel ?? '—'}</span>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 border-l border-app-border/20 pl-4 md:pl-8">
            <motion.div
              initial={false}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${statusAtual.color}`}
            >
              <Icon name={statusAtual.icon} className="h-3 w-3" />
              {statusAtual.label}
            </motion.div>

            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-app-muted">
              <Icon name="user" className="h-3 w-3" />
              {totalParticipantesOnline}/{totalParticipantes}
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => setAtalhosAbertos(true)}
              className="h-6 w-6 p-0 rounded-lg text-app-muted hover:text-app-primary"
            >
              <Icon name="info" className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {erro && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ErrorAlert message={erro} className="rounded-none border-0 border-t border-app-danger/20 bg-app-danger/5" />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={atalhosAbertos}
        onClose={() => setAtalhosAbertos(false)}
        title="Atalhos da sessão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs font-medium text-app-muted leading-relaxed">
            Atalhos funcionam quando o foco não está em campos de texto.
          </p>
          <div className="space-y-2">
            {[
              { label: 'Avançar turno', key: '.' },
              { label: 'Voltar turno', key: 'Shift + ,' },
              { label: 'Pular turno', key: 'Shift + /' },
            ].map((shortcut) => (
              <div key={shortcut.label} className="flex items-center justify-between rounded-xl bg-app-bg/50 p-3 border border-app-border/10">
                <span className="text-xs font-bold text-app-fg">{shortcut.label}</span>
                <span className="rounded-lg bg-app-surface px-2 py-1 text-[10px] font-black shadow-sm ring-1 ring-app-border/20">
                  {shortcut.key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      </Card>
    </section>
  );
});

SessionOperationalBar.displayName = 'SessionOperationalBar';

export type { AcaoControleTurno };



