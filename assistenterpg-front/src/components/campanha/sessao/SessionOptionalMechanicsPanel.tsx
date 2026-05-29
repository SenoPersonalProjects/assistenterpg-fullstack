'use client';

import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type {
  RegraOpcionalSessaoChave,
  RegrasOpcionaisSessao,
} from '@/lib/types';

const REGRAS_TOGGLE: Array<{
  chave: RegraOpcionalSessaoChave;
  label: string;
  detalhe: string;
}> = [
  {
    chave: 'INSPIRACAO',
    label: 'Pontos de Inspiração',
    detalhe: 'Controle aparece no card de cada personagem.',
  },
  {
    chave: 'ENCONTROS_SOCIAIS',
    label: 'Encontros Sociais Alternativos',
    detalhe: 'Barras aparecem em cena social e nos NPCs vinculados.',
  },
  {
    chave: 'ESCALADA_DADOS',
    label: 'Escalada de Dados',
    detalhe: 'Controle compacto aparece na iniciativa em combate.',
  },
  {
    chave: 'INICIATIVA_ALTERNADA',
    label: 'Iniciativa Alternada',
    detalhe: 'A ordem de iniciativa muda para o modo por lados.',
  },
  {
    chave: 'CONSUMIR_COM_CALMA',
    label: 'Consumir com Calma',
    detalhe: 'Habilita consumo automatizado no inventário da sessão.',
  },
];

type SessionOptionalMechanicsPanelProps = {
  regras?: RegrasOpcionaisSessao;
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  atualizandoChave?: string | null;
  onAtualizarRegra: (
    chave: RegraOpcionalSessaoChave,
    ativo: boolean,
  ) => Promise<void>;
};

export function SessionOptionalMechanicsPanel({
  regras,
  podeControlarSessao,
  sessaoEncerrada,
  atualizandoChave,
  onAtualizarRegra,
}: SessionOptionalMechanicsPanelProps) {
  return (
    <div className="rounded-2xl border border-app-border/50 bg-app-surface/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-app-primary">
            Mecânicas opcionais
          </h4>
          <p className="mt-1 text-xs font-medium leading-relaxed text-app-muted">
            Ative regras da sessão. Os controles aparecem no contexto correto da tela.
          </p>
        </div>
        <Badge color="gray" size="sm">
          Sessão
        </Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {REGRAS_TOGGLE.map((regraInfo) => {
          const regra = regras?.[regraInfo.chave];
          return (
            <label
              key={regraInfo.chave}
              className="flex items-start justify-between gap-3 rounded-xl border border-app-border/40 bg-app-card/70 p-3"
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-app-fg">
                  {regraInfo.label}
                </span>
                <span className="mt-1 block text-xs font-medium text-app-muted">
                  {regraInfo.detalhe}
                </span>
              </span>
              <Checkbox
                checked={regra?.ativo === true}
                onChange={(event) =>
                  void onAtualizarRegra(regraInfo.chave, event.target.checked)
                }
                disabled={
                  !podeControlarSessao ||
                  sessaoEncerrada ||
                  atualizandoChave === regraInfo.chave
                }
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
