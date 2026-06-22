'use client';

import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { SessionSegmentedBar } from '@/components/campanha/sessao/SessionSegmentedBar';
import type { AlvoEncontroSocialSessao, UserErrorState } from '@/lib/types';

type SessionSocialTargetsPanelProps = {
  alvos: AlvoEncontroSocialSessao[];
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  erro?: UserErrorState | null;
  onAtualizarAlvo?: (
    alvo: AlvoEncontroSocialSessao,
    patch: Partial<AlvoEncontroSocialSessao>,
  ) => void;
};

export function SessionSocialTargetsPanel({
  alvos,
  podeControlarSessao,
  sessaoEncerrada,
  erro,
  onAtualizarAlvo,
}: SessionSocialTargetsPanelProps) {
  if (alvos.length === 0) return null;

  return (
    <SessionPanel
      title="Alvos sociais"
      subtitle="Interesse e paciência do encontro social atual."
      tone="main"
    >
      {erro ? <ErrorAlert message={erro} /> : null}
      <div className="session-social-targets">
        {alvos.map((alvo, index) => {
          const sucesso = alvo.interesseAtual >= 5;
          const falha = alvo.pacienciaAtual <= 0;
          return (
            <div key={alvo.id ?? `${alvo.nome}-${index}`} className="session-social-target">
              <div className="session-social-target__head">
                <div className="min-w-0">
                  <p className="session-social-target__name">{alvo.nome}</p>
                  <p className="session-social-target__hint">
                    {alvo.npcSessaoId ? 'NPC da cena' : 'Alvo manual'}
                  </p>
                </div>
                {sucesso ? (
                  <Badge color="green" size="sm">Sucesso</Badge>
                ) : falha ? (
                  <Badge color="red" size="sm">Falha</Badge>
                ) : null}
              </div>
              <div className="session-social-target__bars">
                <SessionSegmentedBar
                  label="Interesse"
                  value={alvo.interesseAtual}
                  tone="success"
                  canEdit={podeControlarSessao}
                  disabled={sessaoEncerrada}
                  onChange={(value) =>
                    onAtualizarAlvo?.(alvo, {
                      interesseAtual: Math.max(0, Math.min(5, value)),
                    })
                  }
                />
                <SessionSegmentedBar
                  label="Paciência"
                  value={alvo.pacienciaAtual}
                  tone="danger"
                  canEdit={podeControlarSessao}
                  disabled={sessaoEncerrada}
                  onChange={(value) =>
                    onAtualizarAlvo?.(alvo, {
                      pacienciaAtual: Math.max(0, Math.min(5, value)),
                    })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </SessionPanel>
  );
}
