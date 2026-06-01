'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
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
    label: 'Pontos de Inspiracao',
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
    detalhe: 'Habilita consumo automatizado no inventario da sessao.',
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
  const [modalAberto, setModalAberto] = useState(false);
  const totalAtivas = REGRAS_TOGGLE.reduce(
    (total, regraInfo) =>
      total + (regras?.[regraInfo.chave]?.ativo === true ? 1 : 0),
    0,
  );

  return (
    <div className="session-optional-mechanics">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-app-primary">
            Mecanicas opcionais
          </h4>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-app-muted">
            {totalAtivas} de {REGRAS_TOGGLE.length} ativas nesta sessao.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setModalAberto(true)}
          className="shrink-0 gap-2 font-black"
        >
          <Icon name="settings" className="h-4 w-4" />
          Configurar
        </Button>
      </div>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Mecanicas opcionais"
        size="lg"
      >
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app-border bg-app-card p-3">
            <div>
              <p className="text-sm font-black text-app-fg">
                Regras opcionais da sessao
              </p>
              <p className="text-xs font-semibold text-app-muted">
                Os controles aparecem no contexto correto depois de ativados.
              </p>
            </div>
            <Badge color={totalAtivas > 0 ? 'green' : 'gray'} size="sm">
              {totalAtivas} ativas
            </Badge>
          </div>

          {REGRAS_TOGGLE.map((regraInfo) => {
            const regra = regras?.[regraInfo.chave];
            const ativo = regra?.ativo === true;
            const atualizando = atualizandoChave === regraInfo.chave;
            const desabilitado =
              !podeControlarSessao || sessaoEncerrada || atualizando;

            return (
              <div key={regraInfo.chave} className="session-optional-mechanics__row">
                <span className="min-w-0">
                  <span className="block text-sm font-black text-app-fg">
                    {regraInfo.label}
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-relaxed text-app-muted">
                    {regraInfo.detalhe}
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ativo}
                  aria-label={`${ativo ? 'Desativar' : 'Ativar'} ${regraInfo.label}`}
                  disabled={desabilitado}
                  className={`session-optional-mechanics__switch${
                    ativo ? ' session-optional-mechanics__switch--on' : ''
                  }`}
                  onClick={() => void onAtualizarRegra(regraInfo.chave, !ativo)}
                >
                  <span className="session-optional-mechanics__switch-track">
                    <span className="session-optional-mechanics__switch-thumb" />
                  </span>
                  <span className="session-optional-mechanics__switch-label">
                    {atualizando ? 'Salvando' : ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
