'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import type { NpcAmeacaResumo } from '@/lib/types';

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
  textoSeguro: (value: string | null | undefined) => string;
  labelTipoNpc: (tipo: string) => string;
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
  textoSeguro,
  labelTipoNpc,
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
              !npcSelecionadoId
            }
          >
            {adicionando ? 'Adicionando...' : 'Adicionar na cena'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
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
          Dica: use o nome em cena para diferenciar aliados ou ameacas iguais na mesma rodada.
        </p>
      </div>
    </Modal>
  );
}
