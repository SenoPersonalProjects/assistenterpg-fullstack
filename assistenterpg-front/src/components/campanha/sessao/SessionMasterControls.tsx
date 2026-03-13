'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import type { TipoCenaSessaoCampanha } from '@/lib/types';
import type { AcaoControleTurno } from '@/components/campanha/sessao/types';

type SessionMasterControlsProps = {
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  controleTurnosAtivo: boolean;
  cenaTipo: TipoCenaSessaoCampanha;
  cenaNome: string;
  opcoesCena: Array<{ value: TipoCenaSessaoCampanha; label: string }>;
  atualizandoCena: boolean;
  acaoTurnoPendente: AcaoControleTurno | null;
  encerrandoSessao: boolean;
  onCenaTipoChange: (tipo: TipoCenaSessaoCampanha) => void;
  onCenaNomeChange: (nome: string) => void;
  onAtualizarCena: () => void;
  onControleTurno: (acao: AcaoControleTurno) => void;
  onSolicitarEncerrarSessao: () => void;
};

export function SessionMasterControls({
  podeControlarSessao,
  sessaoEncerrada,
  controleTurnosAtivo,
  cenaTipo,
  cenaNome,
  opcoesCena,
  atualizandoCena,
  acaoTurnoPendente,
  encerrandoSessao,
  onCenaTipoChange,
  onCenaNomeChange,
  onAtualizarCena,
  onControleTurno,
  onSolicitarEncerrarSessao,
}: SessionMasterControlsProps) {
  if (!podeControlarSessao) {
    return (
      <SessionPanel
        title="Controle da sessao"
        subtitle="Apenas o mestre pode trocar cena e controlar turnos."
      >
        <p className="text-sm text-app-muted">
          Apenas o mestre pode trocar cena e controlar turnos.
        </p>
      </SessionPanel>
    );
  }

  return (
    <SessionPanel
      title="Controle do mestre"
      subtitle="Ajustes de cena, turnos e encerramento da sessao."
    >
      <Select
        label="Tipo de cena"
        value={cenaTipo}
        onChange={(event) => onCenaTipoChange(event.target.value as TipoCenaSessaoCampanha)}
        options={opcoesCena}
        disabled={sessaoEncerrada}
      />
      <Input
        label="Nome da cena (opcional)"
        value={cenaNome}
        onChange={(event) => onCenaNomeChange(event.target.value)}
        maxLength={120}
        disabled={sessaoEncerrada}
      />
      <div className="flex items-center gap-2">
        <Button onClick={onAtualizarCena} disabled={atualizandoCena || sessaoEncerrada}>
          {atualizandoCena ? 'Atualizando...' : 'Atualizar cena'}
        </Button>
        {controleTurnosAtivo ? (
          <>
            <Button
              variant="secondary"
              onClick={() => onControleTurno('VOLTAR')}
              disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
            >
              {acaoTurnoPendente === 'VOLTAR' ? 'Voltando...' : 'Voltar turno'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onControleTurno('PULAR')}
              disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
            >
              {acaoTurnoPendente === 'PULAR' ? 'Pulando...' : 'Pular turno'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onControleTurno('AVANCAR')}
              disabled={Boolean(acaoTurnoPendente) || sessaoEncerrada}
            >
              {acaoTurnoPendente === 'AVANCAR' ? 'Avancando...' : 'Avancar turno'}
            </Button>
          </>
        ) : null}
        <Button
          variant="destructive"
          onClick={onSolicitarEncerrarSessao}
          disabled={encerrandoSessao || sessaoEncerrada}
        >
          {encerrandoSessao
            ? 'Encerrando...'
            : sessaoEncerrada
              ? 'Sessao encerrada'
              : 'Encerrar sessao'}
        </Button>
      </div>
      {controleTurnosAtivo ? (
        <p className="text-xs text-app-muted">
          Atalhos: <span className="font-semibold">.</span> avancar |{' '}
          <span className="font-semibold">Shift + ,</span> voltar |{' '}
          <span className="font-semibold">Shift + /</span> pular.
        </p>
      ) : null}
    </SessionPanel>
  );
}

export type { AcaoControleTurno as AcaoControleTurnoMaster };
