'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import type { NpcAmeacaResumo } from '@/lib/types';
import { labelTipoNpc } from '@/lib/npc-ameaca/labels';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';

type AddNpcModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adicionando: boolean;
  sessaoEncerrada: boolean;
  npcsDisponiveis: NpcAmeacaResumo[];
  npcSelecionadoId: string;
  onNpcSelecionadoChange: (value: string) => void;
  nomeNpcCustomizado: string;
  onNomeNpcCustomizadoChange: (value: string) => void;
  iniciativaValor: string;
  onIniciativaValorChange: (value: string) => void;
  sanAtual: string;
  sanMax: string;
  eaAtual: string;
  eaMax: string;
  onSanAtualChange: (value: string) => void;
  onSanMaxChange: (value: string) => void;
  onEaAtualChange: (value: string) => void;
  onEaMaxChange: (value: string) => void;
};

export function AddNpcModal({
  isOpen,
  onClose,
  onConfirm,
  adicionando,
  sessaoEncerrada,
  npcsDisponiveis,
  npcSelecionadoId,
  onNpcSelecionadoChange,
  nomeNpcCustomizado,
  onNomeNpcCustomizadoChange,
  iniciativaValor,
  onIniciativaValorChange,
  sanAtual,
  sanMax,
  eaAtual,
  eaMax,
  onSanAtualChange,
  onSanMaxChange,
  onEaAtualChange,
  onEaMaxChange,
}: AddNpcModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar aliado ou ameaca na cena"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={adicionando}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={
              adicionando ||
              sessaoEncerrada ||
              npcsDisponiveis.length === 0 ||
              !npcSelecionadoId ||
              !iniciativaValor.trim()
            }
          >
            {adicionando ? 'Adicionando...' : 'Adicionar NPC'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-app-muted">
          Escolha a ficha e defina a iniciativa para inserir o NPC na cena.
        </p>

        <div className="rounded border border-app-border bg-app-surface p-3 space-y-3">
          <Select
            label="Ficha disponivel"
            value={npcSelecionadoId}
            onChange={(event) => onNpcSelecionadoChange(event.target.value)}
          >
            {npcsDisponiveis.length === 0 ? (
              <option value="">Nenhuma ficha encontrada</option>
            ) : null}
            {npcsDisponiveis.map((npcDisponivel) => (
              <option key={npcDisponivel.id} value={String(npcDisponivel.id)}>
                {textoSeguro(npcDisponivel.nome)} ({labelTipoNpc(npcDisponivel.tipo)})
              </option>
            ))}
          </Select>
          <Input
            label="Nome em cena (opcional)"
            value={nomeNpcCustomizado}
            onChange={(event) => onNomeNpcCustomizadoChange(event.target.value)}
            placeholder="Ex.: Taro (ferido)"
          />
          <p className="text-xs text-app-muted">
            Use o nome em cena para diferenciar aliados ou ameacas iguais.
          </p>
        </div>

        <div className="rounded border border-app-border bg-app-bg p-3 space-y-2">
          <p className="text-xs font-semibold text-app-fg">Iniciativa</p>
          <Input
            type="number"
            label="Valor inteiro"
            value={iniciativaValor}
            onChange={(event) => onIniciativaValorChange(event.target.value)}
            placeholder="Ex.: 18"
          />
        </div>

        <details className="rounded border border-app-border bg-app-surface p-3">
          <summary className="cursor-pointer text-xs font-semibold text-app-fg">
            Recursos opcionais (SAN / EA)
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input
              type="number"
              label="SAN atual"
              value={sanAtual}
              onChange={(event) => onSanAtualChange(event.target.value)}
              placeholder="Ex.: 12"
            />
            <Input
              type="number"
              label="SAN max"
              value={sanMax}
              onChange={(event) => onSanMaxChange(event.target.value)}
              placeholder="Ex.: 20"
            />
            <Input
              type="number"
              label="EA atual"
              value={eaAtual}
              onChange={(event) => onEaAtualChange(event.target.value)}
              placeholder="Ex.: 4"
            />
            <Input
              type="number"
              label="EA max"
              value={eaMax}
              onChange={(event) => onEaMaxChange(event.target.value)}
              placeholder="Ex.: 8"
            />
          </div>
          <p className="mt-2 text-[11px] text-app-muted">
            Deixe em branco para nao considerar SAN/EA neste NPC.
          </p>
        </details>
      </div>
    </Modal>
  );
}
